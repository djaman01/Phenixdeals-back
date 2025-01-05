const express = require("express");
const router = express.Router();

//SitemapStream : Crée le flux pour générer le sitemap XML. streamToPromise : Convertit le flux en une promesse pour obtenir le résultat final.
const { SitemapStream, streamToPromise } = require("sitemap");

//Readable : Transforme un tableau d'URLs en un flux lisible.
const { Readable } = require("stream");
const { postAllArticles } = require("../model-doc");

// Route pour générer le sitemap à partir du back-end
//Pour y accéder aller sur le lien: https://phenixdeals-back.onrender.com/sitemap.xml (url trouvé sur render)
router.get("/sitemap.xml", async (req, res) => {
  try {
    // Configuration des en-têtes pour indiquer qu'il s'agit d'un fichier XML
    res.header("Content-Type", "application/xml");

    // On store notre modèle avec les properties dans la variable articles // .find({}): Récupère tous les articles dans la base de données "code": Mais que le champ "code" pour éviter trop de données
    // Retourne des objets JavaScript simples pour optimiser les performances pour la lecture
    const articles = await postAllArticles.find({}, "auteur _id").lean(); //pas de , entre auteur et _id car ce n'est pas une array, mais une chaine de carctère avec une liste de champs séparés par des espaces

    // Construction des liens: Crée un tableau contenant les URLs pour le sitemap et priority = importances des pages pour guider le robot google

    // Liens pour les pages statiques: on dit statiques que leur url ne changent pas, même si pour certaines pages comme les pages accueil, artistes ou tableaux, leurs contenus changent régulièrement
    const staticLinks = [{ url: "/", changefreq: "daily", priority: 1.0 }];

    // Liens pour les pages dynamiques: On dit dynamique car la fin de leur url change en fonction du nom de l'auteur ou de l'_id de l'article
    const dynamicLinks = articles.flatMap((article) => [
      {
        url: `/pageArtist/${encodeURIComponent(article.auteur)}`, // Encode l'auteur pour éviter les caractères spéciaux
        changefreq: "weekly", // La page change fréquemment
        priority: 0.8, // Priorité relative (impossible de mettre 0.75 ou 0.85, car ca ve etre considéré comme 0.8 ou 0.9)
      },
      {
        url: `/${encodeURIComponent(article.auteur)}/${article._id}`, //Utilisation de l'url et non la route /article
        changefreq: "yearly", // La page change rarement
        priority: 0.7, // Priorité relative pour expliquer au google bot comment classer les pages entre elles dans le site et la fréquence de crawl; mais ne garanti pas une meilleure position dans les résultats de recherches
      },
    ]);

    // Combiner les liens dynamiques et statiques
    const allLinks = [...staticLinks, ...dynamicLinks];

    //!!!!! Quand des pages de siets ne contiennent aps beaucoup de texte ou de liens vers 'autres pages de site, le google bot peut les considérer commeu ne erreur "Soft 404" et ne pas les indéxer
    //Donc comme mes pages Artistes ne contiennent aps beaucoup de text, ca fait en general erreur Soft404 et google bot priorise les fichesTableaux car elles contiennt du text, des liens et plus d'infos.
    //C'est pourquopi je mets les ficheTableaux en 0.75, pour les laisser prioritaires, vu que par défauts, le google bot les priorisent par rapport aux pages atistes, au vu de leur contenu

    // Création du sitemap avec SitemapStream
    const stream = new SitemapStream({
      hostname: "https://www.phenix-deals.com/",
    }); // Ton domaine principal

    //Création du sitemap final: Convertit le flux en une promesse pour obtenir le sitemap final.
    const sitemap = await streamToPromise(Readable.from(allLinks).pipe(stream)); //readable.from(allLinks)  transforme les liens en un flux lisible.

    res.send(sitemap.toString()); // Retourne le sitemap XML au client
  } catch (error) {
    console.error("Erreur lors de la génération du sitemap :", error);
    res.status(500).send("Erreur serveur lors de la génération du sitemap");
  }
});

module.exports = router;
