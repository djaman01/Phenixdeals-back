const express = require("express");
const router = express.Router();

require("dotenv").config(); //To load environment variables from a .env file => pour utiliser une variable dans .env, écrire: process.env.NOM_VARIABLE

const { loginModel } = require("../model-doc"); //Destructure le model pour pouvoir utiliser les property names comme valeur

const bcrypt = require("bcryptjs"); //pour pouvoir utiliser le framework bcrypt, et chiffrer les motdepasse entrés par les users

const jwt = require("jsonwebtoken"); //JWT= Json Web Token => pour création d'un token et resté connecté pendant une durée determinée après s'etre login

//Pour création identifiants

router.post("/signUp", async (req, res) => {
  //async = asynd function pour pouvoir mettre await, et que le code n'avance qu'après avoir exécuté le code dans await
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); //Cache le password enregistré dans la databse

    const newUser = await loginModel.create({
      email,
      password: hashedPassword,
    });

    //send a json response to the client without the password because it's a private information
    res.status(201).json({
      //201 = successfully created
      message: "Signup Success",
      user: {
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error during sign-up", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//!!!!! Pour activer la création du token, il faut mettre  axios.defaults.withCredentials = true; dans le Login component du front-end !!!!!!!!!!!

//Pour login et aller vers dashboard quand on met nos identifiants dans la page login
//The POST method is used to send data to the server to be processed. Even though you're not creating or modifying database records, you are sending login credentials for the server to verify. The POST method is appropriate for this kind of operation because it involves sending sensitive data (like passwords) securely to the server.
router.post("/logIn", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await loginModel.findOne({ email: email }); //Recherche dans la base de données un utilisateur dont l'adresse email correspond à celle fournie par l'utilisateur.

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password); //Si user existe: le MDP fourni est comparé avec celui qui est dans la base de donnée même s'il est haché

      if (isMatch) {
        //!!! Création Token qu'on va store dans un cookie pour resté connecté une durée determinée, si login et password existent
        const token = jwt.sign(
          { email: user.email, role: user.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" },
        ); //jwt.sign = création token 1er argument= infos contenu dans token; 2eme argument: secret key pour + de securité, 3eme argument: durée avant expiration token pour maintenir la connexion, sauf si log out

        //console.log dans le terminale du serveur et non de la page web,apparait après s'etre connecté dans login: Vérifie si le token a été créé et log les informations appropriées
        if (token) {
          console.log("Token Created Successfully");
        } else {
          console.log("Token creation failed");
        }

        //Envoie du cookie
        res.cookie("AdminToken", token, {
          httpOnly: true, // Améliore l'acceptation navigateur sur mobile et renforce la sécurité
          sameSite: "None", // accepte les requêtes cross-domain
          secure: true, // ensures that the cookie is only sent over HTTPS
          path: "/",
        });

        //Log confirmation de l'envoi du cookie
        console.log("Token sent in cookie.");

        return res.status(200).json({ status: "Success", role: user.role }); //200 = Request Succeeded
      } else {
        //Si password n'est pas trouvé dans la database, on aura 'Invalid credentials' dans la console !!!! Ne pas écrire autre chose que "Invalid credentials" car c'est ce qu'envoie par défaut l'error 401
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      //Si Email n'est pas trouvé dans la databse, on aura "Email not found" dans la console
      return res.status(404).json({ error: "Email not found" });
    }
  } catch (err) {
    //Si problème dans le code du back-end
    console.error("Error during login:", err); //Message dans la console
    return res.status(500).json({ error: "Internal Server Error" }); //Message sur la page web
  }
});

module.exports = router;
