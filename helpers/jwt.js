// Importaciones necesarias
const expressJwt = require('express-jwt');

// Método de protección de API.
function authJwt() {
    // Declaramos el secret que definimos en .env.
    const secret = process.env.secret;
    // Retornamos expressJwt y le pasamos opciones.
    return expressJwt({
        secret,
        algorithms: ['HS256']
    });
}

// Exportamos el módulo con el método authJwt().
module.exports = authJwt;