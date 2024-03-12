const express = require("express");
const mongoose = require("mongoose");
require("./db/conn");
const app = express();
require("./db/conn"); // require the conn file.
require("dotenv").config();
const UserSignUp = require("./model/userSchema"); // import the user schema from model folder.
// const UserLogin = require('./model/userSchema');
const SubscribeSchema = require("./model/subscribeSchema"); // for subscribe schema of user
const ContactUsSchema = require("./model/contactusSchema"); // crate a contactus schema for user email popup subscription
const OrderProductModel = require("./model/orderProductSchema");

const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
let jwtSecretKey = process.env.SECRET_KEY;
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

app.post("/payment", cors(), async (req, res) => {
  // console.log("request", req.body);
  let { amount, id } = req.body;
  // console.log("dataTemp", req.body);
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "kiwana product",
      payment_method: id,
      confirm: true,
      return_url: "http://localhost:3000/login",
    });
    console.log(payment, "successful");
    res.json({
      message: "Payment successful",
      success: true,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "payment failed",
      success: false,
    });
  }
});

// for signup page api config
app.post("/signup", cors(), async (req, res) => {
  // Replace this part with your actual signup logic (e.g., database insertion)
  const { username, email, password, address, phone_number, date_of_birth } =
    req.body;

  try {
    const user = new UserSignUp({
      username: username,
      email: email,
      password: password,
      address: address,
      phone_number: phone_number,
      date_of_birth: date_of_birth,
    });
    const userRegister = await user.save();
    if (userRegister) {
      console.log("userRegister", userRegister);
      return res.json({
        status: 200,
        success: true,
        message: "Signup successful",
      });
    } else {
      console.log("userRegister is not done");
      return res.json({
        status: 400,
        success: false,
        message: "Signup failed",
      });
    }
  } catch (error) {
    res.status(402).json({
      success: false,
      message: "Signup failed. Please provide valid information.",
      error: error,
    });
    console.log("error is", error);
  }
});

// user login validation
app.post("/login", cors(), async (req, res) => {
  const { email, password } = req.body;
  try {
    const userLogin = await UserSignUp.findOne({
      email: email,
      password: password,
    });
    if (userLogin) {
      const token = jwt.sign({ email }, jwtSecretKey, {
        expiresIn: "2h",
      });
      return res.json({
        status: 200,
        success: true,
        jwtToken: token,
        data: userLogin,
        message: "Login successful",
      });
    } else {
      console.log("userLogin is not done");
      return res.json({
        status: 400,
        success: false,
        message: "Login failed",
      });
    }
  } catch (error) {
    res.status(402).json({
      success: false,
      message: "Login failed. Please provide valid information.",
      error: error,
    });
    console.log("error is", error);
  }
});

// for change the address of user api endpoint.
app.put("/change-address", cors(), async (req, res) => {
  // const { dataObj } = req.body;
  const { email, address } = req.body;
  console.log(req.body);
  try {
    const userAddress = await UserSignUp.findOneAndUpdate(
      { email: email },
      { address: address },
      { new: true }
    );
    if (userAddress) {
      console.log("userAddress", userAddress);
      return res.json({
        status: 200,
        success: true,
        data: userAddress,
        message: "Successfully change the address",
      });
    } else {
      console.log("userAddress is not done");
      return res.json({
        status: 400,
        success: false,
        message: "Not change the address",
      });
    }
  } catch (error) {
    res.status(402).json({
      success: false,
      message: "Not change the address",
      error: error,
    });
    console.log("error is", error);
  }
});

// for subscription of newsletter. model name : "SubscribeSchema"

app.post("/subscribe", cors(), async (req, res) => {
  // console.log(req.body);
  try {
    let { email, confirm } = req.body;
    console.log("email and confirm", email, confirm);
    const userSubscribe = await SubscribeSchema.findOne({ email: email });
    // console.log("userSubscribe",userSubscribe)
    if (userSubscribe) {
      console.log("userSubscribeNow", userSubscribe);
      return res.json({
        status: 503,
        success: false,
        data: userSubscribe,
        message: "Already subscribe the newsletter",
      });
    } 
      let data = new SubscribeSchema({ email: email, confirm : confirm || true });
      let user = await data.save();
      if (user) {
        console.log("user", user);
        return res.json({
          status: 200,
          success: true,
          data: user,
          message: "Successfully subscribe the newsletter",
        });
      } else {
        console.log("user is not done");
        return res.json({
          status: 400,
          success: false,
          message: "Not subscribe the newsletter",
        });
      }
    
  } catch (error) {
    res.status(402).json({
      success: false,
      message: "Not subscribe the newsletter",
      error: error,
    });
    console.log("error is", error);
  }
});

