const express = require('express');
const router = express.Router();

const { postAllArticles } = require('../model-doc')

//To GET the last 20 products on the HomePage-----------

router.get('/homeProducts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20; // Get the 'limit' query parameter from the request or default to 20
    const postArticles = await postAllArticles.find().sort({ _id: -1 }).limit(limit); // Sort by _id in descending order to get the last 20 products
    res.json(postArticles) // !!! res.json() OBLIGé Pour envoyer la data au front-end
  }
  catch (error) {
    console.error('Error fetching products from the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
