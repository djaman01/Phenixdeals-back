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
    //Je veux créer 1 seul et unique lien pour chaque page d'artiste et plusieurs liens pour chaque fiche tableau
    const uniqueArtists = new Set(); // le Set est un tableau javascript qui ne prend pas les doublons par défaut. Grâce au set je pourrais conditionner l'ajout des url des page Artist pour qu'il n'y ait pas de doublons

    //DynamicLinks sera un Array contenant tous les liens dynamiques pour toutes les pages artistes (une seule par auteur) et pour chaque fiche tableau (plusieurs par auteur).
    //.flatmap: Comme on a des liens pour les pages Artists + liens pour ficheTableau; il permet d'applatir le résultat pour avoir un seul tableau, plutôt qu'un tableau contenant des sous-tableaux.
    const dynamicLinks = articles.flatMap((article) => {
      const links = []; //Une array vide se réinitialise pour chaque auteur et cette array Contiendra les dynamic Links crées

      //Vérifie si le Set ne contient pas déjà le nom d'un auteur donné
      if (!uniqueArtists.has(article.auteur)) {
        //Si l'auteur n'existe pas dans le set, on ajoute le lien de la pageArtist de l'auteur dans l'array Links.
        links.push({
          url: `/pageArtist/${encodeURIComponent(article.auteur)}`,
          changefreq: "weekly",
          priority: 0.8,
        });
        uniqueArtists.add(article.auteur); // Au final, on rajoute cet auteur au set, pour qu'il ne soit pas traité plusieurs fois et que sa pageArtist ne soit pas rajoutée plusieurs fois au sitemap
      }

      // Ajouter l'URL pour la fiche tableau dans l'array Links
      links.push({
        url: `/${encodeURIComponent(article.auteur)}/${article._id}`,
        changefreq: "yearly",
        priority: 0.7,
      });

      return links; //permet de remplir dynamicLinks avec les liens de chaque auteur (avec un seul lien pour la page de l'artiste et plusieurs pour les fiches de tableaux), avant de passer à l'auteur suivant.
    });

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
