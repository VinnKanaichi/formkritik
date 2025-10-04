import fetch from "node-fetch";

export const config = {
  api: { bodyParser: false }
};

import multiparty from "multiparty";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  const form = new multiparty.Form();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    const name = fields.name?.[0] || "-";
    const contact = fields.contact?.[0] || "-";
    const message = fields.message?.[0] || "-";
    const photoFile = files.photo?.[0];

    const caption = `📩 *Pesan Komplain Baru*\n\n👤 Nama: ${name}\n📞 Kontak: ${contact}\n💬 Pesan:\n${message}`;

    try {
      const BOT_TOKEN = process.env.BOT_TOKEN;
      const CHAT_ID = process.env.CHAT_ID;

      if (photoFile) {
        const formData = new FormData();
        formData.append("chat_id", CHAT_ID);
        formData.append("caption", caption);
        formData.append("photo", fs.createReadStream(photoFile.path));

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: "POST",
          body: formData
        });
      } else {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: CHAT_ID, text: caption, parse_mode: "Markdown" })
        });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
