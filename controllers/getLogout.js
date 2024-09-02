const express = require("express");
const router = express.Router();


// Creating the LogOut API = clearing the cookie and sending the response = Synchronous operations (no need for async)

router.get("/logout", (req, res) => {
  //on utilise res car le serveur répond au client en lui demandant de supprimer le cookie nommé 'AdminToken'
  res.clearCookie("AdminToken", {
    sameSite: 'None',
    secure: true,
     path: '/'
  });

  return res.status(200).json({ //status(200) => will send 200 OK status to the client
    status: "Success", //For application-level logic
    message: "Admin logged out successfully"  //For human readability
  });
});

module.exports = router;
