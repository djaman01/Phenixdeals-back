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

    // On store notre modèle avec les properties dans la variable articles: We get only 2 fields (auteur and updatedAt) for each document
    const articles = await postAllArticles.find({}, "auteur updatedAt").lean();

    // Construction des liens: Crée un tableau contenant les URLs pour le sitemap et priority = importances des pages pour guider le robot google

    // Liens pour les pages statiques: on dit statiques que leur url ne changent pas, même si pour certaines pages comme les pages accueil, artistes ou tableaux, leurs contenus changent régulièrement
    const staticLinks = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/allArtists", changefreq: "weekly", priority: 0.7 },
      { url: "/oeuvres", changefreq: "weekly", priority: 0.7 },
      { url: "/bestDeals", changefreq: "monthly", priority: 0.6 },
      { url: "/concept", changefreq: "yearly", priority: 0.6 },
    ];

    // Dynamic links: 1 sitemap url per Artist, with the Most Recent update date for that artist
    const artistMap = new Map(); // Creating an empty map, which is like an object key=>value / "auteur":updatedAt

    // Loop through all articles
    articles.forEach((article) => {
      const current = artistMap.get(article.auteur); //Check if the artist is already stored =>Return the value stored for auteur which is updated At

      //If the artist is not stored yet (!current) OR the new article is more recent => Update the Map
      if (!current || article.updatedAt > current) {
        artistMap.set(article.auteur, article.updatedAt); //.set is used to add or update a value inside a Map => Store or Update this arist / key= auteurName value= updatedAt
      }
    });

    // Build sitemap links from the Map
    const dynamicLinks = Array.from(artistMap.entries()).map(
      ([auteur, lastUpdate]) => ({
        url: `/pageArtist/${encodeURIComponent(auteur)}`, // Artist page URL
        changefreq: "weekly", // Page changes regularly
        priority: 0.9, // High importance
        lastmod: new Date(lastUpdate).toISOString(), // Real last modification date
      }),
    );

    // Combiner les liens dynamiques et statiques
    const allLinks = [...staticLinks, ...dynamicLinks];

    //!!!!! Quand des pages de siets ne contiennent aps beaucoup de texte ou de liens vers 'autres pages de site, le google bot peut les considérer commeu ne erreur "Soft 404" et ne pas les indéxer
    //Donc comme mes pages Artistes ne contiennent aps beaucoup de text, ca fait en general erreur Soft404: Je vais donc ajouter les biographies des artistes

    // Création du sitemap avec SitemapStream
    const stream = new SitemapStream({
      hostname: "https://www.phenixdeals.com",
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
