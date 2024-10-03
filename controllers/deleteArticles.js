const express = require("express");
const router = express.Router();
const cloudinaryConfig = require('../cloudinary'); // Ensure you import your Cloudinary configuration
const { postAllArticles } = require("../model-doc");



const deleteImageFromCloudinary = async (imageUrl) => {
  // Extract the public ID including the folder: le public id est le nombre juste avant .jpg de l'imageUrl dans la database mongoDBAtlas
  const publicId = `phenixArticles/${imageUrl.split('/').pop().split('.')[0]}`; 
  console.log('Extracted Public ID:', publicId); // Log the public ID for debugging
  
  try {
    const result = await cloudinaryConfig.uploader.destroy(publicId);
    console.log('Cloudinary deletion result:', result); // Log the result to understand if the deletion was successful
    if (result.result !== "ok") {
      console.error('Failed to delete image from Cloudinary:', result);
    } else {
      console.log('Image deleted successfully from Cloudinary:', imageUrl);
    }
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
  }
};



// Route DELETE pour supprimer un article et l'image associée
router.delete('/deleteArticle/:articleId', async (req, res) => {
  try {
    const articleId = req.params.articleId;

    // Trouver l'article pour obtenir l'URL de l'image avant de le supprimer
    const article = await postAllArticles.findById(articleId);

    if (article) {
      // Si l'article a une image associée, la supprimer de Cloudinary
      if (article.imageUrl) {
        await deleteImageFromCloudinary(article.imageUrl);
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
