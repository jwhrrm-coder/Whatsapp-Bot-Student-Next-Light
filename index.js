require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
    res.send("WhatsApp Bot Running 🚀");
});

// 1️⃣ Send menu message manually
app.get("/send-demo", async (req, res) => {

    const phone = "919073466806"; // change this

    const message = `Welcome!

Reply with:
1 - Principal
2 - Admin
3 - Parent
4 - New Customer`;

    try {
        const response = await axios.get("https://whatssms.in/textmsg.php", {
            params: {
                appkey: process.env.APP_KEY,
                authkey: process.env.AUTH_KEY,
                to: phone,
                message: message
            }
        });

        res.json({ sent: true, apiResponse: response.data });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 2️⃣ Webhook to receive replies
app.post("/webhook", async (req, res) => {

    console.log("Incoming Webhook:", req.body);

    // ⚠ You must check actual payload format from provider
    const from = req.body.from;     // adjust after testing
    const message = req.body.message; // adjust after testing

    if (!from || !message) {
        return res.sendStatus(200);
    }

    let replyText = "";

    switch (message.trim()) {
        case "1":
            replyText = "🎓 Welcome Principal!";
            break;
        case "2":
            replyText = "🛠 Welcome Admin!";
            break;
        case "3":
            replyText = "👨‍👩‍👧 Welcome Parent!";
            break;
        case "4":
            replyText = "✨ Welcome New Customer!";
            break;
        default:
            replyText = "Please reply with 1, 2, 3, or 4.";
    }

    try {
        await axios.get("https://whatssms.in/textmsg.php", {
            params: {
                appkey: process.env.APP_KEY,
                authkey: process.env.AUTH_KEY,
                to: from,
                message: replyText
            }
        });
    } catch (err) {
        console.error("Reply error:", err.message);
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});