// === WhatsApp & DB Setup ===
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const db = require('./db/connection');

// === Express API Setup ===
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

//API Route: Get all WhatsApp messages
app.get('/api/messages', (req, res) => {
  db.query('SELECT * FROM whatsapp_messages ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

//Start API Server
app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
});

// === WhatsApp Bot Setup ===
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox'],
  },
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code with your WhatsApp');
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.on('message', async (message) => {
  const userMessage = message.body.toLowerCase().trim();
  const sender = message.from;
  console.log(`Received from ${sender}: ${userMessage}`);

  try {
    const customResponses = [
      {
        keywords: ['who are you', 'your name', 'யார் நீ', 'உங்க பேர்', 'நீ யாரு'],
        reply: "👋 நான் Rubysoft, உங்களோட சின்ன but smart assistant!",
      },
      {
        keywords: ['who made you', 'developer', 'யார் உருவாக்கினார்', 'யார் செஞ்சது', 'unnai yar padaithathu'],
        reply: "👨‍💻 எனை உருவாக்கியது Afshan Ashath, ஒரு Full Stack Developer.",
      },
      {
        keywords: ['who is afshan', 'afshan ashath', 'afshan யார்', 'அப்ஷான் யார்'],
        reply: "👨‍💻 Afshan Ashath ஒரு Full Stack Developer. LinkedIn இல் அவர் பற்றி மேலும் காணலாம்: https://www.linkedin.com/in/afshan-ashath",
      },
      {
        keywords: ['what is your purpose', 'what can you do', 'உன் வேலை என்ன', 'நீ என்ன செய்ய முடியும்'],
        reply: "🤖 நான் உங்கள் கேள்விகளுக்கு பதில் அளிக்க, தகவல்களை பகிர, மற்றும் சில automation வேலைகளை செய்ய வந்திருக்கிறேன் — Rubysoft சார்பாக.",
      }
    ];

    for (let rule of customResponses) {
      if (rule.keywords.some(kw => userMessage.includes(kw))) {
        await client.sendMessage(sender, rule.reply);
        db.query(
          'INSERT INTO whatsapp_messages (sender, user_message, ai_response) VALUES (?, ?, ?)',
          [sender, userMessage, rule.reply],
          (err) => {
            if (err) console.error('Failed to insert custom reply:', err);
            else console.log('Custom reply stored in DB');
          }
        );
        return;
      }
    }

    // Fallback custom message
    const fallback = "🙏 மன்னிக்கவும், உங்கள் கேள்விக்கு பதில் இல்லை. தயவுசெய்து வேறு சொல்லுங்கள்.";
    await client.sendMessage(sender, fallback);
    db.query(
      'INSERT INTO whatsapp_messages (sender, user_message, ai_response) VALUES (?, ?, ?)',
      [sender, userMessage, fallback],
      (err) => {
        if (err) console.error('❌ Failed to insert fallback reply:', err);
        else console.log('✅ Fallback reply stored in DB');
      }
    );

  } catch (error) {
    console.error('❌ Error:', error.message);
    const failMessage = "⚠️ தற்போது தொழில்நுட்ப பிரச்சனை உள்ளது. தயவு செய்து பிறகு முயற்சிக்கவும்.";
    await client.sendMessage(sender, failMessage);
  }
});

// ✅ Start WhatsApp Bot
client.initialize();
