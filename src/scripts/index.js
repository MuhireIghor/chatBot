const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv")
const {Client} = require("whatsapp-web.js")
dotenv.config()

const client = new Client()

const app = express();
const port = 3000;
let isFirstMessage = true; // Flag to track the first message

// Connect to database 
mongoose.connect(`mongodb+srv://devighor:${process.env.DB_PASSWORD}@whatsappchatbot.1c5dng5.mongodb.net/whatsappChatbot`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', ()=>console.log('MongoDB connection error:'))
db.once('open', () => console.log('Connected to MongoDB database'));

// CORS configuration 
app.use(cors({ origin: '*' })); 

app.use(express.json());

// Schema for storing user session and QR code data
const sessionSchema = new mongoose.Schema({
  sessionId: String,
  qrData: String,
});

const Session = mongoose.model('Session', sessionSchema);


app.post('/qr-code', async (req, res) => {
  try {
    const { qrData } = req.body;

    // Generate unique session ID
    const sessionId = Math.random().toString(36).substring(2, 15);

    // Create a new session
    const newSession = new Session({
      sessionId,
      qrData,
    });

    await newSession.save();

    res.json({ message: 'QR code data received successfully!', sessionId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing QR code data' });
  }
});
client.on("qr",(qr)=>{
  console.log(`qr code received ${qr}`)
})
client.on("message",(message)=>{
  const content = message.body;
  if (content.toLowerCase() === 'hi') {
    client.sendMessage(message.from,"How are u doing")

 
  } else {
    client.sendMessage(message.from,"Hello there ")

  }
})
client.on("ready",()=>{
  console.log("Whatsapp loaded successfully!")
})
client.initialize()

app.listen(port, () => console.log(`Server listening on port ${port}`));
