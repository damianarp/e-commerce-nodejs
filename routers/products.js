// Importaciones necesarias.
const express = require('express');
const {Product} = require('../models/product_model');
const {Category} = require('../models/category_model');
const mongoose = require('mongoose');
const multer = require('multer');

// Creamos la ruta.
const router = express.Router();

////////// UPLOAD IMAGES //////////
// Definimos los tipos de extensiones de los archivos.
const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Validamos si el archivo se subió o no.
        const isValid = FILE_TYPE_MAP[file.mimetype];
        // Creamos una nueva instancia de Error.
        let uploadError = new Error('Invalid Image Type.');
        // Si la imagen es válida.
        if(isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        // Configuramos el nombre de los archivos, reemplazando los espacios entre palabras por -.
        const fileName = file.originalname.split(' ').join('-');
        // Configuramos la extension del archivo con la lista de extensiones definidas en FILE_TYPE_MAP.
        const extension = FILE_TYPE_MAP[file.mimetype];
        // Retornamos el callback con el nombre del archivo-fecha.extension.
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })
  
  const uploadOptions = multer({ storage: storage })

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
router.post(`/`, uploadOptions.single('image'), async (req, res) => {
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
    // Chequeamos si hay una imagen en el request.
    const file = req.file;
    // Si se produce un error.
    if(!file) return res.status(400).send('No image in the request.');
    // Si todo sale bien. Creamos una instancia de Product.
    // Primero, declaramos una constante para el fileName.
    const fileName = req.file.filename;
    // Segundo, declaramos una constante para la ruta http://localhost:3000/public/uploads/
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name            : req.body.name,
        description     : req.body.description,
        richDescription : req.body.richDescription,
        image           : `${basePath}${fileName}`, //http://localhost:3000/public/uploads/image-2333727273
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
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Product Id.')
    }
    // Segundo, debemos validar si la categoría del nuevo producto existe o no en la BD.
    const category = await Category.findById(req.body.category);
    // Si se produce un error.
    if(!category) return res.status(400).send('Invalid Category.');

    // Tercero, debemos validar si el producto existe o no en la BD.
    const product = await Product.findById(req.params.id);
    // Si se produce un error.
    if(!product) return res.status(400).send('The product must contain a image.');

    // Chequeamos si hay una imagen en el request.
    const file = req.file;
    let imagePath;
    if(file) {
        // Si existe una imagen nueva.
        // Primero, declaramos una constante para el nuevo fileName.
        const fileName = file.filename;
        // Segundo, declaramos una constante para la ruta http://localhost:3000/public/uploads/
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        // Si no existe una imagen. Mantenemos la imagen que estaba.
        imagePath = product.image;
    }
    // Si todo sale bien. Creamos una instancia de Product.
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name            : req.body.name,
            description     : req.body.description,
            richDescription : req.body.richDescription,
            image           : imagePath,
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
    if(!updatedProduct) return res.status(500).send('The product cannot be updated.');
    // Si no se produce ningún error.
    res.status(200).send(updatedProduct);
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