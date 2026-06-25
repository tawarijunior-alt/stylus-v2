const products = [
  // ─── MEN'S COLLECTION ───────────────────────────────
  {
    id: "styl-m001",
    name: "STYLUS Oversized Tee — Black",
    category: "Men",
    price: 20000,
    description: "The icon. Our signature oversized tee in jet black — heavyweight 320gsm cotton with a drop-shoulder cut and embroidered STYLUS logo at chest. Clean, minimal, built to last. The kind of piece you reach for every time.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    image: "https://i.ibb.co/qYmBNYqt/5783152913105489649.jpg",
    badge: "Bestseller",
    stock: 20,
    featured: true
  },
  {
    id: "styl-m002",
    name: "STYLUS Oversized Tee — Navy",
    category: "Men",
    price: 20000,
    description: "Deep navy meets premium cotton. The STYLUS oversized tee in rich navy blue — same heavyweight 320gsm build, same drop-shoulder silhouette, same embroidered logo. Versatile enough for anything, sharp enough for everything.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy Blue"],
    image: "https://i.ibb.co/rGgw8XhP/5783152913105489652.jpg",
    badge: "New",
    stock: 14,
    featured: true
  },
  {
    id: "styl-m003",
    name: "STYLUS Oversized Tee — Burgundy",
    category: "Men",
    price: 20000,
    description: "Bold without trying. The STYLUS oversized tee in deep burgundy — a statement colour on a statement silhouette. Heavyweight cotton, drop-shoulder cut, embroidered STYLUS logo. Wear it like you mean it.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Burgundy"],
    image: "https://i.ibb.co/p6JQ1DMN/5783152913105489650.jpg",
    badge: null,
    stock: 10,
    featured: false
  },
  {
    id: "styl-m004",
    name: "STYLUS Oversized Tee — Brown",
    category: "Men",
    price: 20000,
    description: "Understated luxury. The STYLUS oversized tee in rich chocolate brown — premium heavyweight cotton with a relaxed drop-shoulder cut and embroidered STYLUS logo. Earth tones never looked this good.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Brown"],
    image: "https://i.ibb.co/Jg0QnPX/photo-2026-06-23-21-28-10.jpg",
    badge: null,
    stock: 9,
    featured: false
  },

  // ─── WOMEN'S COLLECTION ─────────────────────────────
  {
    id: "styl-w001",
    name: "STYLUS Women's Oversized Tee — Black",
    category: "Women",
    price: 20000,
    description: "Effortless. The STYLUS women's oversized tee in jet black — same premium heavyweight cotton and embroidered logo, cut for a feminine oversized silhouette. Style it knotted, tucked, or let it flow. All looks hit.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
    image: "https://i.ibb.co/4ZBkQK2J/photo-2026-06-23-21-28-07.jpg",
    badge: "New",
    stock: 15,
    featured: true
  },
  {
    id: "styl-w002",
    name: "STYLUS Women's Oversized Tee — Navy",
    category: "Women",
    price: 20000,
    description: "Cool, calm, collected. The STYLUS women's oversized tee in deep navy — premium cotton with an easy oversized fit and embroidered STYLUS branding. From morning to midnight, this one works.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Navy Blue"],
    image: "https://i.ibb.co/9Hpj7mv9/photo-2026-06-23-21-28-01.jpg",
    badge: null,
    stock: 12,
    featured: false
  },
  {
    id: "styl-w003",
    name: "STYLUS Women's Oversized Tee — Burgundy",
    category: "Women",
    price: 20000,
    description: "Rich, feminine, powerful. The STYLUS women's oversized tee in deep burgundy — heavyweight cotton with a relaxed fit and embroidered logo. A colour that commands attention without demanding it.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Burgundy"],
    image: "https://i.ibb.co/vCBj9Wg1/photo-2026-06-23-21-27-56.jpg",
    badge: null,
    stock: 11,
    featured: false
  },
  {
    id: "styl-u001",
    name: "STYLUS Power Suit Set — Burgundy",
    category: "Men",
    price: 180000,
    description: "The room changes when you walk in. The STYLUS Power Suit in deep burgundy — double-breasted blazer with wide-leg trousers, structured shoulders and premium wool-blend fabric. This is not just clothing. This is a statement of intent.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Burgundy"],
    image: "https://i.ibb.co/cKPxbr9S/photo.jpg",
    badge: "Exclusive",
    stock: 5,
    featured: true
  },

  // ─── CUSTOM DOZEN ORDER ──────────────────────────────
  {
    id: "styl-custom",
    name: "Custom Order — Your Design (12 Pieces Minimum)",
    category: "Custom",
    price: 180000,
    description: "Build your own STYLUS. Order a minimum of 12 pieces in any colour, design, or style you want — customised with your choice of logo, text, or artwork. Perfect for groups, teams, events, or your own brand. Price shown is starting price. Contact us for exact quote.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Any Color"],
    image: "https://i.ibb.co/qYmBNYqt/5783152913105489649.jpg",
    badge: "Custom",
    stock: 999,
    featured: false,
    isCustom: true
  }
];

module.exports = products;
