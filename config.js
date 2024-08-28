//On utilise crypto pour générer une secret key, qu'on va voir dans le terminal grâce à npx nodemon config.js
//Ensuite, on va copier la key générée dans le terminale, et la collée dans la création du token dans postLogin.js

//Pour créer un code pour la secret key du token (pas besoin de npm, car il est directement installé dans Node.js)
const crypto = require("crypto");

const secretKey = crypto.randomBytes(64).toString("hex"); // Generate a random 64-byte key and convert it to a hexadecimal string
console.log('Generated secret key:', secretKey); //Si je fais npx nodemon config.js, la clé générée va apparaitre dans le terminal

//Pas besoin d'exporter, car je veux juste créer une clé et la copier pour coller dans .env, puis exporter cette clé à partir du .env
