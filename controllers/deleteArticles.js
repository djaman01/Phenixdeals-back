const express = require("express");
const router = express.Router();

const fs = require('fs');
const path = require('path');
const { postAllArticles } = require("../model-doc");

// Fonction pour supprimer l'image du serveur (au début le serveur c'est mon pc et l'image est stocké dans le dossier uploads localement)
const deleteImage = (imageUrl) => {
  const filePath = path.join(__dirname, '..', imageUrl); // Chemin complet vers l'image
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de la suppression du fichier :', err);
    } else {
      console.log('Fichier supprimé avec succès :', imageUrl);
    }
  });
};

// Route DELETE pour supprimer un article et l'image associée
router.delete('/deleteArticle/:articleId', async (req, res) => {
  try {
    const articleId = req.params.articleId;

    // Trouver l'article pour obtenir l'URL de l'image avant de le supprimer
    const article = await postAllArticles.findById(articleId);

    if (article) {
      // Si l'article a une image associée, la supprimer du serveur
      if (article.imageUrl) {
        deleteImage(article.imageUrl);
      }

      // Supprimer l'article de la base de données
      const deletedArticle = await postAllArticles.findByIdAndDelete(articleId);

      res.status(200).json({ message: 'server says: Article deleted successfully', deletedArticle });
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article :', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
