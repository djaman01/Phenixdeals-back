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

// GET all articles for the DashBoard (newest first)
router.get("/allArticles", async (req, res) => {
  try {
    const allArticles = await postAllArticles.find().sort({ _id: -1 });

    if (!allArticles || allArticles.length === 0) {
      return res.status(404).json({ error: "No articles found" });
    }

    res.json(allArticles);
  } catch (error) {
    console.error("Error fetching articles:", error);
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

router.get("/allOeuvres", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit; //Pour skip les 20 dejà fetch et ne aps dupliquer

    const articles = await postAllArticles
      .find({
        type: { $in: ["Tableau", "Photographie", "Sculpture"] },
        $or: [{ prix: { $regex: "\\d" } }, { prix: "Prix sur Demande" }],
        prix: { $ne: "Vendu" },
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    res.json(articles);
  } catch (error) {
    console.error("Error fetching all oeuvres:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route: Fetch oeuvres with serverside Filtering + PAGINATION
router.get("/filterOeuvres", async (req, res) => {
  try {
    const { prixMin, prixMax } = req.query;

    //Pour changer les strings "3000" reçu du front-end en valeur numérique / : 0 et : 999999 => valeur par défaut de l'input si l'utilisateur n'écrit qu'un prix min ou qu'un prix max
    const min = prixMin ? Number(prixMin) : 0;
    const max = prixMax ? Number(prixMax) : 999999999;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit; //Pour skip les 20 dejà fetch et ne aps dupliquer

    //.agreggate([]) est une méthode Mongoose qui permet d'executer un .find() mais avec plusieurs conditions (donc pour permettre de filtrer)
    const articles = await postAllArticles.aggregate([
      {
        $match: {
          type: { $in: ["Tableau", "Photographie", "Sculpture"] },
          prix: { $regex: "\\d" }, //Match any string that contains a digit (0-9) so it excludes the one without digits
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
      { $sort: { numericPrice: 1 } },
      { $skip: skip }, // <-- Pagination: skip documents
      { $limit: limit }, // <-- Pagination: limit number of documents
    ]);

    res.json(articles);
  } catch (error) {
    console.error("Error filtering oeuvres:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// To GET only articles with bestDeal = "Yes"
router.get("/bestDeals", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit; //Pour skip les 20 dejà fetch et ne pas dupliquer

    const bestArticles = await postAllArticles
      .find({ bestDeal: "Yes" })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

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

router.get("/filterBestDeals", async (req, res) => {
  try {
    const { prixMin, prixMax } = req.query;

    const min = prixMin ? Number(prixMin) : 0;
    const max = prixMax ? Number(prixMax) : 999999999;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // Build the match object dynamically
    const match = {
      type: { $in: ["Tableau", "Photographie", "Sculpture"] },
      bestDeal: "Yes", //To apply the filter only with artciels that are bestDeals
    };

    const articles = await postAllArticles.aggregate([
      { $match: match },
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
      { $sort: { numericPrice: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.json(articles);
  } catch (error) {
    console.error("Error filtering oeuvres:", error);
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

router.get("/pageArtist/:auteur", async (req, res) => {
  try {
    const auteur = req.params.auteur;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const hasPriceFilter = req.query.prixMin || req.query.prixMax;
    const min = req.query.prixMin ? Number(req.query.prixMin) : 0;
    const max = req.query.prixMax ? Number(req.query.prixMax) : Infinity;

    const pipeline = [
      {
        $match: {
          auteur,
          type: { $in: ["Tableau", "Photographie", "Sculpture"] },
        },
      },
    ];

    // Only add price logic IF filtering is active
    if (hasPriceFilter) {
      pipeline.push(
        {
          $addFields: {
            numericPrice: {
              $cond: [
                { $regexMatch: { input: "$prix", regex: "\\d" } },
                {
                  $toDouble: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: "$prix",
                          find: "Dhs",
                          replacement: "",
                        },
                      },
                      find: " ",
                      replacement: "",
                    },
                  },
                },
                null,
              ],
            },
          },
        },
        {
          $match: {
            numericPrice: { $gte: min, $lte: max },
          },
        },
        { $sort: { numericPrice: 1 } },
      );
    } else {
      // Normal infinite scroll (newest first)
      pipeline.push({ $sort: { _id: -1 } });
    }

    pipeline.push({ $skip: skip }, { $limit: limit });

    const articles = await postAllArticles.aggregate(pipeline);

    res.json(articles);
  } catch (error) {
    console.error("Error fetching artist oeuvres:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//To GET toutes les oeuvres d'un artiste spécifique pour PageArtiste.jsx, avec infinite scroll si + de 20 oeuvres
router.get("/pageArtist/:auteur", async (req, res) => {
  try {
    const auteur = req.params.auteur;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit; //Pour skip les 20 dejà fetch et ne pas dupliquer

    const min = req.query.prixMin ? Number(req.query.prixMin) : 0;
    const max = req.query.prixMax ? Number(req.query.prixMax) : 999999999;

    const articles = await postAllArticles.aggregate([
      {
        $match: {
          auteur,
          type: { $in: ["Tableau", "Photographie", "Sculpture"] },
        },
      },
      {
        $addFields: {
          numericPrice: {
            $toDouble: {
              $replaceAll: {
                input: {
                  $replaceAll: {
                    input: "$prix",
                    find: "Dhs",
                    replacement: "",
                  },
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
      { $sort: { numericPrice: 1 } }, // sort by price
      { $skip: skip },
      { $limit: limit },
    ]);

    res.json(articles);
  } catch (error) {
    console.error("Error fetching artist oeuvres:", error);
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
