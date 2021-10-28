// Importaciones necesarias
const {User} = require('../models/user_model');
const express = require('express');
const bcrypt = require('bcryptjs');

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

////////// HTTP REQUEST POST //////////
// Manejamos el post con un async-await.
router.post('/', async (req, res) => {
    // Creamos una instancia de User y la llenamos con la data del modelo.
    let user = new User({
        name        : req.body.name,
        email       : req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone       : req.body.phone,
        isAdmin     : req.body.isAdmin,
        street      : req.body.street,
        apartment   : req.body.apartment,
        zip         : req.body.zip,
        city        : req.body.city,
        country     : req.body.country
    })
    // Guardamos el usuario en la BD y comprobamos si se produce algún error.
    user = await user.save();
    // Si se produce algún error.
    if(!user) return res.status(500).send('The user cannot be created.');
    // Si no se produce ningún error.
    res.status(200).send(user);
});

// Exportamos el módulo
module.exports = router;