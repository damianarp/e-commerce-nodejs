// Importaciones necesarias.
const express = require('express');

// Creamos la instancia de la aplicación con Express.
const app = express();

app.get('/', (req, res) => {
    res.send('Hello API')
})

////////// CONFIGURACIÓN DEL PUERTO DE EXPRESS //////////

// Configuramos el puerto para correr el servicio con Express.
const port = process.env.PORT || 3000;

// Escuchamos el puerto a través de nuestra instancia de Express.
app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}`);
}); 
