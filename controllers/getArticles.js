//Dans Node.js, 1 module = 1 fichier

const express = require("express");
const router = express.Router();

const { postAllArticles, sliderModel } = require("../model-doc");

const cloudinaryConfig = require("../cloudinary");

//Function used to resize images from cloudinary: so that we send to the front-end: small images for card grids, and original images for fiche tableau and improve the performances of the website
//The value of the parameter will be an article in the database with all it's properties (type, imagePublicId, description...)
const formatArticleImage = (article) => {
  if (!article) return article; //return article instead of just return, so that we'll have null instead of undefined if no article in the value of the parameter

  //use the stored publicID of the cloudinary URL if available, else extract it from the old property imageUrl
  const publicId =
    article.imagePublicId ||
    (article.imageUrl
      ? article.imageUrl
          .split("/upload/")[1] // split l'url du dossier ou se situe l'image en 2 ["https://res.cloudinary.com/phenixdeals/image", "v1769872586/phenixSlider/dzz867q2zbafudwclss2.jpg"] / [1] permet de cibler la 2eme partie de l'url du dossier
          .split(".")[0] //Removes .jpg
          .replace(/^v\d+\//, "") //removes v1769872586/ => so that the final result will be nameOfFolder/pulicID which is the correct publicId ex: phenixSlider/dzz867q2zbafudwclss2
      : null);

  if (!publicId) return article;

  return {
    ...article, //keep all original properties of each article + add 2 new properties imageCard (Small images that we'll use for card grid) and imageOriginal (big image that we'll use for fiche tableau)
    imageCard: cloudinaryConfig.url(publicId, {
      width: 600, //To decide how much px, we see the width of the element that receive the image and we multiply it by 2 (here it's 287px with x 2 so 574px => 600px)
      quality: "auto",
      fetch_format: "auto",
    }),
    imageOriginal: cloudinaryConfig.url(publicId, {
      width: 1500, //To decide how much px, we see the width of the element that receive the image and we multiply it by 2 (here it's 720px with x 2 so 1440px => 1500px
      crop: "limit", //Do not crop and keep aspect ratio
      quality: "auto",
      fetch_format: "auto",
    }),
    imageSlider: cloudinaryConfig.url(publicId, {
      width: 1800, //i defined w-[900px] for the slider so 900x2 = 1800px
      crop: "limit",
      quality: "auto",
      fetch_format: "auto",
    }),
  };
};

//To GET the last 20 articles on the HomePage-----------
router.get("/homeArticles", async (req, res) => {
  //function asynchrone donc il y aura await = attend que le code avec await soit terminée pour continuer l'éxécution du code
  try {
    const limit = parseInt(req.query.limit) || 20; // Get the 'limit' query parameter from the request or default to 20
    const homeArticles = await postAllArticles
      .find()
      .sort({ _id: -1 })
      .limit(limit) // Sort by _id in descending order to get the last 20 Articles
      .lean(); //To transform Mongoose object to plain Javascript objects, so that we can use them in array functions

    //For each article we keep all it's properties and add 2 images (small for card grid and big for fiche tableau) with the function formatArticleImage
    const articlesWithNewImages = homeArticles.map(
      (e) => formatArticleImage(e), //formatArticleImage(e) works without .toObject() thanks to .lean()
    );

    res.json(articlesWithNewImages); // !!! res.json() OBLIGé Pour envoyer la data au front-end : On envoie l'article avec toutes ses properties + les 2 images qu'on a ajouté
  } catch (error) {
    console.error("Error fetching articles from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET all articles for the DashBoard (newest first)
router.get("/allArticles", async (req, res) => {
  try {
    const dashboardArticles = await postAllArticles
      .find()
      .sort({ _id: -1 })
      .lean();

    if (!dashboardArticles || dashboardArticles.length === 0) {
      return res.status(404).json({ error: "No articles found" });
    }

    const articlesWithNewImages = dashboardArticles.map((e) =>
      formatArticleImage(e),
    );

    res.json(articlesWithNewImages);
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

//Page qui montre toutes les oeuvres disponibles
router.get("/allOeuvres", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit; //Pour skip les 20 dejà fetch et ne aps dupliquer

    const allOeuvres = await postAllArticles
      .find({
        type: { $in: ["Tableau", "Photographie", "Sculpture"] },
        $or: [{ prix: { $regex: "\\d" } }, { prix: "Prix sur Demande" }],
        prix: { $ne: "Vendu" },
      })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const articlesWithNewImages = allOeuvres.map((e) => formatArticleImage(e));

    res.json(articlesWithNewImages);
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

    //.aggregate([]) returns plain JS OBject so no need to add .lean() / .aggregate est une méthode Mongoose qui permet d'executer un .find() mais avec plusieurs conditions (donc pour permettre de filtrer)
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

    const articlesWithNewImages = articles.map((e) => formatArticleImage(e));

    res.json(articlesWithNewImages);
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

    const bestDeals = await postAllArticles
      .find({ bestDeal: "Yes" })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const articlesWithNewImages = bestDeals.map((e) => formatArticleImage(e));

    res.json(articlesWithNewImages);
  } catch (error) {
    console.error("Error fetching best deals:", error);
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

    const articles = await postAllArticles.aggregate([
      {
        $match: {
          type: { $in: ["Tableau", "Photographie", "Sculpture"] },
          bestDeal: "Yes",
        },
      },
      {
        $addFields: {
          numericPrice: {
            $convert: {
              input: {
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
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { numericPrice: { $gte: min, $lte: max } },
            { prix: { $in: ["Vendu", "Prix sur Demande"] } },
          ],
        },
      },
      {
        $addFields: {
          sortOrder: {
            $cond: [{ $eq: ["$numericPrice", null] }, 1, 0],
          },
        },
      },
      { $sort: { sortOrder: 1, numericPrice: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const articlesWithNewImages = articles.map((e) => formatArticleImage(e));

    res.json(articlesWithNewImages);
  } catch (error) {
    console.error("Error filtering best deals:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//To GET 1 product for ficheTableau.jsx in the front-end
router.get("/article/:code", async (req, res) => {
  try {
    const codeParam = req.params.code; //On extrait le paramètre dynamique définit dans l'url
    const articleFicheTableau = await postAllArticles
      .findOne({ code: codeParam })
      .lean(); //On cherche 1 produit spécifique grâce à _id extrait du paramètre de l'url et stocké dans la variable articleId

    if (!articleFicheTableau) {
      return res.status(404).json({ error: "Article not found" });
    }

    //Here we reqquest 1 signle article, so there is no .map
    const articlesWithNewImages = formatArticleImage(articleFicheTableau);

    res.json(articlesWithNewImages);
  } catch (error) {
    console.error("Error fetching the article from the database:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//To GET toutes les oeuvres d'un artiste spécifique pour PageArtiste.jsx, avec infinite scroll si + de 20 oeuvres
router.get("/pageArtist/:auteur", async (req, res) => {
  try {
    const auteur = req.params.auteur;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

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
            $convert: {
              input: {
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
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { numericPrice: { $gte: min, $lte: max } },
            { prix: { $in: ["Vendu", "Prix sur Demande"] } },
          ],
        },
      },
      {
        $addFields: {
          sortOrder: {
            $cond: [{ $eq: ["$numericPrice", null] }, 1, 0],
          },
        },
      },
      { $sort: { sortOrder: 1, numericPrice: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const articlesWithNewImages = articles.map((e) => formatArticleImage(e));

    res.json(articlesWithNewImages);
  } catch (error) {
    console.error("Error fetching artist oeuvres:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// GET all slider images
router.get("/slider", async (req, res) => {
  try {
    const sliderImages = await sliderModel.find().sort({ createdAt: 1 }).lean(); //createdAt: 1 => Chaque image à une property createdAt et je met 1 pour que l'ordre d'apparition des images dans le diaporama, soit l'ordre d'ajout: De la plus ancienne ajoutée en 1er à la plus récente en dernier

    const articlesWithNewImages = sliderImages.map((e) =>
      formatArticleImage(e),
    );

    res.json(articlesWithNewImages); // Send all slider documents (image URL + auteur + timestamps) to the front-end
  } catch (error) {
    console.error("Error fetching slider images:", error);
    res.status(500).json({ error: "Error fetching slider images" });
  }
});

module.exports = router;
