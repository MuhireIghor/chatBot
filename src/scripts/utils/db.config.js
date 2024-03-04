const mongoose = require("mongoose")
export const connectDb = async()=>{
    const connection  = mongoose.connect(`mongodb+srv://devighor:${process.env.DB_PASSWORD}@whatsappchatbot.1c5dng5.mongodb.net/whatsappChatbot`,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    const db = (await connection).Connection
}