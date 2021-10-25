// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const productSchema = mongoose.Schema ({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true
    }
})

// Exportamos el modelo 'Curso'.
module.exports = mongoose.model('Product', productSchema);