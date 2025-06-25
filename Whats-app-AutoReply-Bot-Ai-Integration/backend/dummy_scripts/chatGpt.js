require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');

const client = new Client();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above with WhatsApp');
});

client.on('ready', () => {
  console.log('WhatsApp Web client is ready!');
});

client.on('message', async message => {
  console.log(`Message from ${message.from}: ${message.body}`);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message.body }],
    });

    const reply = response.choices[0].message.content;
    await message.reply(reply);

  } catch (error) {
    console.error('OpenAI API error:', error);
    await message.reply('Sorry, I am unable to respond right now.');
  }
});

client.initialize();
