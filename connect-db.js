//Code pour se connecter à la database avec mongoose et en utilisant le login dans .env
//J'ai installé npm dotenv pour pouvoir utilisé ce qui est écrit dans .env

const mongoose = require('mongoose');
require('dotenv').config();

// Read MongoDB connection URI from environment variable
const uri = process.env.ATLAS_URI;

//This code uses the mongoose.connect method to establish a connection to the MongoDB database using the provided URI. 
const connexion = mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

//exports "la variable connexion" pour que les autres modules puissent l'utiliser
//"connexion" store le résultat de si on est connécté ou pas à mongoDB
//Si connecté => connected to Mongo DB sinon => Error connecting to MongoDB
module.exports = connexion;
