// File to handle POST requests for products with images

const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload"); // Middleware for handling file uploads and enables you to use req.files to access the uploaded files in the request.
const cloudinaryConfig = require("../cloudinary"); // Import Cloudinary configuration
const { postAllArticles, sliderModel } = require("../model-doc"); // Import your model

// Middleware for parsing file uploads
router.use(
  fileUpload({
    useTempFiles: true, // Temporary files are created for large file uploads
    tempFileDir: "/tmp/", // Directory for storing temporary files
  }),
);

// POST route to create a new product with the image URL in the MongoDB database
router.post("/upload", async (req, res) => {
  try {
    // Ensure a file is provided
    if (!req.files) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUploaded = req.files.file; // Extract the image from the request where "file" = name of the property that contain the image that we've uploaded

    // Upload the image to Cloudinary, using the folder 'phenixArticles' / !!!cloudinaryResult aura pour value un objet envoyé par cloudinary qui contiendra plusieurs properties: {"result":"ok", "public_id":"...","secure_url", "url"...etc}
    const cloudinaryResult = await cloudinaryConfig.uploader.upload(
      imageUploaded.tempFilePath,
      {
        folder: "phenixArticles", // Folder Name in Cloudinary
      },
    );

    // Extract the other product data sent from the front-end
    const { type, auteur, infoArticle, prix, etat, bestDeal, code } = req.body;

    // Create a new product in the database with the received info and the image URL as values
    const newArticle = await postAllArticles.create({
      type,
      auteur,
      infoArticle,
      prix,
      etat,
      code,
      bestDeal,
      imageUrl: cloudinaryResult.secure_url, // On utilise la property secure_url de l'objet renvoyé dans cloudinaryResult, pour récupérer l'url sécurisé de l'image uploadé et l'envoyé à la MongoDB Database
    });

    // Respond with the new product created
    res.json(newArticle);
  } catch (error) {
    // Error handling
    console.error("Error creating the product:", error);
    res.status(500).json({ error: "Error creating the product." });
  }
});

// POST route to add a new slider image in the Homepage
router.post("/slider", async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    //Dans le formData envoyé depuis le front-end, nous avons crée une property 'file' qui contient l'image
    const imageFile = req.files.file;

    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinaryConfig.uploader.upload(
      imageFile.tempFilePath,
      { folder: "phenixSlider" }, // creating a separate folder for slider's images
    );

    // Create a new document in the MongoDB database with the image values
    const newSliderImage = await sliderModel.create({
      imageUrl: cloudinaryResult.secure_url,
    });

    res.json(newSliderImage);
  } catch (error) {
    console.error("Error uploading slider image:", error);
    res.status(500).json({ error: "Error uploading slider image" });
  }
});

// Export the router to use in server.js
module.exports = router;
