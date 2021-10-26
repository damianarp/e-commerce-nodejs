// Importaciones necesarias
const {User} = require('../models/user_model');
const express = require('express');

// Creamos la ruta.
const router = express.Router();

////////// PETICIÓN GET //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    const userList = await User.find();

    // Si se produce un error.
    if(!userList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de usuarios.
    res.send(userList);
});

// Exportamos el módulo
module.exports = router;