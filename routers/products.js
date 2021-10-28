// Importaciones necesarias.
const express = require('express');
const {Product} = require('../models/product_model');
const {Category} = require('../models/category_model');
const mongoose = require('mongoose');

// Creamos la ruta.
const router = express.Router();

////////// HTTP REQUEST GET LISTA DE PRODUCTOS //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    // http://localhost:3000/api/v1/products?categories=234234,554383

    // Declaramos una variable filter ocmo un objeto vacío para poder llenarlo luego.
    let filter = {};
    // Obtenemos las categorías, las almacenamos en la constante filter y dividimos las categorías por coma.
    if(req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }
    // Creamos una instancia de Product y filtramos según la/s categoría/s.
    const productList = await Product.find(filter)
                                     .populate('category'); // Poblamos el campo category con la data de su model.
    // Si se produce un error.
    if(!productList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de productos.
    res.send(productList);
})

////////// HTTP REQUEST GET PARA UN PRODUCTO //////////
// Obtención de un producto a través de su id.
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/:id`, async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Product Id.')
    }
    // Creamos una instancia de Product y buscamos a través del id.
    const product = await Product.findById(req.params.id)
                                 .populate('category');
    // Si se produce un error.
    if(!product) {
        return res.status(400).send('The product with given ID was not found.');
    }
    // Si todo sale bien. Obtenemos el producto.
    res.status(200).send(product);
});

////////// HTTP REQUEST GET PARA OBTENER ESTADÍSTICAS //////////
// Obtención de cantidad de productos.
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/get/count`, async (req, res) => {
    // Creamos una instancia de Product y contamos los documentos que contiene.
    await Product.countDocuments()
        .then(count => {
            res.send({
                productCount: count
            })
        })
        .catch(err => {
            res.status(500).send({message: 'Failed to get the product count', err})
        })
});

////////// HTTP REQUEST GET PARA OBTENER PRODUCTOS PRESENTADOS //////////
// Obtención de un productos presentados.
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/get/featured/:count`, async (req, res) => {
    // Declaramos una constante para la cantidad de productos que queremos mostrar en la web. Si se encuentra una cantidad, la mostramos sino retornamos 0.
    const count = req.params.count ? req.params.count : 0 
    // Creamos una instancia de Product y obtenemos los productos presentados limitados por count (anteponeoms el + para que se convierta de string a number).
    const productsFeatured = await Product.find({isFeatured: true})
        .limit(+count)
        // Manejamos la promesa.
        .then(productsFeatured => {
            res.send(productsFeatured)
        })
        .catch(err => {
            res.status(500).send({message: 'Failed to get the featured product.', err});
        })
});

////////// HTTP REQUEST POST //////////
router.post(`/`, async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Product Id.')
    }
    // Segundo, debemos validar si la categoría del nuevo producto existe o no en la BD.
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

////////// HTTP REQUEST PUT //////////
// Manejamos el put con un async-await.
router.put('/:id', async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Product Id.')
    }
    // Segundo, debemos validar si la categoría del nuevo producto existe o no en la BD.
    const category = await Category.findById(req.body.category);
    // Si se produce un error.
    if(!category) {
        return res.status(400).send('Invalid Category.')
    }
    // Si todo sale bien. Creamos una instancia de Product.
    const productUpdated = await Product.findByIdAndUpdate(
        req.params.id,
        {
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
        },
        {new: true} // Al hacer el put devuelve la data nueva.
    );
    // Si se produce algún error.
    if(!productUpdated) return res.status(500).send('The product cannot be updated.');
    // Si no se produce ningún error.
    res.status(200).send(productUpdated);
});

////////// HTTP REQUEST DELETE //////////
// Manejamos el delete con una promesa (para hacerlo diferente al async-await).
router.delete('/:id', (req,res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Product Id.')
    }
    // Encontramos el producto por el id y lo eliminamos.
    Product.findByIdAndRemove(req.params.id)
        .then(product => {
            // Si encuentra un producto.
            if(product) {
                return res.status(200).send(`The product '${product.name}' has been deleted!`);
            } else {
                // Si no encuentra el producto.
                return res.status(400).send('Product not found!');
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