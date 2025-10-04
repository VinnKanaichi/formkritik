import express from "express";
import fetch from "node-fetch";
import multer from "multer"; // Untuk handle file upload
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const upload = multer(); // Untuk file form-data

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
app.use(express.json());
app.use(express.static(path.join(path.resolve(), 'public'))); // untuk HTML kamu

app.post("/send-message", upload.single("photo"), async (req, res) => {
  try {
    const { name, contact, message } = req.body;
    const photo = req.file; // Jika ada
    const caption = `📩 *Pesan Komplain Baru*\n\n👤 Nama: ${name}\n📞 Kontak: ${contact || "-"}\n💬 Pesan:\n${message}`;

    if (photo) {
      // Kirim foto
      const formData = new FormData();
      formData.append("chat_id", CHAT_ID);
      formData.append("caption", caption);
      formData.append("photo", photo.buffer, photo.originalname);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: formData
      });
    } else {
      // Kirim teks
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: caption, parse_mode: "Markdown" })
      });
    }

    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

