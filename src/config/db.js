require("dotenv").config();
const  mongoose = require("mongoose")

const mondbUrl=process.env.MONGO_URI;

const connectDb=()=>{
    return mongoose.connect(mondbUrl);
}
module.exports={connectDb}
