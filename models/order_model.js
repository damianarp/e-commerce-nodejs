// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const orderSchema = mongoose.Schema ({
    // Cremos un array de orderItems.
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1: {
        type: String,
        required: true
    },
    shippingAddress2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now            
    }
})

// Originamos un id virtual para poder usarlo en cualquier otra app. Por lo que se generarĂ¡ un id = _id.
orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
orderSchema.set('toJSON', {
    virtuals: true
});

// Exportamos el modelo 'Order'.
exports.Order = mongoose.model('Order', orderSchema);