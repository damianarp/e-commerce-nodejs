// Importaciones necesarias.
const express = require('express');
const {Product} = require('../models/product_model');

// Creamos la ruta.
const router = express.Router();

////////// PETICIÓN GET //////////
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

////////// PETICIÓN POST //////////
router.post(`/`, (req, res) => {
    // Creamos una instancia de Product.
    const product = new Product({
        name         : req.body.name,
        image        : req.body.image,
        countInStock : req.body.countInStock
    })
    // Guardamos el producto en la BD y manejamos la promesa.
    product.save()
        .then((createdProduct => {
            res.status(201).json(createdProduct)
        }))
        .catch((err) => {
            res.status(500).json({
                error   : err,
                success : false
            })
        })
})

// Exportamos el módulo
module.exports = router;