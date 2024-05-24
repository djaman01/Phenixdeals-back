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

// To GET articles with type:'Tableau'
router.get("/tableaux", async (req, res) => {
  try {
    const tableaux = await postAllArticles
      .find({ type: "Tableau" })
      .sort({ _id: -1 });

    tableaux
      ? res.json(tableaux)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET articles with type:'Decorations'
router.get("/decorations", async (req, res) => {
  try {
    const decorations = await postAllArticles
      .find({ type: "Décoration" })
      .sort({ _id: -1 });

    decorations
      ? res.json(decorations)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET articles with type:'Bijoux'
router.get("/bijoux", async (req, res) => {
  try {
    const bijoux = await postAllArticles
      .find({ type: "Bijoux" })
      .sort({ _id: -1 });

    bijoux
      ? res.json(bijoux)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET ALL articles with all types
router.get("/allArticles", async (req, res) => {
  try {
    const allArticles = await postAllArticles
      .find()
      .sort({ _id: -1 });

    allArticles
      ? res.json(allArticles)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
