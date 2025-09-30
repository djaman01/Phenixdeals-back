//Dans Node.js, 1 module = 1 fichier

const express = require("express");
const router = express.Router();

const { postAllArticles, sliderModel } = require("../model-doc");

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
        { auteur: 1, _id: 0 },
      )
      .sort({ auteur: 1 });

    // Utilisation du constructeur Set pour crée une array avec les noms des auteurs, SANS DOUBLONS ! Ainsi, même si j'ajoute plusieurs Kalmoun je n'aurais que 1 [Kalmoun]
    const uniqueArtists = [...new Set(allArticles.map((e) => e.auteur))];

    // Transforme uniqueArtists = ["Kalmoun", "Gbouri"]; en un tableau d'objets en response=[{auteur:"Kalmoun"}, {auteur:"Gbouri"}], car le front-end en a besoin pour reconnaitre les valeurs grâce à la property auteur ex: {e.auteur}
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
router.get("/oeuvres", async (req, res) => {
  try {
    const articles = await postAllArticles
      .find({
        type: { $in: ["Tableau", "Photographie", "Sculpture"] }, //$in is a MongoDB operator that matches any value in the given array. = So, it'll return all articles whose type = one of those three values
      })
      .sort({ _id: -1 });

    articles.length
      ? res.json(articles)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching oeuvre articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/oeuvres", async (req, res) => {
  try {
    const { prixMin, prixMax } = req.query;

    const min = prixMin ? Number(prixMin) : 0;
    const max = prixMax ? Number(prixMax) : 999999999;

    const articles = await postAllArticles.aggregate([
      {
        $match: {
          type: { $in: ["Tableau", "Photographie", "Sculpture"] },
          prix: { $regex: "\\d" }, // Keep only prix that contain digits
        },
      },
      {
        $addFields: {
          numericPrice: {
            $toDouble: {
              $replaceAll: {
                input: {
                  $replaceAll: { input: "$prix", find: "Dhs", replacement: "" },
                },
                find: " ",
                replacement: "",
              },
            },
          },
        },
      },
      {
        $match: {
          numericPrice: { $gte: min, $lte: max },
        },
      },
      { $sort: { numericPrice: 1 } }, // Sort ascending by price
    ]);

    articles.length
      ? res.json(articles)
      : res.status(404).json({ error: "Articles not found" });
  } catch (error) {
    console.error("Error fetching oeuvre articles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET only articles with bestDeal = "Yes"
router.get("/bestDeals", async (req, res) => {
  try {
    const bestArticles = await postAllArticles
      .find({ bestDeal: "Yes" })
      .sort({ _id: -1 });
    bestArticles
      ? res.json(bestArticles)
      : res.status(404).json({ error: "No best deal articles found" });
  } catch (error) {
    console.error(
      "Error fetching best deal articles from the database:",
      error,
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//To GET 1 product for ficheTableau.jsx in the front-end
router.get("/article/:code", async (req, res) => {
  try {
    const code = req.params.code; //On extrait le paramètre dynamique définit dans l'url
    const article = await postAllArticles.findOne({ code: code }); //On cherche 1 produit spécifique grâce à _id extrait du paramètre de l'url et stocké dans la variable articleId

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
    const oeuvreAuteur = await postAllArticles.find({ auteur: auteur });

    oeuvreAuteur
      ? res.json(oeuvreAuteur)
      : res.status(404).json({ error: "Oeuvres not found" });
  } catch (error) {
    console.error("Error fetching the oeuvres from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all slider images
router.get("/slider", async (req, res) => {
  try {
    const sliderImages = await sliderModel.find().sort({ createdAt: 1 }); //createdAt: 1 => Chaque image à une property createdAt et je met 1 pour que l'ordre d'apparition des images dans le diaporama, soit l'ordre d'ajout: De la plus ancienne ajoutée en 1er à la plus récente en dernier
    res.json(sliderImages); // Send all slider documents (image URL + auteur + timestamps) to the front-end
  } catch (error) {
    console.error("Error fetching slider images:", error);
    res.status(500).json({ error: "Error fetching slider images" });
  }
});

module.exports = router;
