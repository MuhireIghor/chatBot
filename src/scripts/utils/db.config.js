const dotenv = require("dotenv")
dotenv.config()
const mongoose = require("mongoose")
const connectDb = ()=>{
    const db_conn = mongoose.connect(`mongodb+srv://devighor:${process.env.DB_PASSWORD}@whatsappchatbot.1c5dng5.mongodb.net/whatsappChatbot`,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    const db = mongoose.connection;
    db.on('error',()=>{
        console.log('error occured while connecting to the db')
    })
    db.once('open',()=>{
        console.log('successfully connected to the db')
    })
}
module.exports = {connectDb}