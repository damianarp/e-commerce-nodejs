// Importaciones necesarias
const {Category} = require('../models/category_model');
const express = require('express');

// Creamos la ruta.
const router = express.Router();

////////// HTTP REQUEST GET //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    // Si se produce un error.
    if(!categoryList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de categorías.
    res.status(200).send(categoryList);
});

////////// HTTP REQUEST GET //////////
// Obtención de una categoría a través de su id.
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/:id`, async (req, res) => {
    const category = await Category.findById(req.params.id);

    // Si se produce un error.
    if(!category) {
        return res.status(404).json({
            success: false,
            message: 'The category with given ID was not found.'
        })
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
    if(!category) return res.status(404).send('The category cannot be created.');
    // Si no se produce ningún error.
    res.status(200).send(category);
});

////////// HTTP REQUEST DELETE //////////
// Manejamos el delete con una promesa (para hacerlo diferente al async-await).
router.delete('/:id', (req,res) => {
    // Encontramos la categoría por el id y la eliminamos.
    Category.findByIdAndRemove(req.params.id)
        .then(category => {
            // Si encuentra una categoría.
            if(category) {
                return res.status(200).json({
                    success: true,
                    message: `The category ${category.name} has been deleted!`
                });
            } else {
                // Si no encuentra la categoría
                return res.status(404).json({
                    success: false,
                    message: 'Category not found!'
                });
            }
        })
        .catch(err => {
            return res.status(400).json({
                success: false,
                error: err
            });
        });
});

// Exportamos el módulo
module.exports = router;