// create a contact us api endpoint for user easily asked query to us.
app.post("/contactus", cors(), async (req, res) => {
  const { name, email, phone_number, subject, message } = req.body;

  try {
    const contact = new ContactUsSchema({
      name: name,
      email: email,
      phone_number: phone_number,
      subject: subject,
      message: message,
    });
    const contactSaved = await contact.save();
    if (contactSaved) {
      console.log("contactSaved", contactSaved);
      return res.json({
        status: 200,
        success: true,
        message: "Contact details saved successfully",
      });
    } else {
      console.log("Contact details not saved");
      return res.json({
        status: 400,
        success: false,
        message: "Failed to save contact details",
      });
    }
  } catch (error) {
    res.status(402).json({
      success: false,
      message:
        "Failed to save contact details. Please provide valid information.",
      error: error,
    });
    console.log("error is", error);
  }
});

// create a final order product after the payment successfull.
app.post("/order-product", async (req, res) => {
  const { product_order } = req.body;
  if(Array.isArray(product_order) && product_order.length > 0){
    product_order.forEach(async (element) => {
    try {
      const OrderProduct = new OrderProductModel({product_details : element})
      const OrderProductSaved = await OrderProduct.save();
      if(OrderProductSaved){
        return res.json({
          status: 200,
          success: true,
          data: OrderProductSaved,
          message: "Order product details saved successfully",
        });
      }else{
        return res.json({
          status: 400,
          success: false,
          message: "Failed to save order product details",
          error: error
        })
      }
    } catch (error) {
      res.status(402).json({
            success: false,
            message:"Failed to save order product details. Please provide valid information.",
            error: error,
        });
    }
  })
  }else{
    return res.json({
      status: 500,
      success: false,
      message: "Failed to save order product details. Please provide valid information.",
      error: error,
    })
  }
});

// create a put method api function that will update the order products but order id will be same.

app.put("/order-product", async (req, res) => {
  const {objData, orderId } = req.body;

  console.log("dataObj", objData, "order-id", orderId)
  if(Array.isArray(objData) && objData.length > 0){
    objData.forEach(async (element) => {
      try {
        const updateOrderProduct = await OrderProductModel.findOneAndUpdate(
          {order_id : orderId},
          {product_details : element },
          { new: true}
        );
        if(updateOrderProduct){
          return res.json({
            status: 200,
            success: true,
            data: updateOrderProduct,
            message: "Update order product details successfully",
          });
        }else{
          return res.json({
            status: 400,
            success: false,
            message: "Failed to update order product details",
            error: error
          })
        }
      } catch (error) {
        res.status(402).json({
          success: false,
          message:"Failed to update order product details. Please provide valid information.",
          error: error,
        });
      }
    })
  }else{
    return res.json({
      status: 500,
      success: false,
      message: "Failed to update order product details. Please provide valid information.",
      error: error,
    })
  }
});

// delete the order when the user cancel the order.
app.delete("/delete-order/:order_id", async (req, res) => {
  const { order_id } = req.params;
  console.log("order_id", order_id);

  try {
    const deleteOrder = await OrderProductModel.deleteOne({
      order_id: order_id,
    });
    if (deleteOrder){
      console.log("deleteOrder", deleteOrder);
      return res.json({
        status: 200,
        success: true,
        data : order_id,
        message: "Order deleted successfully",
      });
    } else {
      console.log("Order not deleted");
      return res.json({
        status: 400,
        success: false,
        message: "Failed to delete order",
      });
    }
  } catch (error) {
    res.status(402).json({
      success: false,
      message: "Failed to delete order. Please provide valid information.",
      error: error,
    });
  }
});

// create a subscribe box api for checking the email is already subscribe or not

app.listen(process.env.PORT || 4000, () => {
  console.log("sever is listen in port no 4000");
});
