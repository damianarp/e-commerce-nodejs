// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const orderItemSchema = mongoose.Schema ({
    quantity: {
        type: Number,
        required: true, 
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

// Originamos un id virtual para poder usarlo en cualquier otra app. Por lo que se generará un id = _id.
orderItemSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
orderItemSchema.set('toJSON', {
    virtuals: true
});

// Exportamos el modelo 'OrderItem'.
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);