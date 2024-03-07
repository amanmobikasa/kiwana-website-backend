const mongoose = require('mongoose');

// connecting the mongodb with express js
const URL = "mongodb://127.0.0.1:27017/kiwana-backend";
mongoose.connect(URL,
  {
    useNewUrlParser: true, 

    useUnifiedTopology: true 
}
).then(()=>console.log("***Connection Successfull ***")).catch((err)=>console.log("error in connection",err))