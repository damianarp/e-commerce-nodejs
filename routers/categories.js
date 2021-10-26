// Importaciones necesarias
const {Category} = require('../models/category_model');
const express = require('express');

// Creamos la ruta.
const router = express.Router();

////////// PETICIÓN GET //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    // Si se produce un error.
    if(!categoryList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de categorías.
    res.send(categoryList);
});

// Exportamos el módulo
module.exports = router;