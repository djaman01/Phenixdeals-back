//Pour créer un code pour la secret key du token (pas besoin de npm, car il est directement installé dans Node.js)
const crypto = require("crypto");

const secretKey = crypto.randomBytes(64).toString("hex"); // Generate a random 64-byte key and convert it to a hexadecimal string
//console.log('Generated secret key:', secretKey); //Avant export dans un file:si je fais npx nodemon config.js, la clé générée va apparaitre / après export dans postLogin.js, la clé va apparaitre après npx nodemon server.js

module.exports = { secretKey };
