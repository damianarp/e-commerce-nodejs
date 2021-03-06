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

////////// HTTP REQUEST GET PARA MOSTRAR LAS VENTAS TOTALES //////////
// Manejamos el get con async-await.
router.get(`/get/totalsales`, async (req, res) => {
    // Creamos una instancia de Order y le pasamos el método aggregate de mongoose para poder computar los datos de todos los documentos en un único resultado.
    const totalSales = await Order.aggregate([
        // Agrupamos los campos según el parámetro totalPrice en una variable totalsales, sumamos todos los totalPrice, y le pasamos un id nulo, ya que mongoose necesita especificar un id (aunque sea nulo) para retornar un objeto en un grupo.
        {$group: {_id: null, totalsales: {$sum: '$totalPrice'}}}
    ])
    // Si se produce un error.
    if(!totalSales) {
        return res.status(400).send('The total sales order cannot be generated.');
    }
    // Si todo sale bien. Obtenemos las ventas totales. El método pop() permite que solo obtengamos el campo totalsales del array.
    res.status(200).send({totalsales: totalSales.pop().totalsales});
});

////////// HTTP REQUEST GET PARA OBTENER LA CANTIDAD DE VENTAS //////////
// Obtención de cantidad de ventas.
// Manejamos el get con async-await.
router.get(`/get/count`, async (req, res) => {
    // Creamos una instancia de Order y contamos los documentos que contiene.
    await Order.countDocuments()
        .then(count => {
            res.send({
                orderCount: count
            })
        })
        .catch(err => {
            res.status(500).send({message: 'Failed to get the order count', err})
        })
});

////////// HTTP REQUEST GET PARA MOSTRAR LAS VENTAS POR USUARIO //////////
// Manejamos el get con async-await.
router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({user: req.params.userid})
                                .populate('user', 'name') // Poblamos el campo user con el nombre.
                                .populate({
                                    path: 'orderItems', populate: {
                                        path: 'product', populate: 'category'
                                    }
                                }) // Poblamos el campo orderItems con los items de la orden. Como es una array de items, para ello, le pasamos el path orderItems y poblamos el campo product (pasandole el path product para poder también poblar el campo category que esta conteniendo).
                                .sort({'dateOrdered': -1}); // Ordenamos por fecha de creación de la orden desde la más nueva a la más antigua.
    // Si se produce un error.
    if(!userOrderList) {
        res.status(500).json({success: false})
    }
    // Si todo sale bien. Obtenemos la lista de órdenes por usuario.
    res.send(userOrderList);
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

    // Declaramos una constante totalPrices para calcular el precio total de la orden desde la BD. Para ello, recorremos en el array todos los orderItemsIdsResolved con un map() para retornar los precios de cada producto de la orden.
    const totalPrices = await Promise.all(orderItemsIdsResolved.map( async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        // Declaramos una variable totalPrice y le pasamos el precio del producto del item de la orden por la cantidad de ese producto.
        const totalPrice = orderItem.product.price * orderItem.quantity;
        // Retornamos el precio total de un item de la orden.
        return totalPrice;
    }))
    // Declaramos una constante para sumar los precios totales de cada item de la orden, con valor inicial como 0.
    const totalPrice = totalPrices.reduce((a,b) => a + b,  0);

    // Creamos una instancia de Order para generar la orden con toda la data.
    let order = new Order({
        orderItems       : orderItemsIdsResolved,
        shippingAddress1 : req.body.shippingAddress1,
        shippingAddress2 : req.body.shippingAddress2,
        city             : req.body.city,
        zip              : req.body.zip,
        country          : req.body.country,
        phone            : req.body.phone,
        status           : req.body.status,
        totalPrice       : totalPrice,
        user             : req.body.user
    })
    // Guardamos la orden en la BD y la manejamos con un async-await.
    order = await order.save();
    // Si se produce algún error.
    if(!order) return res.status(500).send('The order cannot be created.');
    // Si no se produce ningún error.
    res.status(200).send(order);
});

////////// HTTP REQUEST PUT //////////
// Manejamos el put con un async-await.
router.put('/:id', async (req, res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Order Id.')
    }
    // Creamos una instancia de Order, buscamos por el id y actualizamos los campos.
    const orderUpdated = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true} // Al hacer el put devuelve la data nueva.
    );
    // Si se produce algún error.
    if(!orderUpdated) return res.status(500).send('The order cannot be updated.');
    // Si no se produce ningún error.
    res.status(200).send(orderUpdated);
});

////////// HTTP REQUEST DELETE //////////
// Manejamos el delete con un async-await.
router.delete('/:id', (req,res) => {
    // Primero, debemos validar si el id que estamos pasando tiene el formato correcto que genera MongoDB.
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Format Order Id.')
    }
    // Encontramos la orden por el id y la eliminamos, pero antes recorremos el array de la ordenItems con un map() para obtener los ids de los items y poder borrarlos también.
    Order.findByIdAndRemove(req.params.id)
        .then(async order => {
            // Si encuentra una orden.
            if(order) {
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndRemove(orderItem)
                })
                return res.status(200).send(`The order with Id: '${order._id}' has been deleted!`);
            } else {
                // Si no encuentra la orden.
                return res.status(400).send('Order not found!');
            }
        })
        .catch(err => {
            return res.status(500).json({
                success: false,
                error: err
            });
        });
});

// Exportamos el módulo
module.exports = router;