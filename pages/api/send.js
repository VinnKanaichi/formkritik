export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, contact, message } = req.body;

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    const text = `📩 *Pesan Komplain Baru*\n\n👤 Nama: ${name}\n📞 Kontak: ${contact || "-"}\n💬 Pesan:\n${message}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" }),
      });

      const data = await response.json();
      if (data.ok) return res.status(200).json({ success: true });
      else return res.status(500).json({ success: false, error: data.description });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}
