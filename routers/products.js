// Importaciones necesarias.
const express = require('express');
const {Product} = require('../models/product_model');
const {Category} = require('../models/category_model');

// Creamos la ruta.
const router = express.Router();

////////// HTTP REQUEST GET //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    const productList = await Product.find();

    // Si se produce un error.
    if(!productList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de productos.
    res.send(productList);
})

////////// HTTP REQUEST POST //////////
router.post(`/`, async (req, res) => {
    // Primero debemos validar si la categoría del nuevo producto existe o no en la BD.
    const category = await Category.findById(req.body.category);
    // Si se produce un error.
    if(!category) {
        return res.status(400).send('Invalid Category.')
    }
    // Si todo sale bien. Creamos una instancia de Product.
    let product = new Product({
        name            : req.body.name,
        description     : req.body.description,
        richDescription : req.body.richDescription,
        image           : req.body.image,
        brand           : req.body.brand,
        price           : req.body.price,
        category        : req.body.category,
        countInStock    : req.body.countInStock,
        rating          : req.body.rating,
        numReviews      : req.body.numReviews,
        isFeatured      : req.body.isFeatured
    })
    // Guardamos el producto en la BD y lo manejamos con un async-await.
    product = await product.save();
    // Si se produce algún error.
    if(!product) return res.status(500).send('The product cannot be created.');
    // Si no se produce ningún error.
    res.status(200).send(product);
})

// Exportamos el módulo
module.exports = router;