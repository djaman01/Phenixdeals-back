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
    // Check if a file exists (for the image)
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Extract the other product data sent from the front-end
    const {
      type,
      auteur,
      infoArticle,
      allDescription,
      prix,
      priceStatus,
      etat,
      bestDeal,
      code,
    } = req.body;

    //Validate required files: Since bestDeal is a boolean !bestDeal === false can be true, so we don't add it
    if (
      !type ||
      !auteur ||
      !infoArticle ||
      !allDescription ||
      !priceStatus ||
      !etat ||
      !code
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate conditional price: If priceStatus is available, price must exist and be a valid number
    if (priceStatus === "available") {
      //isNaN = is not a number
      if (!prix || isNaN(Number(prix))) {
        return res.status(400).json({
          message: "When status is available, price must be a valid number ",
        });
      }
    }

    //Converting Types: Data from the front-end is ALWAYS a string so we must convert the price value to Number and the bestDeal value to Boolean (like we've defined them in the model)
    const numericPrice = priceStatus === "available" ? Number(prix) : null; //convert string to number

    const booleanBestDeal = bestDeal === "true" ? true : false; //convert string to boolean

    //Extract the image from the request where "file" = name of the property that contain the image that we've uploaded
    const imageUploaded = req.files.file;

    // Upload the image to Cloudinary, using the folder 'phenixArticles' / !!!cloudinaryResult aura pour value un objet envoyé par cloudinary qui contiendra plusieurs properties: {"result":"ok", "public_id":"...","secure_url", "url"...etc}
    const cloudinaryResult = await cloudinaryConfig.uploader.upload(
      imageUploaded.tempFilePath,
      {
        folder: "phenixArticles", // Folder Name in Cloudinary
      },
    );

    // Save the article to the MongoDB Atlas Database: Create a new product in the database with the received info and the image URL as values and use numericPrice and booleanBestDeal instead of prix and bestDeal
    const newArticle = await postAllArticles.create({
      type,
      auteur,
      infoArticle,
      allDescription,
      prix: numericPrice, //now number
      priceStatus,
      etat,
      code,
      bestDeal: booleanBestDeal, //now boolean
      imagePublicId: cloudinaryResult.public_id, // On utilise la property public_id de cloudinary au lieu de secure_url pour pouvoir ensuite changer la taille de l'image et envoyer de plus petits formats pour les cards of teh grids
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
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    //Dans le formData envoyé depuis le front-end, nous avons crée une property 'file' qui contient l'image
    const imageFile = req.files.file;

    // Upload image to Cloudinary
    const cloudinaryResult = await cloudinaryConfig.uploader.upload(
      imageFile.tempFilePath,
      { folder: "phenixSlider" }, // creating a separate folder for slider's images
    );

    // Create a new document in the MongoDB database with the image values and the auteur name sent from the front-end request dans le formData créé
    const newSliderImage = await sliderModel.create({
      imagePublicId: cloudinaryResult.public_id,
      auteur: req.body.auteur,
      code: req.body.code,
    });

    res.json(newSliderImage);
  } catch (error) {
    console.error("Error uploading slider image:", error);
    res.status(500).json({ error: "Error uploading slider image" });
  }
});

// Export the router to use in server.js
module.exports = router;
