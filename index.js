require("dotenv").config();
const express = require("express");
const { Client, LocalAuth, Buttons, List } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const NodeCache = require("node-cache");

const app = express();
app.use(express.json());

const userState = new NodeCache({ stdTTL: 0 });

const client = new Client({
    authStrategy: new LocalAuth(), 
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

// QR Code
client.on("qr", (qr) => {
    console.log("Scan QR Code:");
    qrcode.generate(qr, { small: true });
});

// Ready
client.on("ready", () => {
    console.log("WhatsApp Bot is READY 🚀");
});

// Message Handler
client.on("message", async (message) => {
    const chatId = message.from;

    // Ignore group messages
    if (message.from.includes("@g.us")) return;

    const user = userState.get(chatId);

    // If user has no role yet
    if (!user) {
        await sendRoleList(chatId);
        userState.set(chatId, { step: "awaiting_role" });
        return;
    }

    // Handle role selection
    if (user.step === "awaiting_role") {
        const role = message.body.toLowerCase();

        const validRoles = ["principal", "admin", "parent", "new customer"];

        if (!validRoles.includes(role)) {
            await client.sendMessage(chatId, 
                "Please type one of: Principal, Admin, Parent, New Customer");
            return;
        }

        userState.set(chatId, { role, step: "completed" });
        await sendGreeting(chatId, role);
        return;
    }

    // Default fallback
    await client.sendMessage(chatId, "Type 'menu' anytime to restart.");
});

// Send Role Selection List
async function sendRoleList(chatId) {

    const sections = [
        {
            title: "Select Your Role",
            rows: [
                { id: "principal", title: "Principal", description: "" },
                { id: "admin", title: "Admin", description: "" },
                { id: "parent", title: "Parent", description: "" },
                { id: "new customer", title: "New Customer", description: "" }
            ]
        }
    ];

    const list = new List(
        "Welcome! Please choose your role:",
        "Select Role",
        sections,
        "Role Selection",
        "Choose carefully"
    );

    await client.sendMessage(chatId, list);
}

// Greeting Function
async function sendGreeting(chatId, role) {

    let text = "";

    switch (role) {
        case "principal":
            text = "🎓 Welcome Principal! We are excited to help manage your institution.";
            break;
        case "admin":
            text = "🛠 Welcome Admin! Let’s configure your dashboard.";
            break;
        case "parent":
            text = "👨‍👩‍👧 Welcome Parent! Stay connected with your child's progress.";
            break;
        case "new customer":
            text = "✨ Welcome! Let’s explore how we can help you.";
            break;
    }

    await client.sendMessage(chatId, text);
}

// Health Route for Railway
app.get("/", (req, res) => {
    res.send("WhatsApp Bot Running 🚀");
});

// Start Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize WhatsApp
client.initialize();
