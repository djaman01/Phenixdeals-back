const express = require("express");
const router = express.Router();

const { postAllArticles } = require("../model-doc");

//PUT to change products properties------------------------------
router.put("/putDash/:articleId", async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const updatedArticleData = req.body;
    // articleId= trouve l'article qui a eu un changement / updatedArticleData= applique les changement reçu du front-end/{new:true} = Returns the modified document after the update.
    const updatedArticle = await postAllArticles.findByIdAndUpdate(
      articleId,
      { $set: updatedArticleData }, // Use $set to make sure even empty strings are saved (because i've added the column allDescription after adding articles)
      { new: true, runValidators: true }, // runValidators ensures schema rules are applied
    );
    //To be able to use response.data for example on the browser or handle errors if product isn't found
    updatedArticle
      ? res.json({ message: "Product Updated", updatedArticle })
      : res.status(404).json({ error: "product not found" }); //dans l'objet, je donne à la property error la value 'product not found'
  } catch (error) {
    //To handle server error = back-end code error
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
