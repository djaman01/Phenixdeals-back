const express = require('express');
const app = express();
const port = 3005 //app.listen(port, ...) sets up the server to listen on that port. 
const db = require('./connect-db')
const cors = require('cors')

require('dotenv').config(); //To use the environment variable

app.use(express.json());//To convert=parse incoming JSON data from HTTP requests, to Json Objects easier to read for the server

app.use(cors({
  origin: ["http://localhost:3000"],//to access the front-end side through this URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))

//Pour stocker les fichier images send par le front-end, dans le serveur
const postProductRouter = require('./controllers/postProduct.js'); //Toutes les routes définies dans le fichier postProduct.js seront disponibles

app.use('/upload', postProductRouter);
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


