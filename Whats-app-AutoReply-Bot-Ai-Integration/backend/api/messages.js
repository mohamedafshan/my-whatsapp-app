const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Use root '/' instead of '/messages'
router.get('/', (req, res) => {
  db.query('SELECT * FROM whatsapp_messages ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

module.exports = router;