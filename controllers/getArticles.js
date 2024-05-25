//Dans Node.js, 1 module = 1 fichier

const express = require("express");
const router = express.Router();

const { postAllArticles } = require("../model-doc");

//To GET the last 20 articles on the HomePage-----------
router.get("/homeArticles", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 16; // Get the 'limit' query parameter from the request or default to 20
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

// Generalized function to get articles by type (Donenr valeur à type dans router.get en-dessous)
const getArticlesByType = async (type, res) => {
  try {
    const articles = await postAllArticles.find({ type }).sort({ _id: -1 });
    articles
      ? res.json(articles)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error(`Error fetching ${type} articles from the database:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Route to GET articles with type:'Tableau'
router.get("/tableaux", (req, res) => getArticlesByType("Tableau", res));

// Route to GET articles with type:'Bijoux'
router.get("/bijoux", (req, res) => getArticlesByType("Bijoux", res));

// Route to GET articles with type:'Bijoux'
router.get("/decorations", (req, res) => getArticlesByType("Décoration", res));

// To GET ALL articles with all types: ne puet pas ce joindre avec getArticleByType car tous les types inclus
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

module.exports = router;
