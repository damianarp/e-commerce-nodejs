// Importaciones necesarias
const {Order} = require('../models/order_model');
const express = require('express');

// Creamos la ruta.
const router = express.Router();

////////// PETICIÓN GET //////////
// En vez de manejar el get con una promesa lo manejamos con async-await.
router.get(`/`, async (req, res) => {
    const orderList = await Order.find();

    // Si se produce un error.
    if(!orderList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de órdenes.
    res.send(orderList);
});

// Exportamos el módulo
module.exports = router;