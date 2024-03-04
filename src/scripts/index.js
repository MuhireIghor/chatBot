const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require("dotenv")
const {Client} = require("whatsapp-web.js");
const { connectDb } = require('./utils/db.config');
dotenv.config()

const client = new Client()

const app = express();
const port = 3000;
let isFirstMessage = true; // Flag to track the first message

// Connect to database 

connectDb()
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
// client.on("qr",(qr)=>{
//   console.log(`qr code received ${qr}`)
// })
client.on("message",(message)=>{
  console.log(message,from,message.body)
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
