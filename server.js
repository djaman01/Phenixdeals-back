const express = require('express');
const app = express();
app.use(express.json());//To convert=parse incoming JSON data from HTTP requests, to Json Objects easier to read for the server

const port = 3005 //app.listen(port, ...) sets up the server to listen on that port. 

const db = require('./connect-db')

require('dotenv').config(); //To use the environment variable

const { postAllArticles } = require('./model-doc')//on destructure les differents models

const cors = require('cors')

app.use(cors({
  origin: ["http://localhost:3000"],//to access the front-end side through this URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

const multer = require('multer')
const path = require('path')

//Pour stocker les fichier images send par le front-end, dans le serveur
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

app.use('/uploads', express.static('uploads'));

const upload = multer({ storage: storage }); 

//.Post: Pour stocker image dans le serveur + envoyer url image dans la Database
app.post('/upload', upload.single('file'), async (req, res) => {

  try {

    const imageUrl = req.file.path.replace(/\\/g, '/'); //On store le path de l'image dans la variable imageUrl

    const { type, infoProduit, auteur, prix, etat, code } = req.body; // Extract oher product data by destructuring the object from the request body

    const newProduct = await postAllProduct.create({ imageUrl, type, infoProduit, auteur, prix, etat, code  }) //On crée un nouveau document dans la database
    res.json(newProduct) //Pas obligé, mais important car envoie dans la console le produit ajouté en json = confirmation ajout sans accéder à la database
  }
  catch (error) {
    console.error('Error handling image upload and product data storage:', error);
    res.status(500).json({ error: error.message });
  }
});

//--------------------------------------------

//database connection: http://localhost:3005/ pour voir le message
app.get('/', (req, res) => {
  res.send('Hello, this is your Express server!');
});

//Starting the Server:
//This code starts the Express server and listens on the specified port (3005 in this case). 
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})


