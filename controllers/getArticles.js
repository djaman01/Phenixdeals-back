//Dans Node.js, 1 module = 1 fichier

const express = require("express");
const router = express.Router();

const { postAllArticles } = require("../model-doc");

//To GET the last 20 articles on the HomePage-----------
router.get("/homeArticles", async (req, res) => {
  //function asynchrone donc il y aura await = attend que le code avec await soit terminée pour continuer l'éxécution du code
  try {
    const limit = parseInt(req.query.limit) || 20; // Get the 'limit' query parameter from the request or default to 20
    const postArticles = await postAllArticles
      .find()
      .sort({ _id: -1 })
      .limit(limit); // Sort by _id in descending order to get the last 20 Articles
    res.json(postArticles); // !!! res.json() OBLIGé Pour envoyer la data au front-end
  } catch (error) {
    console.error("Error fetching articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET unique artist names qui sont représenté par "auteur" (pour ne pas avoir de voublons quand on ajoute plusieurs fois un artiste dans al abse de donnée)
router.get("/allArtists", async (req, res) => {
  try {
    // Récupère tous les documents de type "Tableau", "Photographie" ou "Sculpture"
    const allArticles = await postAllArticles
      .find(
        { type: { $in: ["Tableau", "Photographie", "Sculpture"] } }, //$in is a MongoDB operator that matches any value in the given array. = So, it'll return all articles whose type = one of those three values
        { auteur: 1, _id: 0 }
      )
      .sort({ auteur: 1 });

    const uniqueArtists = [...new Set(allArticles.map((e) => e.auteur))];
    const response = uniqueArtists.map((e) => ({ auteur: e }));

    response.length
      ? res.json(response)
      : res.status(404).json({ error: "Artists names not found" });
  } catch (error) {
    console.error("Error fetching artists names from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Route Handler to get all articles which type are either Tableau, Photographie or Sculpture
router.get("/oeuvre", async (req, res) => {
  try {
    const articles = await postAllArticles.find({
      type: { $in: ["Tableau", "Photographie", "Sculpture"] } //$in is a MongoDB operator that matches any value in the given array. = So, it'll return all articles whose type = one of those three values
    }).sort({ _id: -1 });

    articles.length
      ? res.json(articles)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching oeuvre articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET ALL articles with all types: ne peut pas ce joindre avec getArticleByType car tous les types inclus
router.get("/allArticles", async (req, res) => {
  try {
    const allArticles = await postAllArticles.find().sort({ _id: -1 });

    allArticles
      ? res.json(allArticles)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET only articles with bestDeal = "Yes"
router.get("/bestDeals", async (req, res) => {
  try {
    const bestArticles = await postAllArticles.find({ bestDeal: "Yes" }).sort({ _id: -1 });
    bestArticles
      ? res.json(bestArticles)
      : res.status(404).json({ error: "No best deal articles found" });
  } catch (error) {
    console.error("Error fetching best deal articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//To GET 1 product for ficheTableau.jsx in the front-end
router.get("/article/:articleId", async (req, res) => {
  try {
    const articleId = req.params.articleId; //On extrait le paramètre dynamique définit dans l'url et qui est = _id, et on le store dans la variable articleId
    const article = await postAllArticles.findById(articleId); //On cherche 1 produit spécifique grâce à _id extrait du paramètre de l'url et stocké dans la variable articleId

    article
      ? res.json(article)
      : res.status(404).json({ error: "Article not found" });
  } catch (error) {
    console.error("Error fetching the article from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//To GET toutes les oeuvres d'un artiste spécifique pour PageArtiste.jsx
router.get("/pageArtist/:auteur", async (req, res) => {
  try {
    const auteur = req.params.auteur; 
    const oeuvreAuteur = await postAllArticles.find({auteur:auteur});

    oeuvreAuteur
      ? res.json(oeuvreAuteur)
      : res.status(404).json({ error: "Oeuvres not found" });
  } catch (error) {
    console.error("Error fetching the oeuvres from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
