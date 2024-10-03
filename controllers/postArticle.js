// File to handle POST requests for products with images

const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload'); // Middleware for handling file uploads
const cloudinaryConfig = require('../cloudinary'); // Import Cloudinary configuration
const { postAllArticles } = require('../model-doc'); // Import your model

// Middleware for parsing file uploads
router.use(fileUpload({
  useTempFiles: true,  // Temporary files are created for large file uploads
  tempFileDir: '/tmp/', // Directory for storing temporary files
}));

// POST route to create a new product with the image URL in the MongoDB database
router.post('/upload', async (req, res) => {
  try {
    // Ensure a file is provided
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.file; // Extract the image from the request

    // Upload the file to Cloudinary, using the folder 'phenixArticles'
    const result = await cloudinaryConfig.uploader.upload(file.tempFilePath, {
      folder: 'phenixArticles', // Folder Name in Cloudinary
    });

    // Extract the other product data sent from the front-end
    const { type, auteur, infoArticle, prix, etat, code } = req.body;

    // Create a new product in the database with the received info and the image URL
    const newArticle = await postAllArticles.create({
      type,
      auteur,
      infoArticle,
      prix,
      etat,
      code,
      imageUrl: result.secure_url // Use the Cloudinary URL here
    });

    // Respond with the new product created
    res.json(newArticle);
  } catch (error) {
    // Error handling
    console.error('Error creating the product:', error);
    res.status(500).json({ error: 'Error creating the product.' });
  }
});

// Export the router to use in server.js
module.exports = router;
