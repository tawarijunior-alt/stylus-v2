require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cron = require('node-cron');
const products = require('./products');
const { sendTelegramAlert, sendDailyBroadcast } = require('./telegram');
const { sendOrderConfirmation, sendWelcomeEmail } = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-hashes'", "https://js.paystack.co", "https://checkout.paystack.com", "https://cdn.jsdelivr.net"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.paystack.co", "https://*.supabase.co", "https://accounts.google.com"],
      frameSrc: ["https://checkout.paystack.com", "https://accounts.google.com"],
      formAction: ["'self'", "https://accounts.google.com"]
    }
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// ─── DAILY TELEGRAM BROADCAST ─────────────────────────
// Runs every day at 8AM Nigeria time (7AM UTC)
cron.schedule('0 7 * * *', async () => {
  console.log('📢 Sending daily broadcast...');
  await sendDailyBroadcast();
}, { timezone: 'Africa/Lagos' });

// ─── PRODUCTS ─────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category, sort, search } = req.query;
  let result = [...products];

  if (category && category !== 'All') {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.colors.some(c => c.toLowerCase().includes(q))
    );
  }

  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (sort === 'featured') result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  res.json({ success: true, products: result, total: result.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// ─── REVIEWS ──────────────────────────────────────────
const reviews = [];

app.get('/api/reviews/:productId', (req, res) => {
  const productReviews = reviews.filter(r => r.productId === req.params.productId);
  res.json({ success: true, reviews: productReviews });
});

app.post('/api/reviews', (req, res) => {
  const { productId, name, rating, comment } = req.body;
  if (!productId || !name || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  const review = {
    id: uuidv4(),
    productId,
    name,
    rating: parseInt(rating),
    comment,
    date: new Date().toISOString()
  };
  reviews.push(review);
  res.json({ success: true, review });
});

// ─── DISCOUNT CODES ───────────────────────────────────
const discountCodes = {
  'WELCOME10': { type: 'percent', value: 10, description: '10% off your order' },
  'STYLUS20': { type: 'percent', value: 20, description: '20% off your order' },
  'LAUNCH50': { type: 'fixed', value: 5000, description: '₦5,000 off your order' },
  'VIP30': { type: 'percent', value: 30, description: '30% off for VIP customers' }
};

app.post('/api/discount/validate', (req, res) => {
  const { code, total } = req.body;
  const discount = discountCodes[code?.toUpperCase()];
  if (!discount) {
    return res.json({ success: false, message: 'Invalid discount code' });
  }
  let savings = 0;
  if (discount.type === 'percent') {
    savings = Math.round(total * discount.value / 100);
  } else {
    savings = discount.value;
  }
  const newTotal = Math.max(0, total - savings);
  res.json({ success: true, discount, savings, newTotal });
});

// ─── PAYMENT ──────────────────────────────────────────
app.post('/api/payment/initialize', async (req, res) => {
  const { customer, items, address, discountCode } = req.body;
  if (!customer?.email || !customer?.name || !items?.length) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let total = 0;
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (!product) return res.status(400).json({ success: false, message: `Product ${item.id} not found` });
    total += product.price * item.quantity;
  }

  // Apply discount
  if (discountCode) {
    const discount = discountCodes[discountCode.toUpperCase()];
    if (discount) {
      if (discount.type === 'percent') {
        total = Math.round(total * (1 - discount.value / 100));
      } else {
        total = Math.max(0, total - discount.value);
      }
    }
  }

  const reference = `STYLUS-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: customer.email,
        amount: total * 100,
        reference,
        currency: 'NGN',
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: customer.name },
            { display_name: 'Phone', variable_name: 'phone', value: customer.phone || 'N/A' },
            { display_name: 'Address', variable_name: 'address', value: `${address?.street}, ${address?.city}, ${address?.state}` },
            { display_name: 'Items', variable_name: 'items', value: items.map(i => `${i.name} x${i.quantity}`).join(', ') }
          ],
          customer, items, address, total, discountCode
        }
      },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' } }
    );
    res.json({ success: true, authorization_url: response.data.data.authorization_url, reference, total });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Payment initialization failed' });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  const { reference } = req.body;
  if (!reference) return res.status(400).json({ success: false, message: 'Reference required' });

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const data = response.data.data;
    if (data.status === 'success') {
      const metadata = data.metadata;
      const order = {
        reference,
        customer: metadata.customer,
        items: metadata.items,
        total: metadata.total,
        address: metadata.address,
        discountCode: metadata.discountCode,
        date: new Date().toISOString()
      };
      await sendTelegramAlert(order);
      await sendOrderConfirmation(order);
      res.json({ success: true, order });
    } else {
      res.json({ success: false, message: 'Payment not confirmed' });
    }
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// ─── NEWSLETTER ───────────────────────────────────────
const subscribers = [];

app.post('/api/newsletter', async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const exists = subscribers.find(s => s.email === email);
  if (exists) return res.json({ success: false, message: 'Already subscribed' });

  subscribers.push({ email, name: name || 'Friend', date: new Date().toISOString() });

  await sendWelcomeEmail(email, name || 'Friend');

  res.json({ success: true, message: 'Subscribed successfully' });
});

// ─── CUSTOM ORDER ─────────────────────────────────────
app.post('/api/custom-order', async (req, res) => {
  const { name, email, phone, quantity, description, budget } = req.body;
  if (!name || !email || !phone || !quantity) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const message = `
🎨 *NEW CUSTOM ORDER REQUEST!*

👤 *Customer:*
  Name: ${name}
  Email: ${email}
  Phone: ${phone}

📦 *Order Details:*
  Quantity: ${quantity} pieces
  Description: ${description || 'Not specified'}
  Budget: ${budget || 'Not specified'}

📲 Contact customer to discuss details!
  `.trim();

  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });
    res.json({ success: true, message: 'Custom order request received! We will contact you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
});

// ─── CONFIG ───────────────────────────────────────────
app.get('/api/config', (req, res) => {
  res.json({
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
    whatsappNumber: process.env.WHATSAPP_NUMBER,
    storeName: process.env.STORE_NAME,
    storeUrl: process.env.STORE_URL
  });
});

// ─── HEALTH ───────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', store: 'STYLUS V2', time: new Date().toISOString() }));

app.listen(PORT, () => console.log(`🖤 STYLUS V2 running on port ${PORT}`));
