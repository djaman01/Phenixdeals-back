const mongoose = require("mongoose");

//création d'un schema mongoose = structure "document", dans "collection" de la database "phenixArticles" dans MongoDB => Dans connect-db.js, on l'a connecté à la bonne database grace à la variable uri (voir .env file)
const allArticles = mongoose.Schema(
  {
    type: {
      type: String,
    },
    auteur: {
      type: String,
    },
    infoArticle: {
      type: String,
    },
    prix: {
      type: String,
    },
    etat: {
      type: String,
    },
    bestDeal: {
      type: String,
    },
    code: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
  },

  {
    timestamps: true, // Adds createdAt and updatedAt fields on the database
  },
);
////création modele : mongoose.model("collectionName", schema)
//On le stock dans postAllArticles pour pouvoir l'exporter
const postAllArticles = mongoose.model("allArticles", allArticles);

// Slider schema
const sliderSchema = mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true, // from Cloudinary
    },
    auteur: {
      type: String,
      required: true,
    },
    code: { //j'ai ajouté auteur et code pour pouvoir avoir un lien vers la fiche du tableau dont l'url se termine par /auteur/code
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const sliderModel = mongoose.model("sliders", sliderSchema);

//Modèle for Sign up and Login

const loginSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true, // Ensure email is unique
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "visitor",
    },
  },

  {
    timestamps: true,
  },
);
//role= le role de l'utilsateur / visitor par défaut ou admin par exemple

const loginModel = mongoose.model("logins", loginSchema);

module.exports = { postAllArticles, loginModel, sliderModel }; //Exportation et Destructuration de la variable pour pouvoir utilisé sa valeur en écrivant son nom
