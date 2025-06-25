const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const db = require("../config/db");

let client;

function formatSenderNumber(sender) {
  const cleanNumber = sender.split("@")[0];
  return "+" + cleanNumber;
}

function initialize() {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
    console.log("📱 Scan the QR code with your WhatsApp");
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client is ready!");
  });

  // 🔴 1. Incoming Message from Customer
  client.on("message", async (message) => {
    const sender = message.from;
    const formattedSender = formatSenderNumber(sender);
    const userMessage = message.body;

    // Avoid storing our own messages here
    if (!message.fromMe) {
      db.query(
        "INSERT INTO whatsapp_messages (sender, user_message) VALUES (?, ?)",
        [formattedSender, userMessage],
        (err) => {
          if (err) {
            console.error("❌ Failed to store user message:", err);
          } else {
            console.log("✅ User message stored in DB");
          }
        }
      );
    }
  });

  // 🔵 2. Outgoing Message Sent by YOU (from phone or node)
  client.on("message_create", async (msg) => {
    if (msg.fromMe) {
      const receiver = msg.to;
      const formattedReceiver = formatSenderNumber(receiver);
      const myReply = msg.body;
      const myAuthNumber = "+" + client.info.wid.user;

      db.query(
        "INSERT INTO whatsapp_messages (sender, ai_response, auth_number) VALUES (?, ?, ?)",
        [formattedReceiver, myReply, myAuthNumber],
        (err) => {
          if (err) {
            console.error("Failed to store your reply:", err);
          } else {
            console.log("Your reply stored with auth_number");
          }
        }
      );
    }
  });

  client.initialize();
}

module.exports = { initialize };
