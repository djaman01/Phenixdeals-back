const express = require("express");
const router = express.Router();

const { loginModel } = require("../model-doc"); //Destructure le model pour pouvoir utiliser les property names comme valeur

const bcrypt = require("bcryptjs"); //pour pouvoir utiliser le framework bcrypt, et chiffrer les motdepasse entrés par les users

const jwt = require('jsonwebtoken'); //pour création d'un token et resté connecté pendant une durée determinée après s'etre login

//Pour créer un code pour la secret key du token (pas besoin de npm, car il est directement installé dans Node.js)
const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex'); // Generate a random 64-byte key and convert it to a hexadecimal string
//console.log('Generated secret key:', secret); si je fais npx nodemon server.js, la clé générée va apparaitre


//Pour création identifiants

router.post("/signUp", async (req, res) => { //async = asynd function pour pouvoir mettre await, et que le code n'avance qu'après avoir exécuté le code dans await
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); //Cache le password enregistré dans la databse
    
    const newUser = await loginModel.create({ email, password: hashedPassword })

    //send a json response to the client without the password because it's a private information
    res.status(201).json({ //201 = successfully created
      message: "User registered Successfully",
      user: {
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch(error) {
    console.error("Error during sign-up", error);
    res.status(500).json({error: "Internal Server Error"});
  }

});

//Pour login et aller vers dashboard quand on met nos identifiants dans la page login
//The POST method is used to send data to the server to be processed. Even though you're not creating or modifying database records, you are sending login credentials for the server to verify. The POST method is appropriate for this kind of operation because it involves sending sensitive data (like passwords) securely to the server.
router.post('/logIn', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginModel.findOne({ email: email }); //Recherche dans la base de données un utilisateur dont l'adresse email correspond à celle fournie par l'utilisateur.

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password); //Si user existe: le MDP fourni est comparé avec celui qui est dans la base de donnée même s'il est haché

      if (isMatch) { //Si Login et password existent => Création Token qu'on va store dans un cookie pour resté connecté une durée determinée
        const token = jwt.sign({ email: user.email, role: user.role }, secret, { expiresIn: '1d' }); //jwt.sign = création token 1er argument= infos contenu dans token; 2eme argument: secret key pour + de securité, 3eme argument: durée avant expiration token pour maintenir la connexion, sauf si log out

        res.cookie('Token', token, {
          sameSite: 'None', // 'None' allows the cookie to be sent in cross-site requests
          secure: true // 'true' ensures that the cookie is only sent over HTTPS
        });

        return res.json({ status: 'Success', role: user.role });

      } else { //Si password n'est pas trouvé dans la database, on aura 'Invalid Credentials' dans la console
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else { //Si Email n'est pas trouvé dans la databse, on aura "Email not found" dans la console
      return res.status(404).json({ error: 'Email not found' });
    }
  } catch (err) { //Si problème dans le code du back-end
    console.error('Error during login:', err); //Message dans la console
    return res.status(500).json({ error: 'Internal Server Error' }); //Message sur la page web
  }
});

module.exports = router;