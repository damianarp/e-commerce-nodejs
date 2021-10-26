// Importaciones necesarias
const {Category} = require('../models/category_model');
const express = require('express');
const mongoose = require('mongoose');

// Creamos la ruta.
const router = express.Router();

////////// HTTP REQUEST GET LISTA DE CATEGORÍAS //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    // Creamos una instancia de Category y buscamos a través del id.
    const categoryList = await Category.find();
    // Si se produce un error.
    if(!categoryList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de categorías.
    res.status(200).send(categoryList);
});

////////// HTTP REQUEST GET PARA UNA CATEGORÍA //////////
// Obtención de una categoría a través de su id.
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/:id`, async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Category Id.')
    }
    // Creamos una instancia de Category y buscamos a través del id.
    const category = await Category.findById(req.params.id);
    // Si se produce un error.
    if(!category) {
        return res.status(404).send('The category with given ID was not found.');
    }
    // Si todo sale bien. Obtenemos la categoría.
    res.status(200).send(category);
});

////////// HTTP REQUEST POST //////////
// Manejamos el post con un async-await.
router.post('/', async (req, res) => {
    // Creamos una instancia de Category y la llenamos con la data del modelo.
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    // Guardamos la categoría en la BD y comprobamos si se produce algún error.
    category = await category.save();
    // Si se produce algún error.
    if(!category) return res.status(500).send('The category cannot be created.');
    // Si no se produce ningún error.
    res.status(200).send(category);
});

////////// HTTP REQUEST PUT //////////
// Manejamos el put con un async-await.
router.put('/:id', async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Category Id.')
    }
    // Creamos una instancia de Category, buscamos por el id y actualizamos los campos.
    const categoryUpdated = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name    : req.body.name,
            icon    : req.body.icon,
            color   : req.body.color
        },
        {new: true} // Al hacer el put devuelve la data nueva.
    );
    // Si se produce algún error.
    if(!categoryUpdated) return res.status(500).send('The category cannot be updated.');
    // Si no se produce ningún error.
    res.status(200).send(categoryUpdated);
});

////////// HTTP REQUEST DELETE //////////
// Manejamos el delete con una promesa (para hacerlo diferente al async-await).
router.delete('/:id', (req,res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Category Id.')
    }
    // Encontramos la categoría por el id y la eliminamos.
    Category.findByIdAndRemove(req.params.id)
        .then(category => {
            // Si encuentra una categoría.
            if(category) {
                return res.status(200).send(`The category '${category.name}' has been deleted!`);
            } else {
                // Si no encuentra la categoría
                return res.status(404).send('Category not found!');
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