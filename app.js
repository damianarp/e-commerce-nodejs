// Importaciones necesarias.
const express = require('express');
const dotenv = require('dotenv/config');
const morgan = require('morgan');
const mongoose = require('mongoose');

////////// CONEXIÓN A MONGODB //////////

// Conectamos con mongoose a través del módulo config.
mongoose.connect(process.env.CONNECTION_STRING, {dbname: 'eshop-db'})
    .then(() => console.log('MongoDB Connection is ready.'))
    .catch(err => console.log('Could not connect to MongoDB.', err));


// Definimos una variable de ambiente para /api/v1 del archivo .env.
const api = process.env.API_URL;

// Creamos la instancia de la aplicación con Express.
const app = express();

// Configuramos Express para que trabaje con datos de tipo JSON y con el middleware urlencoded.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Middleware Morgan para mostrar los GET y POST en consola.
app.use(morgan('tiny'));

// http://localhost:3000/api/v1/products
app.get(`${api}/products`, (req, res) => {
    const product = {
        id: 1,
        name: 'hair dresser',
        image: 'some_url'
    }
    res.send(product);
})

app.post(`${api}/products`, (req, res) => {
    const newProduct = req.body;
    console.log(newProduct);
    res.send(newProduct);
})

////////// CONFIGURACIÓN DEL PUERTO DE EXPRESS //////////

// Configuramos el puerto para correr el servicio con Express.
const port = process.env.PORT || 3000;

// Escuchamos el puerto a través de nuestra instancia de Express.
app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}`);
}); 
