const express = require("express");
const router = express.Router();
const cloudinaryConfig = require("../cloudinary"); // Ensure you import your Cloudinary configuration
const { postAllArticles, sliderModel } = require("../model-doc");

//Delete an image from phenixArticles folder on cloudinary => Parametre sera envoyé par le router.delete en-dessous
const deleteImageFromCloudinary = async (imagePublicId) => {
  try {
    const cloudinaryResult =
      await cloudinaryConfig.uploader.destroy(imagePublicId);

    if (cloudinaryResult.result !== "ok") {
      console.error("Failed to delete image from Cloudinary:");
    } else {
      console.log("Image deleted successfully from Cloudinary:", imagePublicId);
    }
  } catch (err) {
    console.error("Error deleting image from Cloudinary:", err);
  }
};

// Route DELETE pour supprimer un article et l'image associée de Phenix Articles
router.delete("/deleteArticle/:articleId", async (req, res) => {
  try {
    const articleId = req.params.articleId;

    const deletedArticle = await postAllArticles.findByIdAndDelete(articleId); //Delete article from DB and store it in teh variable deletedArticle, so that we can extract it's info and delete it's image from cloudinary

    if (!deletedArticle) {
      return res.status(404).json({ error: "Article not found" });
    }
    if (deletedArticle.imagePublicId) {
      //Delete image from cloudinary if it exists
      await deleteImageFromCloudinary(deletedArticle.imagePublicId);
    }

    res.status(200).json({
      message: "server says: Article deleted successfully",
      deletedArticle,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Delete an image from slider folder on cloudinary
const deleteSliderFromCloudinary = async (imagePublicId) => {
  try {
    const cloudinaryResult =
      await cloudinaryConfig.uploader.destroy(imagePublicId); //cloudinaryResult aura pour value un objet envoyé par cloudinary qui contiendra plusieurs properties: {"result":"ok", "public_id":"...","secure_url", "url"...etc}

    if (cloudinaryResult.result !== "ok") {
      console.error("Failed to delete image from Cloudinary:");
    } else {
      console.log("Image deleted successfully from Cloudinary:", imagePublicId);
    }
  } catch (err) {
    console.error("Error deleting image from Cloudinary:", err);
  }
};

// Route DELETE pour supprimer un article et l'image associée de phenixSlider
router.delete("/deleteSliderImage/:imageId", async (req, res) => {
  try {
    const imageId = req.params.imageId; //imageId => parametre donnée à la function handleDelete qui a pour valeur l'_id de l'image

    // Trouver l'image pour obtenir l'URL de l'image avant de le supprimer
    const image = await sliderModel.findById(imageId);

    if (image) {
      // Si on trouve l'image, la supprimer de Cloudinary grâce à la function crée précedemment
      if (image.imagePublicId) {
        await deleteSliderFromCloudinary(image.imagePublicId);
      }

      // Supprimer l'image de la base de données
      const deletedSliderImage = await sliderModel.findByIdAndDelete(imageId);

      res.status(200).json({
        message: "server says: Article deleted successfully",
        deletedSliderImage,
      });
    } else {
      res.status(404).json({ error: "Article not found" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
