// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const categorySchema = mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    }
})

// Exportamos el modelo 'Category'.
exports.Category = mongoose.model('Category', categorySchema);