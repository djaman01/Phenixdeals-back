// Fichier pour ajouter une colonne avec un string vide "", dans tous les documents d'une database avec des articles déjà crées

const mongoose = require("mongoose");
require("dotenv").config(); // Load .env first
const { postAllArticles } = require("./model-doc"); // make sure path is correct
console.log("ATLAS_URI:", process.env.ATLAS_URI); // just to check if it loads correctly

// Log to make sure env is loaded
console.log("ATLAS_URI:", process.env.ATLAS_URI);

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    // Update old articles
    const result = await postAllArticles.updateMany(
      { allDescription: { $exists: false } }, // only those missing this field
      { $set: { allDescription: "" } },
    );

    console.log("Update result:", result.modifiedCount, "documents updated");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

main();
