function errorHandler(err, req, res, next) {
    // Si existe un error UnauthorizedError.
    if(err.name === 'UnauthorizedError') {
        return res.status(401).json({mesagge: 'The user is not authorized.'})
    }
    // Si existe un error ValidationError.
    if(err.name === 'ValidationError') {
        return res.status(401).json({mesagge: err})
    }
    // Si existe un error general.
    res.status(500).json(err)
}

// Exportamos el módulo con el método errorHandler().
module.exports = errorHandler;