const express = require("express");
const app = express();

require("dotenv").config(); //To use the environment variable had to be before any use of env variable to work
const port = process.env.PORT;
const db = require("./connect-db");
const cors = require("cors");
const cookieParser = require("cookie-parser"); //For the cookies to be parsed and available in req.cookies throughout the application, including in the verifyUser middleware.



app.use(cookieParser()); // To parse cookies = Analyse and convert the cookies in a json format (Javascript Object Notation) so that it can be used in req.cookies, and then extract the token

const verifyUser = require("./middlewares/protect");

app.use(express.json()); //To parse incoming JSON data from HTTP requests, to Json Objects easier to read for the server  if a client sends { "name": "John", "age": 30 } it converts this string into a JavaScript object like { name: 'John', age: 30 }, which you can access using req.body.name and req.body.age.

app.use(
  cors({
    origin: [
      "http://localhost:5173", // ✅ To make it work locally
      "https://www.phenixdeals.com", // New official domain
      "https://www.phenix-deals.com", //For redirect or legacy users
      "https://phenixdeals-vite-n4qpkja68-djaman01s-projects.vercel.app", // Optional: Vercel preview
    ],
    methods: ["GET", "POST", "PUT", "DELETE"], // Here we Add all allowed front-end URLs
    credentials: true, // Allow cookies to be sent
  }),
);

//!!!! Pour que les images s'envoie au front: Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

//----POST Route Handler pour stocker fichier dans le serveur / le "/" veut dire que toutes les routes définies dans le fichier postArticle.js seront disponibles, grâce à module.exports = router; dans postArticle.js
const postArticleRouter = require("./controllers/postArticle");
app.use("/", postArticleRouter); //ne pas mettre de route car déjà définie dans postArticle.js

//----GET Route Handler: Toutes les routes get (voir dossier getArticles.js dans controllers)
const getArticleRouter = require("./controllers/getArticles");
app.use("/", getArticleRouter);

//----PUT Route Handler: Toutes les routes put (voir dossier putArticles.js dans controllers)
const putArticleRouter = require("./controllers/putArticles");
app.use("/", putArticleRouter);

//----DELETE Route Handler: Toutes les routes delete (voir dossier deleteArticles.js dans controllers)
const deleteArticleRouter = require("./controllers/deleteArticles");
app.use("/", deleteArticleRouter);

//----POST Logins in the database
const postLoginsRouter = require("./controllers/postLogin");
app.use("/", postLoginsRouter);

//----GET LogOut
const getLogOut = require("./controllers/getLogout");
app.use("/", getLogOut);

//---Protected Route
app.get("/authentication", verifyUser, (req, res) => {
  res.status(200).json({ message: "Authenticated" });
});

//Fichiers pour SEO (sitemap)
const sitemapRouter = require("./SEO/sitemap");
app.use("/", sitemapRouter);

//database connection: http://localhost:3005/ pour voir le message
app.get("/", (req, res) => {
  res.send("Hello, this is your Express server!");
});

//Starting the Server:
//This code starts the Express server and listens on the specified port (3005 in this case).
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
