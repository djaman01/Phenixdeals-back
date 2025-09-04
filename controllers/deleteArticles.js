const express = require("express");
const router = express.Router();
const cloudinaryConfig = require('../cloudinary'); // Ensure you import your Cloudinary configuration
const { postAllArticles, sliderModel } = require("../model-doc");


//Delete an image from phenixArticles folder on cloudinary
const deleteImageFromCloudinary = async (imageUrl) => {
  // Extract the public ID including the folder: le public id est le nombre juste avant .jpg de l'imageUrl dans la database mongoDBAtlas
  const publicId = `phenixArticles/${imageUrl.split('/').pop().split('.')[0]}`; 
  //console.log('Extracted Public ID:', publicId); // Log the public ID for debugging
  
  try {
    const cloudinaryResult = await cloudinaryConfig.uploader.destroy(publicId); //cloudinaryResult aura pour value un objet envoyé par cloudinary qui contiendra plusieurs properties: {"result":"ok", "public_id":"...","secure_url", "url"...etc}

    if (cloudinaryResult.result !== "ok") {
      console.error('Failed to delete image from Cloudinary:');
    } else {
      console.log('Image deleted successfully from Cloudinary:', imageUrl);
    }
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
  }
};

// Route DELETE pour supprimer un article et l'image associée de Phenix Articles
router.delete('/deleteArticle/:articleId', async (req, res) => {
  try {
    const articleId = req.params.articleId;

    // Trouver l'article pour obtenir l'URL de l'image avant de le supprimer
    const article = await postAllArticles.findById(articleId);

    if (article) {
      // Si l'article a une image associée, la supprimer de Cloudinary grâce à la function créee précedemment
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


//Delete an image from slider folder on cloudinary
const deleteSliderFromCloudinary = async (imageUrl) => {
  // Extract the public ID including the folder: le public id est le nombre juste avant .jpg de l'imageUrl dans la database mongoDBAtlas
  const publicId = `phenixSlider/${imageUrl.split('/').pop().split('.')[0]}`; 
  //console.log('Extracted Public ID:', publicId); // Log the public ID for debugging
  
  try {
    const cloudinaryResult = await cloudinaryConfig.uploader.destroy(publicId); //cloudinaryResult aura pour value un objet envoyé par cloudinary qui contiendra plusieurs properties: {"result":"ok", "public_id":"...","secure_url", "url"...etc}

    if (cloudinaryResult.result !== "ok") {
      console.error('Failed to delete image from Cloudinary:');
    } else {
      console.log('Image deleted successfully from Cloudinary:', imageUrl);
    }
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
  }
};

// Route DELETE pour supprimer un article et l'image associée de phenixSlider
router.delete('/deleteSliderImage/:imageId', async (req, res) => {
  try {
    const imageId = req.params.imageId; //imageId => parametre donnée à la function handleDelete qui a pour valeur l'_id de l'image

    // Trouver l'image pour obtenir l'URL de l'image avant de le supprimer
    const image = await sliderModel.findById(imageId);

    if (image) {
      // Si on trouve l'image, la supprimer de Cloudinary grâce à la function crée précedemment
      if (image.imageUrl) {
        await deleteSliderFromCloudinary(image.imageUrl);
      }

      // Supprimer l'image de la base de données
      const deletedSliderImage = await sliderModel.findByIdAndDelete(imageId);

      res.status(200).json({ message: 'server says: Article deleted successfully', deletedSliderImage });
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article :', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;
