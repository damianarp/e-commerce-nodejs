// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const orderSchema = mongoose.Schema ({
    name: String,
    image: String,
    countInStock: {
        type: Number,
        required: true
    }
})

// Exportamos el modelo 'Order'.
exports.Order = mongoose.model('Order', orderSchema);