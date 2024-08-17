const express = require("express");
const router = express.Router();

const { loginModel } = require("../model-doc"); //Destructure le model pour pouvoir utiliser les property names comme valeur

const bcrypt = require("bcryptjs"); //pour pouvoir utiliser le framework bcrypt, et chiffrer les motdepasse entrés par les users

router.post("/signUp", async (req, res) => { //async = asynd function pour pouvoir mettre await, et que le code n'avance qu'après avoir exécuté le code dans await
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); //Cache le password enregistré dans la databse
    
    const newUser = await loginModel.create({
      email,
      password: hashedPassword
    })

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

module.exports = router;