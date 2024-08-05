const express = require("express");
const router = express.Router();

const { postAllArticles } = require("../model-doc");

router.delete('/deleteArticle/:articleId', async(req, res) => {
  try {
    const articleId = req.params.articleId;
    const deletedArticle = await postAllArticles.findByIdAndDelete(articleId);

    (deletedArticle) ? res.status(200).json({ message: 'server says: Article deleted successfully', deletedArticle}) : res.status(404).json({ error: 'Article not found' });
  }
  
  catch (error) {
    res.status(500).json({ error: 'internal server error' });
  }
}
)


module.exports = router;