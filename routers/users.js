// Importaciones necesarias
const {User} = require('../models/user_model');
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Creamos la ruta.
const router = express.Router();

////////// HTTP REQUEST GET //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    const userList = await User.find()
        .select('-passwordHash'); // Excluimos el passwordHash.

    // Si se produce un error.
    if(!userList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de usuarios.
    res.send(userList);
});

////////// HTTP REQUEST GET PARA UN USUARIO //////////
// Obtención de un usuario a través de su id.
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/:id`, async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format User Id.')
    }
    // Creamos una instancia de User y buscamos a través del id.
    const user = await User.findById(req.params.id)
        .select('-passwordHash'); // Excluimos el passwordHash.;
    // Si se produce un error.
    if(!user) {
        return res.status(404).send('The user with given ID was not found.');
    }
    // Si todo sale bien. Obtenemos la categoría.
    res.status(200).send(user);
});

////////// HTTP REQUEST GET PARA OBTENER ESTADÍSTICAS //////////
// Obtención de cantidad de usuarios.
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/get/count`, async (req, res) => {
    // Creamos una instancia de User y contamos los documentos que contiene.
    await User.countDocuments()
        .then(count => {
            res.send({
                userCount: count
            })
        })
        .catch(err => {
            res.status(500).send({message: 'Failed to get the user count', err})
        })
});

////////// HTTP REQUEST POST //////////
// Manejamos el post con un async-await.
router.post('/', async (req, res) => {
    // Creamos una instancia de User y la llenamos con la data del modelo.
    let user = new User({
        name        : req.body.name,
        email       : req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10), // 10 es un parámetro secreto, también puede ser un string, como por ejemplo 'secret'.
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

////////// HTTP REQUEST POST PARA EL LOGIN //////////
// Manejamos el post con un async-await.
router.post('/login', async (req, res) => {
    // Comprobamos si el usuario existe, a través de su email.
    const user = await User.findOne({email: req.body.email});
    // Declaramos una constante para el secret del token.
    const secret = process.env.secret;
    // Si no existe el usuario.
    if(!user) {
        return res.status(400).send('The user with given email was not found.');
    }
    // Antes de estar seguros de obtener el usuario a través del email desde la BD, debemos comparar el password que ingresa el usuario con el passwordHash de la BD para ver si coinciden.
    if( user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        // Si hay un usuario y coinciden los passwords.
        // Generamos el token para que lo use en el frontend y pueda autenticarse en la API.
        const token = jwt.sign(
            {
                // Cargamos el token con el id de usuario y so es admin o no.
                userId  : user.id,
                isAdmin : user.isAdmin 
            },
            secret, // secret definido en .env.
            {expiresIn: '1d'} // Tiempo de duración del token. Ejemplo: 1 día.
        );
        // Enviamos el email y el token.
        res.status(200).send({user: user.email, token: token});
    } else {
        // Si no se cumple alguna de las coinciciones del if.
        res.status(400).send('User or password invalid!');
    }
});

////////// HTTP REQUEST POST PARA EL REGISTRO //////////
// Manejamos el post con un async-await.
router.post('/register', async (req, res) => {
    // Creamos una instancia de User y la llenamos con la data del modelo.
    let user = new User({
        name        : req.body.name,
        email       : req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10), // 10 es un parámetro secreto, también puede ser un string, como por ejemplo 'secret'.
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
    if(!user) return res.status(500).send('The user cannot be registered.');
    // Si no se produce ningún error.
    res.status(200).send(user);
});

////////// HTTP REQUEST DELETE //////////
// Manejamos el delete con una promesa (para hacerlo diferente al async-await).
router.delete('/:id', (req,res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format User Id.')
    }
    // Encontramos el usuario por el id y lo eliminamos.
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            // Si encuentra un usuario.
            if(user) {
                return res.status(200).send(`The user '${user.name}' has been deleted!`);
            } else {
                // Si no encuentra el usuario.
                return res.status(400).send('User not found!');
            }
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                error: err
            });
        });
});

// Exportamos el módulo
module.exports = router;