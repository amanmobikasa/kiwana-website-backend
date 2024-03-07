const mongoose = require('mongoose');

// create the signup schema
const signupSchema = mongoose.Schema({
    username: {
      type : String,
      required : true,
    },
    email: {
      type : String,
      required : true,
      unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    address: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    date_of_birth: {
      type: String,
      required: true,
    }
  });

  // user login schema.

  const userLoginSchema = mongoose.Schema({
    user_email : {
      type : String,
      required : true,
      unique : true,
    },
    password : {
      type : String,
      required : true,
    }
  })

  
  const UserSignUp = mongoose.model("UserSignUp", signupSchema);
  const UserLogin = mongoose.model("UserLogin", userLoginSchema);
module.exports = UserSignUp, UserLogin;