const mongoose = require("mongoose");

//création d'un schema mongoose = structure "document", dans "collection" de la database "phenixArticles" dans MongoDB
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
  }
);
////création modele : mongoose.model("collectionName", schema)
//On le stock dans postAllArticles pour pouvoir l'exporter
const postAllArticles = mongoose.model("allArticles", allArticles);

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
  }
);
//role= le role de l'utilsateur / visitor par défaut ou admin par exemple

const loginModel = mongoose.model("logins", loginSchema);

module.exports = { postAllArticles, loginModel }; //Exportation et Destructuration de la variable pour pouvoir utilisé sa valeur en écrivant son nom
