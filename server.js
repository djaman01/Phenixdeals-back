const express = require('express');
const app = express();
const port = 3005 //app.listen(port, ...) sets up the server to listen on that port. 
const db = require('./connect-db')
const cors = require('cors')

require('dotenv').config(); //To use the environment variable

app.use(express.json());//To convert=parse incoming JSON data from HTTP requests, to Json Objects easier to read for the server

app.use(cors({
  origin: ["http://localhost:5173"],//to access the front-end side through this URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

//!!!! Pour que les images s'envoie au front: Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

//----POST Route Handler pour stocker fichier dans le serveur
const postArticleRouter = require('./controllers/postArticle'); //Toutes les routes définies dans le fichier postArticle.js seront disponibles, grâce à module.exports = router; dans postArticle.js
app.use('/', postArticleRouter);//ne pas mettre de route car déjà définie dans postArticle.js


//----GET Route Handler: Toutes les routes get (voir dossier getArticles.js dans controllers)
const getArticleRouter = require('./controllers/getArticles')
app.use('/', getArticleRouter)


//database connection: http://localhost:3005/ pour voir le message
app.get('/', (req, res) => {
  res.send('Hello, this is your Express server!');
});

//Starting the Server:
//This code starts the Express server and listens on the specified port (3005 in this case). 
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})


