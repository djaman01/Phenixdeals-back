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

    // Construction des liens: Crée un tableau contenant les URLs pour le sitemap et priority = importances des pages pour guider le robot google / Ne mettre que les pages qu'on veut voir dans les recherches google dans le sitemap

    // Liens pour les pages statiques: on dit statiques que leur url ne changent pas, même si pour certaines pages comme les pages accueil, artistes ou tableaux, leurs contenus changent régulièrement
    const staticLinks = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/allArtists", changefreq: "monthly", priority: 0.8 },
    ];

    // J'en ai besoin pour extraire l'auteur de chaque tableau et pouvoir le mettre dans l'url dynamique de pageArtist
    // On store notre modèle avec les properties dans la variable articles // .find({}): Récupère tous les articles dans la base de données: Mais que le champs "auteur" pour éviter trop de données
    const articles = await postAllArticles.find({}, "auteur").lean();

    // Liens pour les pages dynamiques: On dit dynamique car la fin de leur url change en fonction du nom de l'auteur de l'article
    const dynamicLinks = articles.map((article) => ({
      url: `/pageArtist/${encodeURIComponent(article.auteur)}`, // Encode l'auteur pour éviter les caractères spéciaux
      changefreq: "weekly", // La page change fréquemment
      priority: 0.9, // Priorité relative
    }));

    // Combiner les liens dynamiques et statiques
    const allLinks = [...staticLinks, ...dynamicLinks];

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
