// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const userSchema = mongoose.Schema ({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true
    }
})

// Exportamos el modelo 'User'.
exports.User = mongoose.model('User', userSchema);