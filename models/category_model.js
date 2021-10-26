// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const categorySchema = mongoose.Schema ({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true
    }
})

// Exportamos el modelo 'Category'.
exports.Category = mongoose.model('Category', categorySchema);