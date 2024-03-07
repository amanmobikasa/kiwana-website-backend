const mongoose = require('mongoose');

const orderProductSchema = new mongoose.Schema({
    product_details : {
        type : Object,
        required : true
    },
    order_id : {
        type : String,
        require : true,
        default : `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    order_date : {
        type : Date,
        default :  Date.now,
    },
    orderStatus : {
        type : String,
        required : true,
        default : "order-placed",
    }
});

const OrderProduct = mongoose.model('OrderProduct', orderProductSchema);

module.exports = OrderProduct;



