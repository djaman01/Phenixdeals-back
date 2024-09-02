const express = require('express');
const app = express();
const port = 3005 //app.listen(port, ...) sets up the server to listen on that port. 
const db = require('./connect-db')
const cors = require('cors')
const cookieParser = require('cookie-parser'); //For the cookies to be parsed and available in req.cookies throughout the application, including in the verifyUser middleware.


require('dotenv').config(); //To use the environment variable

app.use(cookieParser()); // To parse cookies = Analyse and convert the cookies in a json format (Javascript Object Notation) so that it can be used in req.cookies, and then extract the token

const verifyUser = require('./middlewares/protect')

app.use(express.json());//To parse incoming JSON data from HTTP requests, to Json Objects easier to read for the server  if a client sends { "name": "John", "age": 30 } it converts this string into a JavaScript object like { name: 'John', age: 30 }, which you can access using req.body.name and req.body.age.

app.use(cors({
  origin: ["http://localhost:5173"],//front-end domain: to access the front-end side through this URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true //To allow cookies to be sent
}))

//!!!! Pour que les images s'envoie au front: Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

//----POST Route Handler pour stocker fichier dans le serveur
const postArticleRouter = require('./controllers/postArticle'); //Toutes les routes définies dans le fichier postArticle.js seront disponibles, grâce à module.exports = router; dans postArticle.js
app.use('/', postArticleRouter);//ne pas mettre de route car déjà définie dans postArticle.js


//----GET Route Handler: Toutes les routes get (voir dossier getArticles.js dans controllers)
const getArticleRouter = require('./controllers/getArticles')
app.use('/', getArticleRouter)

//----PUT Route Handler: Toutes les routes put (voir dossier putArticles.js dans controllers)
const putArticleRouter = require('./controllers/putArticles')
app.use('/', putArticleRouter)

//----DELETE Route Handler: Toutes les routes delete (voir dossier deleteArticles.js dans controllers)
const deleteArticleRouter = require('./controllers/deleteArticles')
app.use('/', deleteArticleRouter)

//----POST Logins in the database
const postLoginsRouter = require('./controllers/postLogin')
app.use('/', postLoginsRouter)

//----GET LogOut
const getLogOut = require('./controllers/getLogout')
app.use('/', getLogOut)

//---Protected Route
app.get('/authentication', verifyUser, (req, res) => {
  res.status(200).json({message:'Authenticated'});
})

//database connection: http://localhost:3005/ pour voir le message
app.get('/', (req, res) => {
  res.send('Hello, this is your Express server!');
});

//Starting the Server:
//This code starts the Express server and listens on the specified port (3005 in this case). 
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})


