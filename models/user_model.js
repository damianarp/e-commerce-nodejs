// Importaciones necesarias
const mongoose = require('mongoose');

// Definimos un schema.
const userSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    }
})

// Originamos un id virtual para poder usarlo en cualquier otra app. Por lo que se generará un id = _id.
userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
userSchema.set('toJSON', {
    virtuals: true
});

// Exportamos el modelo 'User'.
exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;