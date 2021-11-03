// Importaciones necesarias
const {Order} = require('../models/order_model');
const express = require('express');
const { OrderItem } = require('../models/order-item_model');
const mongoose = require('mongoose');

// Creamos la ruta.
const router = express.Router();

////////// HTTP REQUEST GET //////////
// Manejamos el get con async-await.
router.get(`/`, async (req, res) => {
    const orderList = await Order.find()
                                 .populate('user', 'name') // Poblamos el user con el nombre.
                                 .sort({'dateOrdered': -1}); // Ordenamos por fecha de creación de la orden desde la más nueva a la más antigua.

    // Si se produce un error.
    if(!orderList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de órdenes.
    res.send(orderList);
});

////////// HTTP REQUEST GET PARA UNA ORDEN //////////
// Manejamos el get con async-await.
router.get(`/:id`, async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Order Id.')
    }
    // Creamos una instancia de Order y buscamos a través del id.
    const order = await Order.findById(req.params.id)
                                .populate('user', 'name') // Poblamos el campo user con el nombre.
                                .populate({
                                    path: 'orderItems', populate: {
                                        path: 'product', populate: 'category'
                                    }
                                }); // Poblamos el campo orderItems con los items de la orden. Como es una array de items, para ello, le pasamos el path orderItems y poblamos el campo product (pasandole el path product para poder también poblar el campo category que esta conteniendo).
    // Si se produce un error.
    if(!order) {
        return res.status(400).send('The order with given ID was not found.');
    }
    // Si todo sale bien. Obtenemos la orden.
    res.status(200).send(order);
});

////////// HTTP REQUEST POST ORDER //////////
// Manejamos el get con async-await.
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