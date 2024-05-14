//Fichier pour handle les POST request de produits avec image

//Dans node.js 1 module = 1fichier .js

//On installe express et on utilise express.Router, pour définir des routes pour une partie du code et au final, l'exporter pour pouvoir l'utiliser ailleurs
const express = require('express');
const router = express.Router(); //on n'utilise pas juste express(), car on veut exporter des routes ailleurs

const multer = require('multer');
const path = require('path');
const { postAllArticles } = require('../model-doc')//on destructure les differents models

// Configuration de multer pour le stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route POST pour créer un nouveau produit
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Récupération de l'URL de l'image téléchargée
    const imageUrl = req.file.path.replace(/\\/g, '/');

    // Récupération des autres données du produit depuis le corps de la requête
    const { type, auteur, infoArticle, prix, etat, code } = req.body;

    // Création d'un nouveau produit dans la base de données
    const newProduct = await postAllArticles.create({type, auteur, infoArticle, prix, etat, code, imageUrl });

    //serveur envoi une reponse json, avec le nouveau produit crée au front-end: pour le voir faire dans le front-end console.log(response.data) / reponse etant le nom de la variable qui contient le axios.post dans le front
    res.json(newProduct);
  } catch (error) {
    // Gestion des erreurs
    console.error('Erreur lors de la création du produit :', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit.' });
  }
});

//pour pouvoir accéder router.post() dans server.js quand on va exporter postProduct.js
module.exports = router;


