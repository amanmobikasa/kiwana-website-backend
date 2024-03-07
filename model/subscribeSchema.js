const mongoose = require('mongoose');

const subscribeSchema = mongoose.Schema({
    email: {
        type : String,
        required : true,
        unique : true,
      },
    confirm : {
      type : Boolean,
      default : true,
    }
})


const SubscribeSchema = mongoose.model("SubsSchema", subscribeSchema);
module.exports = SubscribeSchema;
