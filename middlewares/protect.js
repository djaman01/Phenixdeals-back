const jwt = require("jsonwebtoken");

require('dotenv').config(); //To load environment variables from a .env file => pour utiliser une variable dans .env, écrire: process.env.NOM_VARIABLE

const verifyUser = (req, res, next) => {
  try {
    const token = req.cookies.AdminToken; //token stocké dans le cookie (mettre le nom choisie, ici= AdminToken)

    //Si on ne trouve pas de token dans le cookie
    if (!token) {
      return res.status(401).json({ error: "Token is missing" }); //error 401 = Authentication failed
    }
    //Si token existe dans le cookie: vérifier si role = admin
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      //decided = value du token (ici c'est l'email et el role)
      if (err) {
        return res.status(403).json({ error: "Invalid token" }); //error 403 = Authorisation refused by the server
      } 
      else if (decoded.role === "admin") {
        next(); //next() => To move to the next route handler that actually handles the request.
      } 
      else {
        return res.status(403).json({ error: "Access denied, not an admin" });
      }
    });
  } 
  
  catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = verifyUser ;
