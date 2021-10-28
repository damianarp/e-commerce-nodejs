// Importaciones necesarias
const expressJwt = require('express-jwt');

// Método de protección de API.
function authJwt() {
    // Declaramos el secret que definimos en .env.
    const secret = process.env.secret;
    // Definimos una variable de ambiente para /api/v1 del archivo .env.
    const api = process.env.API_URL;
    // Retornamos expressJwt y le pasamos opciones.
    return expressJwt({
        secret,
        algorithms: ['HS256']
    }).unless({
        path: [
            // Exluimos todas las rutas que comiencen con /api/v1/products usando expresiones regulares para que no nos de un error de autenticación (y los métodos que queremos excluir en la autenticación, por ejemplo GET y OPTIONS).
            // Además excluimos el login y el register de usuarios.
            {url: /\/api\/v1\/products\/(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories\/(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

// Exportamos el módulo con el método authJwt().
module.exports = authJwt;