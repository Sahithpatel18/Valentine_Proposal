export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  const { recipientName, senderName } = req.body;

  // Validation
  if (!recipientName || !senderName) {
    return res.status(400).json({
      message: "Names are required"
    });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({
      message: "Telegram ENV keys missing"
    });
  }

  // Since NO button never works → always YES
  const message =
    `💍 ${recipientName} said YES to ${senderName}! ❤️🎉`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      error: "Telegram failed"
    });
  }
}
