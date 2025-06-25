require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client();

// 🔁 Function to send a message to DeepSeek model (running via Ollama)
async function getDeepSeekReply(userMessage) {
  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: "deepseek-coder",  // or "deepseek-chat" if you pulled that
      messages: [
        { role: "user", content: userMessage }
      ],
      stream: false
    });

    return response.data.message.content;
  } catch (err) {
    console.error("💥 DeepSeek error:", err.message);
    return "Sorry, DeepSeek is not available right now.";
  }
}

// 🔌 WhatsApp QR Code Setup
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above with WhatsApp');
});

client.on('ready', () => {
  console.log('✅ WhatsApp Web client is ready!');
});

// 📩 On Message Received
client.on('message', async (message) => {
  console.log(`📩 Message from ${message.from}: ${message.body}`);

  const reply = await getDeepSeekReply(message.body);
  await message.reply(reply);
});

client.initialize();
