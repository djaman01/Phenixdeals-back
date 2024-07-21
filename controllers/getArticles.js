//Dans Node.js, 1 module = 1 fichier

const express = require("express");
const router = express.Router();

const { postAllArticles } = require("../model-doc");

//To GET the last 20 articles on the HomePage-----------
router.get("/homeArticles", async (req, res) => {
  //function asynchrone donc il y aura await = attend que le code avec await soit terminée pour continuer l'éxécution du code
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

// To GET unique artist names qui sont représenté par "auteur" (pour ne pas avoir de voublons quand on ajoute plusieurs fois un artiste dans al abse de donnée)
router.get("/allArtists", async (req, res) => {
  try {
    // Récupère tous les documents
    const allArticles = await postAllArticles //await = attend que .find soit terminée avant de continuer l'éxécution du code / c'est pourquoi on a fait async dans cette fonction car elle est asynchrone
      .find({type:"Tableau"}, { auteur: 1, _id: 0 }) //On ne veut que les document de type "Tableau" + 2nd argument de .find est appelé projection: 1er paramètre= champ à inclure dans les résultats (car in ne veut fetch que le nom de l'artiste) + 2eme paramètre= champ à exclure des résultats /pour Limiter les données récupérés aux champs 'auteur' et améliorer la rapidité, même si après on va encore créer une collection qu'avec auteur et sans doublons
      .sort({ auteur: 1 }); //Trie les documents par "auteur" et en ordre croissant

    // Utilisation du constructeur Set pour crée une array avec les noms des auteurs, SANS DOUBLONS ! Ainsi, même si j'ajoute plusieurs Kalmoun je n'aurais que 1 [Kalmoun]
    const uniqueArtists = [...new Set(allArticles.map((e) => e.auteur))];

    // Transforme uniqueArtists = ["Kalmoun", "Gbouri"]; en un tableau d'objets en response=[{auteur:"Kalmoun"}, {auteur:"Gbouri"}], car le front-end en a besoin pour reconnaitre les valeurs grâce à la property auteur ex: {e.auteur}
    const response = uniqueArtists.map((e) => ({ auteur: e }));

    response
      ? res.json(response)
      : res.status(404).json({ error: "Artists names not found" });
  } catch (error) {
    console.error("Error fetching artists names from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Generalized function to get articles by type (Donner valeur à type dans router.get en-dessous)
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

//To GET 1 product for ficheArticle.jsx in the front-end
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

module.exports = router;
