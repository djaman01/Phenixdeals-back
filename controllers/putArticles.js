const express = require("express");
const router = express.Router();

const { postAllArticles } = require("../model-doc");


//PUT to change products properties------------------------------
router.put('/putDash/:articleId', async (req, res) => {
  try {
    const articleId = req.params.articleId;
    const updatedArticleData = req.body;
    // productId= trouve le produit / updatedProductData= applique les changement reçu du front-end/{new:true} = Returns the modified document after the update.
    const updatedArticle = await postAllArticles.findByIdAndUpdate(articleId, updatedArticleData, { new: true }); //!!! : à la fin OBLIGE
      //To be able to use response.data for example on the browser or handle errors if product isn't found
      (updatedArticle) ? res.json({message: "Product Updated", updatedArticle}) : res.status(404).json({ error: 'product not found' }); //dans l'objet, je donne à la property error la value 'product not found'
  }
  //To handle server error = back-end code error
  catch (error) {
    res.status(500).json({ error: 'internal server error' });
  }
}
)

module.exports = router;