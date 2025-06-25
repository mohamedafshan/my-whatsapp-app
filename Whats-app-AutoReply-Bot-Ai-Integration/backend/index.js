const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load Routes
const messageRoutes = require('./api/messages');
app.use('/api/messages', messageRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`API Server running at http://localhost:${PORT}`);
});

// WhatsApp Bot
const whatsappService = require('./services/whatsappService');
whatsappService.initialize();