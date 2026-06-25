const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ─── ORDER ALERT ──────────────────────────────────────
async function sendTelegramAlert(order) {
  const { reference, customer, items, total, address } = order;

  const itemsList = items.map(item =>
    `  • ${item.name} (${item.size}, ${item.color}) x${item.quantity} — ₦${(item.price * item.quantity).toLocaleString()}`
  ).join('\n');

  const message = `
🛍️ *NEW STYLUS ORDER!*

📦 *Order Ref:* \`${reference}\`
💰 *Total:* ₦${total.toLocaleString()}

👤 *Customer:*
  Name: ${customer.name}
  Email: ${customer.email}
  Phone: ${customer.phone}

📍 *Delivery Address:*
  ${address.street}
  ${address.city}, ${address.state}
  ${address.country}

🧾 *Items:*
${itemsList}

✅ *Payment: CONFIRMED via Paystack*
  `.trim();

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('✅ Telegram order alert sent:', reference);
  } catch (err) {
    console.error('❌ Telegram alert failed:', err.response?.data || err.message);
  }
}

// ─── DAILY BROADCAST ──────────────────────────────────
async function sendDailyBroadcast() {
  const messages = [
    `🖤 *Good morning from STYLUS!*\n\nStart your day looking premium. Our signature oversized tees are crafted for those who move with intention.\n\n✨ Premium heavyweight cotton\n📦 Nationwide delivery\n💳 Secure payment via Paystack\n\n👉 Shop now: ${process.env.STORE_URL}\n\n#STYLUS #PremiumFashion #NigerianFashion`,
    `🔥 *STYLUS Daily Drop*\n\nDressed in shadow. Built for the bold.\n\nOversized tees starting at ₦20,000. Power Suit Set at ₦180,000.\n\n🌍 We ship worldwide\n📲 Order now: ${process.env.STORE_URL}\n\n#STYLUS #StreetWear #LagosStyle`,
    `👑 *STYLUS — Elevated Essentials*\n\nNot just clothing. A statement.\n\nAvailable in Black, Navy, Burgundy & Brown.\nSizes S to XXL.\nCustom orders available in dozens.\n\n🛍️ Shop: ${process.env.STORE_URL}\n\n#STYLUS #OversizedTee #NigerianBrand`,
    `💎 *Custom Orders Available!*\n\nWant your own design? We got you.\n\nMinimum 12 pieces — any colour, any design, your logo.\nPerfect for groups, events, or your own brand.\n\n📲 Contact us on WhatsApp: +${process.env.WHATSAPP_NUMBER}\n🛍️ Shop: ${process.env.STORE_URL}\n\n#STYLUS #CustomClothing #BulkOrder`,
    `🌟 *STYLUS Power Suit Set*\n\nThe room changes when you walk in.\n\nDeep burgundy double-breasted blazer + wide-leg trousers.\nWool-blend premium fabric.\nStructured shoulders.\n\n💰 ₦180,000\n🛍️ Order: ${process.env.STORE_URL}\n\n#STYLUS #PowerSuit #LuxuryFashion`,
    `🚀 *Why STYLUS?*\n\n✅ Premium quality guaranteed\n✅ Nationwide delivery in Nigeria\n✅ Worldwide shipping available\n✅ 14-day return policy\n✅ Secure payment via Paystack\n✅ Custom orders in dozens\n\n👉 ${process.env.STORE_URL}\n\n#STYLUS #NigerianFashion #PremiumClothing`,
    `💫 *Weekend Fits Start Here*\n\nYour wardrobe needs a STYLUS piece.\n\nOversized tees in 4 premium colours.\nBuilt for those who dress with intention.\n\n🛍️ Shop now: ${process.env.STORE_URL}\n📲 WhatsApp: +${process.env.WHATSAPP_NUMBER}\n\n#STYLUS #WeekendVibes #StyledByStylus`
  ];

  const today = new Date().getDay();
  const message = messages[today % messages.length];

  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    console.log('✅ Daily broadcast sent');
  } catch (err) {
    console.error('❌ Daily broadcast failed:', err.response?.data || err.message);
  }
}

module.exports = { sendTelegramAlert, sendDailyBroadcast };
