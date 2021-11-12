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
        algorithms: ['HS256'],
        isRevoked: isRevoked // separa a los admins de los users comunes.
    }).unless({
        path: [
            // Exluimos las rutas que deseemos usando expresiones regulares para que no nos de un error de autenticación (y los métodos que queremos excluir en la autenticación, por ejemplo GET y OPTIONS).
            // Además excluimos el login y el register de usuarios.
            {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/orders(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
}

// Método para saber si un usuario es admin o no.
// Payload es la data que viene en el token.
async function isRevoked(req, payload, done) {
    // Si no hay un admin en la data del token
    if(!payload.isAdmin) {
        done(null, true); // Rechaza el token.
    }
    // Si hay un admin en la data del token.
    done(); 
}

// Exportamos el módulo con el método authJwt().
module.exports = authJwt;