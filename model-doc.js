const mongoose = require("mongoose");

//création d'un schema mongoose = structure "document", dans "collection" de la database "phenixArticles" dans MongoDB
const allArticles = mongoose.Schema(
  {
    type: "string",
    auteur: "string",
    infoArticle: "string",
    prix: "string",
    etat: "string",
    code: "string",
    imageUrl: "string"
  },

  {
    timestamps: true,
  }
);
//créeation d'un model à partir du schéma crée précedemment avec mongoose.model("collectionName", schema)
//On stocke ce modèle dans la variable postAllArticles pour être utilisé plus facilement
const postAllArticles = mongoose.model('allArticles', allArticles)

module.exports = {postAllArticles}; //Exportation et Destructuration de la variable pour pouvoir utilisé sa valeur en écrivant son nom
