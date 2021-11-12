// Importaciones necesarias.
const express = require('express');
const dotenv = require('dotenv/config');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Product = require('./models/product_model');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

// Creamos la instancia de la aplicación con Express.
const app = express();

////////// HABILITAR CORS //////////

app.use(cors());
// Cualquier tipo de HTTP Request (GET, POST, PUT, DELETE)
app.options('*', cors());

////////////////////////////////////

////////// CONEXIÓN A MONGODB //////////

// Conectamos con mongoose a través del módulo config.
mongoose.connect(process.env.CONNECTION_STRING, {dbname: process.env.DB_NAME})
    .then(() => console.log('MongoDB Connection is ready.'))
    .catch(err => console.log('Could not connect to MongoDB.', err));

////////////////////////////////////////

// Configuramos Express para que trabaje con datos de tipo JSON y con el middleware urlencoded.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Middleware Morgan para mostrar los GET y POST en consola.
app.use(morgan('tiny'));

// Middleware authJwt para proteger la Api.
app.use(authJwt());

// Middleware para hacer estática la siguiente ruta.
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// Middleware para el manejo de errores en la API.
app.use(errorHandler);

// Importamos las rutas.
const productsRouter = require('./routers/products');
const categoriesRouter = require('./routers/categories');
const ordersRouter = require('./routers/orders');
const usersRouter = require('./routers/users');
    
// Definimos una variable de ambiente para /api/v1 del archivo .env.
const api = process.env.API_URL;

// Definimos las rutas.
app.use(`${api}/products`, productsRouter); // http://localhost:3000/api/v1/products
app.use(`${api}/categories`, categoriesRouter); // http://localhost:3000/api/v1/categories
app.use(`${api}/orders`, ordersRouter); // http://localhost:3000/api/v1/orders
app.use(`${api}/users`, usersRouter); // http://localhost:3000/api/v1/users


////////// CONFIGURACIÓN DEL PUERTO DE EXPRESS //////////

// Configuramos el puerto para correr el servicio con Express.
const PORT = process.env.PORT || 3000;

// Escuchamos el puerto a través de nuestra instancia de Express.
app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
}); 
