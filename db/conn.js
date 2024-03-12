const mongoose = require('mongoose');

// connecting the mongodb with express js
const URL1 = "mongodb+srv://webamanchauhan:ABNMxCwBMMfB4lUo@cluster0.dxlp0mo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const URL2 = "mongodb://127.0.0.1:27017/kiwana-backend"

mongoose.connect(URL1 || URL2,
  {
    useNewUrlParser: true, 

    useUnifiedTopology: true 
}
).then(()=>console.log("***Connection Successfull ***")).catch((err)=>console.log("error in connection",err))