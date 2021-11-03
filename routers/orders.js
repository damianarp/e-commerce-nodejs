// Importaciones necesarias
const {Order} = require('../models/order_model');
const express = require('express');
const { OrderItem } = require('../models/order-item_model');

// Creamos la ruta.
const router = express.Router();

////////// HTTP REQUEST GET //////////
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

////////// HTTP REQUEST POST ORDER //////////
router.post(`/`, async (req, res) => {
    // Primero debemos crear una instancia de OrderItem para recolectar los ids del arreglo de productos con el método map(), para luego poder adjuntarlos a la instancia de Order.
    // Como return newOrderItem._id retorna dos promesas (a causa de los 2 async-await), podemos manejar una de ellas con un Promise.all()
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity : orderItem.quantity,
            product  : orderItem.product
        })
        // Guardamos la nueva orden en la BD.
        newOrderItem = await newOrderItem.save();
        
        // Retornamos los ids.
        return newOrderItem._id;
    }))
    // Manejamos la promesa restante, para ellos declaramos una nueva constante orderItemsIdsResolved y le pasamos la promesa de la constante orderItemsIds.
    const orderItemsIdsResolved = await orderItemsIds;

    // Creamos una instancia de Order.
    let order = new Order({
        orderItems       : orderItemsIdsResolved,
        shippingAddress1 : req.body.shippingAddress1,
        shippingAddress2 : req.body.shippingAddress2,
        city             : req.body.city,
        zip              : req.body.zip,
        country          : req.body.country,
        phone            : req.body.phone,
        status           : req.body.status,
        totalPrice       : req.body.totalPrice,
        user             : req.body.user
    })
    // Guardamos la orden en la BD y la manejamos con un async-await.
    order = await order.save();
    // Si se produce algún error.
    if(!order) return res.status(500).send('The order cannot be created.');
    // Si no se produce ningún error.
    res.status(200).send(order);
})

// Exportamos el módulo
module.exports = router;