// /api/send.js
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // kita pakai busboy nanti
  },
};

import Busboy from "busboy";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const busboy = Busboy({ headers: req.headers });
  const fields = {};
  const files = [];

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    let buffer = [];
    file.on("data", (data) => buffer.push(data));
    file.on("end", () => {
      files.push({ buffer: Buffer.concat(buffer), filename, mimetype });
    });
  });

  busboy.on("field", (fieldname, val) => {
    fields[fieldname] = val;
  });

  busboy.on("finish", async () => {
    try {
      const BOT_TOKEN = process.env.BOT_TOKEN;
      const CHAT_ID = process.env.CHAT_ID;
      const caption = `📩 *Pesan Komplain Baru*\n\n👤 Nama: ${fields.name}\n📞 Kontak: ${fields.contact || "-"}\n💬 Pesan:\n${fields.message}`;

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("caption", caption);
        formData.append("photo", files[0].buffer, { filename: files[0].filename, contentType: files[0].mimetype });

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, { method: "POST", body: formData });
      } else {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: caption, parse_mode: "Markdown" }),
        });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Gagal kirim pesan" });
    }
  });

  req.pipe(busboy);
}
