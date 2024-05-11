//Fichier pour handle les POST Requests

//On installe express et on utilise express.Router, pour définir des routes pour une partie du code et l'utiliser dans d'autres fichier avec router.post par exemple au lieu de app.post
const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const { postAllProduct } = require('../model-doc');

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
    const { type, infoProduit, auteur, prix, etat, code } = req.body;

    // Création d'un nouveau produit dans la base de données
    const newProduct = await postAllProduct.create({ imageUrl, type, infoProduit, auteur, prix, etat, code });

    // Réponse avec le nouveau produit créé
    res.json(newProduct);
  } catch (error) {
    // Gestion des erreurs
    console.error('Erreur lors de la création du produit :', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit.' });
  }
});

//Dans node.js, 1 fichier = 1 module / module.exports permet d'exporter un certain code d'un module = d'un fichier
//exportation du routeur crée, pour pouvoir l'utiliser dans d'autres fichiers
module.exports = router;
