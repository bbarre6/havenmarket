import "dotenv/config";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { CATEGORY_TREE } from "../src/lib/categories-data";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Demo12345!";

function img(seed: string, w = 900, h = 700) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

type ListingSeed = {
  title: string;
  brand: string;
  sub: string; // subcategory slug
  condition: "NEW" | "USED_LIKE_NEW" | "USED_GOOD" | "USED_FAIR" | "FOR_PARTS";
  type: "FIXED_PRICE" | "AUCTION";
  price: number;
  shippingCost: number;
  freeShipping?: boolean;
  blurb: string;
};

const LISTINGS: ListingSeed[] = [
  // Electronics
  { title: "Apple AirPods Pro (2nd Generation) - White", brand: "Apple", sub: "headphones", condition: "USED_LIKE_NEW", type: "FIXED_PRICE", price: 159.99, shippingCost: 4.99, blurb: "Active noise cancellation, MagSafe charging case included. Tested, fully functional." },
  { title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones", brand: "Sony", sub: "headphones", condition: "NEW", type: "FIXED_PRICE", price: 279.99, shippingCost: 0, freeShipping: true, blurb: "Brand new, sealed retail box. Industry-leading noise cancellation." },
  { title: "Bose QuietComfort 45 Headphones - Black", brand: "Bose", sub: "headphones", condition: "USED_GOOD", type: "AUCTION", price: 60, shippingCost: 6.5, blurb: "Comfortable over-ear headphones, light wear on headband, works perfectly." },
  { title: "Canon EOS R10 Mirrorless Camera Body", brand: "Canon", sub: "cameras", condition: "USED_GOOD", type: "AUCTION", price: 420, shippingCost: 14.99, blurb: "Low shutter count mirrorless body, includes battery and charger." },
  { title: "Nikon Z50 Mirrorless Camera Kit with 16-50mm Lens", brand: "Nikon", sub: "cameras", condition: "NEW", type: "FIXED_PRICE", price: 749, shippingCost: 0, freeShipping: true, blurb: "Factory sealed kit, perfect for travel and vlogging." },
  { title: "GoPro HERO11 Black Action Camera", brand: "GoPro", sub: "cameras", condition: "USED_LIKE_NEW", type: "FIXED_PRICE", price: 229, shippingCost: 7.99, blurb: "Used twice, includes original box and mounting accessories." },
  { title: "Apple MacBook Air M2 13\" 256GB Space Gray", brand: "Apple", sub: "laptops", condition: "USED_LIKE_NEW", type: "FIXED_PRICE", price: 899, shippingCost: 0, freeShipping: true, blurb: "Excellent battery health, AppleCare eligible, minor cosmetic wear." },
  { title: "Dell XPS 13 Plus Laptop - Intel i7, 16GB RAM", brand: "Dell", sub: "laptops", condition: "USED_GOOD", type: "AUCTION", price: 380, shippingCost: 12.99, blurb: "Fast ultrabook, 512GB SSD, great for work or school." },
  { title: "Lenovo ThinkPad X1 Carbon Gen 10", brand: "Lenovo", sub: "laptops", condition: "USED_GOOD", type: "FIXED_PRICE", price: 650, shippingCost: 9.99, blurb: "Business-grade ultrabook, 14\" display, backlit keyboard." },
  { title: "Apple iPhone 14 Pro 128GB Unlocked - Deep Purple", brand: "Apple", sub: "smartphones", condition: "USED_GOOD", type: "FIXED_PRICE", price: 649, shippingCost: 0, freeShipping: true, blurb: "Unlocked for all carriers, screen protector since day one, 91% battery health." },
  { title: "Samsung Galaxy S23 Ultra 256GB - Phantom Black", brand: "Samsung", sub: "smartphones", condition: "USED_LIKE_NEW", type: "AUCTION", price: 520, shippingCost: 0, freeShipping: true, blurb: "Barely used flagship with S Pen, all accessories included." },
  { title: "Google Pixel 8 Pro 128GB - Obsidian", brand: "Google", sub: "smartphones", condition: "NEW", type: "FIXED_PRICE", price: 699, shippingCost: 0, freeShipping: true, blurb: "Sealed in box, unopened, factory unlocked." },
  // Fashion
  { title: "Nike Air Jordan 1 Retro High OG 'University Blue'", brand: "Nike", sub: "sneakers", condition: "USED_LIKE_NEW", type: "AUCTION", price: 140, shippingCost: 10, blurb: "Worn twice, no box, authentic with receipt available on request." },
  { title: "Adidas Yeezy Boost 350 V2 'Zebra'", brand: "Adidas", sub: "sneakers", condition: "NEW", type: "FIXED_PRICE", price: 219.99, shippingCost: 0, freeShipping: true, blurb: "Deadstock, never worn, includes original box." },
  { title: "New Balance 550 Sneakers - White/Green", brand: "New Balance", sub: "sneakers", condition: "NEW", type: "FIXED_PRICE", price: 110, shippingCost: 6, blurb: "New in box, true to size, classic retro colorway." },
  { title: "Seiko 5 Automatic Men's Watch", brand: "Seiko", sub: "watches", condition: "USED_GOOD", type: "FIXED_PRICE", price: 95, shippingCost: 5.5, blurb: "Reliable automatic movement, stainless steel case, light scratches on bracelet." },
  { title: "Casio G-Shock GA-2100 'CasiOak'", brand: "Casio", sub: "watches", condition: "USED_LIKE_NEW", type: "AUCTION", price: 45, shippingCost: 5, blurb: "Barely worn, shock resistant, 200m water resistance." },
  { title: "Fossil Gen 6 Smartwatch - 44mm", brand: "Fossil", sub: "watches", condition: "USED_GOOD", type: "FIXED_PRICE", price: 89, shippingCost: 6, blurb: "Works great with Android and iOS, comes with charger." },
  { title: "Coach Leather Shoulder Bag - Saddle Brown", brand: "Coach", sub: "handbags", condition: "USED_GOOD", type: "FIXED_PRICE", price: 89, shippingCost: 8, blurb: "Genuine leather, minor corner wear, roomy interior pockets." },
  { title: "Michael Kors Jet Set Crossbody Bag", brand: "Michael Kors", sub: "handbags", condition: "NEW", type: "FIXED_PRICE", price: 129, shippingCost: 0, freeShipping: true, blurb: "New with tags, dust bag included." },
  { title: "Levi's Trucker Denim Jacket - Medium Wash", brand: "Levi's", sub: "outerwear", condition: "USED_GOOD", type: "FIXED_PRICE", price: 45, shippingCost: 7, blurb: "Classic fit, size Large, no stains or tears." },
  { title: "Patagonia Down Sweater Jacket - Navy", brand: "Patagonia", sub: "outerwear", condition: "USED_LIKE_NEW", type: "AUCTION", price: 60, shippingCost: 8.5, blurb: "Packable, warm, worn only a handful of times." },
  // Home & Garden
  { title: "Mid-Century Modern Accent Chair - Walnut Legs", brand: "West Elm", sub: "furniture", condition: "USED_GOOD", type: "FIXED_PRICE", price: 175, shippingCost: 45, blurb: "Sturdy frame, upholstery shows light wear, local pickup preferred." },
  { title: "Solid Oak Dining Table Set (Table + 4 Chairs)", brand: "Pottery Barn", sub: "furniture", condition: "USED_FAIR", type: "AUCTION", price: 200, shippingCost: 0, freeShipping: true, blurb: "Needs minor refinishing, structurally solid, great project piece." },
  { title: "IKEA MALM 6-Drawer Dresser - White", brand: "IKEA", sub: "furniture", condition: "USED_GOOD", type: "FIXED_PRICE", price: 95, shippingCost: 35, blurb: "Disassembled for easy transport, all hardware included." },
  { title: "KitchenAid Artisan Stand Mixer 5 Qt - Empire Red", brand: "KitchenAid", sub: "kitchen", condition: "USED_LIKE_NEW", type: "AUCTION", price: 130, shippingCost: 18, blurb: "Used for light baking only, includes flat beater and whisk." },
  { title: "Instant Pot Duo 8-Quart 7-in-1 Pressure Cooker", brand: "Instant Pot", sub: "kitchen", condition: "NEW", type: "FIXED_PRICE", price: 69.99, shippingCost: 9.99, blurb: "Sealed box, never used, gift duplicate." },
  { title: "Dyson V8 Cordless Vacuum", brand: "Dyson", sub: "tools", condition: "USED_GOOD", type: "FIXED_PRICE", price: 189, shippingCost: 12, blurb: "Strong suction, new filter installed, includes two attachments." },
  { title: "DeWalt 20V MAX Cordless Drill Kit", brand: "DeWalt", sub: "tools", condition: "USED_GOOD", type: "FIXED_PRICE", price: 79, shippingCost: 10, blurb: "Includes battery, charger, and carrying case." },
  { title: "Ceramic Plant Pot Set (3-Piece) - Terracotta", brand: "Threshold", sub: "decor", condition: "NEW", type: "FIXED_PRICE", price: 34.99, shippingCost: 6.99, blurb: "Drainage holes included, perfect for succulents and herbs." },
  { title: "Vintage Brass Table Lamp with Linen Shade", brand: "Unbranded", sub: "decor", condition: "USED_GOOD", type: "AUCTION", price: 25, shippingCost: 14, blurb: "Working condition, beautiful patina, new shade." },
  // Automotive
  { title: "OEM Brake Pad Set - Honda Civic 2016-2021", brand: "Honda", sub: "parts-accessories", condition: "NEW", type: "FIXED_PRICE", price: 54.99, shippingCost: 8.99, blurb: "Genuine OEM fit, front axle set, fits multiple trims." },
  { title: "Bosch OEM Car Battery 12V 650CCA", brand: "Bosch", sub: "parts-accessories", condition: "NEW", type: "FIXED_PRICE", price: 129, shippingCost: 0, freeShipping: true, blurb: "Maintenance-free, 3-year warranty, ships fully charged." },
  { title: "Craftsman Mechanics Tool Set - 200 Piece", brand: "Craftsman", sub: "tools-equipment", condition: "USED_LIKE_NEW", type: "FIXED_PRICE", price: 145, shippingCost: 15, blurb: "Complete set in hard case, barely used, all sockets accounted for." },
  { title: "Portable Car Jump Starter & Air Compressor", brand: "NOCO", sub: "tools-equipment", condition: "NEW", type: "FIXED_PRICE", price: 59.99, shippingCost: 7.5, blurb: "12000mAh capacity, built-in LED flashlight and tire inflator." },
  { title: "18\" Alloy Wheel Set of 4 - 5x114.3", brand: "Enkei", sub: "wheels-tires", condition: "USED_GOOD", type: "AUCTION", price: 220, shippingCost: 0, freeShipping: true, blurb: "Fits most Honda/Toyota/Nissan sedans, minor curb rash." },
  { title: "Michelin All-Season Tires 225/45R17 (Set of 4)", brand: "Michelin", sub: "wheels-tires", condition: "USED_GOOD", type: "FIXED_PRICE", price: 320, shippingCost: 0, freeShipping: true, blurb: "70% tread remaining, no patches or plugs." },
  // Collectibles
  { title: "1998 Pokemon Base Set Booster Pack (Sealed)", brand: "Pokemon", sub: "trading-cards", condition: "USED_GOOD", type: "AUCTION", price: 75, shippingCost: 6.5, blurb: "Unweighed, appears sealed, sold as collectible only." },
  { title: "2003 Topps Chrome LeBron James Rookie Card", brand: "Topps", sub: "trading-cards", condition: "USED_GOOD", type: "AUCTION", price: 300, shippingCost: 9.99, blurb: "Centered, light corner wear, ungraded raw card." },
  { title: "Amazing Spider-Man #300 Comic Book (1988)", brand: "Marvel", sub: "comics", condition: "USED_FAIR", type: "AUCTION", price: 150, shippingCost: 8, blurb: "First full appearance of Venom, reading copy, some spine wear." },
  { title: "Vintage Star Wars Action Figure Lot (1980s, 6 Figures)", brand: "Kenner", sub: "vintage-toys", condition: "USED_FAIR", type: "FIXED_PRICE", price: 220, shippingCost: 12, blurb: "Original figures from the vintage era, some paint loss, no boxes." },
  { title: "1964 Kennedy Half Dollar - 90% Silver", brand: "US Mint", sub: "coins-currency", condition: "USED_GOOD", type: "FIXED_PRICE", price: 18.5, shippingCost: 3.99, blurb: "Circulated condition, ships in protective flip." },
  { title: "Morgan Silver Dollar 1921 - Philadelphia Mint", brand: "US Mint", sub: "coins-currency", condition: "USED_GOOD", type: "FIXED_PRICE", price: 42, shippingCost: 3.99, blurb: "Classic silver dollar, good luster, ships insured." },
  // Sports
  { title: "Trek Marlin 7 Mountain Bike - Size Medium", brand: "Trek", sub: "cycling", condition: "USED_GOOD", type: "FIXED_PRICE", price: 599, shippingCost: 0, freeShipping: true, blurb: "Hydraulic disc brakes, 29in wheels, recently tuned." },
  { title: "Peloton Clip-In Bike Pedals (Look Delta)", brand: "Peloton", sub: "cycling", condition: "NEW", type: "FIXED_PRICE", price: 89, shippingCost: 5.99, blurb: "Sealed in original packaging, fits all Peloton bikes." },
  { title: "Bowflex SelectTech 552 Adjustable Dumbbells (Pair)", brand: "Bowflex", sub: "fitness-equipment", condition: "USED_LIKE_NEW", type: "AUCTION", price: 180, shippingCost: 0, freeShipping: true, blurb: "Adjusts from 5 to 52.5 lbs each, like-new condition." },
  { title: "Wilson Pro Staff Tennis Racket - Grip 3", brand: "Wilson", sub: "team-sports", condition: "USED_GOOD", type: "FIXED_PRICE", price: 65, shippingCost: 9.99, blurb: "Strung recently, light frame wear, great control racket." },
  { title: "REI Co-op Half Dome Tent - 2 Person", brand: "REI Co-op", sub: "outdoor-gear", condition: "USED_GOOD", type: "FIXED_PRICE", price: 110, shippingCost: 12, blurb: "Set up twice, no leaks, includes footprint and stakes." },
  { title: "Titleist Pro V1 Golf Balls (3 Dozen, New)", brand: "Titleist", sub: "outdoor-gear", condition: "NEW", type: "FIXED_PRICE", price: 109.99, shippingCost: 8.5, blurb: "Factory sealed, current year model, great gift." },
];

async function main() {
  console.log("Seeding database...");

  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.report.deleteMany();
  await prisma.question.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.address.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // --- Categories ---
  const subcategoryBySlug = new Map<string, string>(); // sub slug -> categoryId

  for (const top of CATEGORY_TREE) {
    const parent = await prisma.category.create({
      data: { name: top.name, slug: top.slug, icon: top.icon },
    });
    for (const child of top.children) {
      const created = await prisma.category.create({
        data: { name: child.name, slug: child.slug, icon: top.icon, parentId: parent.id },
      });
      subcategoryBySlug.set(child.slug, created.id);
    }
  }

  // --- Users ---
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const demoUser = await prisma.user.create({
    data: {
      name: "Jordan Avery",
      email: "demo@marketplace.test",
      passwordHash,
      isSeller: true,
      storeName: "Jordan's Attic Finds",
      bio: "Demo account — pre-loaded with orders, a watchlist, and active listings so you can explore both buying and selling.",
    },
  });

  await prisma.address.create({
    data: {
      userId: demoUser.id,
      fullName: "Jordan Avery",
      line1: "482 Maple Street",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "United States",
      phone: "512-555-0148",
      isDefault: true,
    },
  });

  const sellerNames = [
    { name: "Priya Natarajan", store: "Priya's Pre-Loved Tech" },
    { name: "Marcus Webb", store: "Webb & Sons Vintage" },
    { name: "Elena Castillo", store: "Castillo Curated Goods" },
    { name: "Tom Okafor", store: "Okafor Outdoors" },
    { name: "Sasha Lindqvist", store: "Lindqvist Home Market" },
  ];

  const sellers = [];
  for (const s of sellerNames) {
    const seller = await prisma.user.create({
      data: {
        name: s.name,
        email: `${slugify(s.name)}@marketplace.test`,
        passwordHash,
        isSeller: true,
        storeName: s.store,
        bio: faker.lorem.sentence(),
        createdAt: faker.date.past({ years: 4 }),
      },
    });
    sellers.push(seller);
  }

  const bidderPool = [];
  for (let i = 0; i < 8; i++) {
    const name = faker.person.fullName();
    const bidder = await prisma.user.create({
      data: {
        name,
        email: `${slugify(name)}-${i}@marketplace.test`,
        passwordHash,
        createdAt: faker.date.past({ years: 2 }),
      },
    });
    bidderPool.push(bidder);
  }

  const allSellersForListings = [demoUser, ...sellers];

  // --- Listings ---
  const now = Date.now();
  const createdListings = [];

  for (let i = 0; i < LISTINGS.length; i++) {
    const item = LISTINGS[i];
    const categoryId = subcategoryBySlug.get(item.sub);
    if (!categoryId) continue;
    const seller = allSellersForListings[i % allSellersForListings.length];
    const slug = `${slugify(item.title)}-${i}`;

    const listing = await prisma.listing.create({
      data: {
        sellerId: seller.id,
        categoryId,
        title: item.title,
        slug,
        description: `${item.blurb}\n\nCondition: ${item.condition.replace(/_/g, " ").toLowerCase()}. Ships from a smoke-free home. Message the seller with any questions before buying.`,
        condition: item.condition,
        listingType: item.type,
        price: item.type === "AUCTION" ? item.price : item.price,
        quantity: item.type === "AUCTION" ? 1 : faker.number.int({ min: 1, max: 6 }),
        quantityAvailable: item.type === "AUCTION" ? 1 : faker.number.int({ min: 1, max: 6 }),
        brand: item.brand,
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
        shippingCost: item.shippingCost,
        freeShipping: Boolean(item.freeShipping),
        shippingEstimateDays: faker.number.int({ min: 2, max: 9 }),
        status: "ACTIVE",
        views: faker.number.int({ min: 12, max: 3400 }),
        createdAt: faker.date.recent({ days: 45 }),
        images: {
          create: [0, 1, 2].map((pos) => ({ url: img(`${slug}-${pos}`), position: pos })),
        },
      },
    });
    createdListings.push({ listing, item });
  }

  // --- Auctions ---
  const auctionListings = createdListings.filter((c) => c.item.type === "AUCTION");
  for (let i = 0; i < auctionListings.length; i++) {
    const { listing, item } = auctionListings[i];
    const increment = Math.max(1, Math.round(item.price * 0.05 * 100) / 100);

    let startAt: Date;
    let endAt: Date;
    let status: "UPCOMING" | "LIVE" | "ENDED" = "LIVE";

    if (i % 7 === 0) {
      // upcoming
      startAt = new Date(now + 1000 * 60 * 60 * (6 + i));
      endAt = new Date(now + 1000 * 60 * 60 * (6 + i + 48));
      status = "UPCOMING";
    } else if (i % 5 === 0) {
      // already ended
      startAt = new Date(now - 1000 * 60 * 60 * 24 * 6);
      endAt = new Date(now - 1000 * 60 * 60 * 3);
      status = "ENDED";
    } else if (i % 3 === 0) {
      // ending soon (great for countdown demo)
      startAt = new Date(now - 1000 * 60 * 60 * 20);
      endAt = new Date(now + 1000 * 60 * 40 + i * 60000);
      status = "LIVE";
    } else {
      startAt = new Date(now - 1000 * 60 * 60 * 12);
      endAt = new Date(now + 1000 * 60 * 60 * 24 * (1 + (i % 4)));
      status = "LIVE";
    }

    const auction = await prisma.auction.create({
      data: {
        listingId: listing.id,
        startingBid: item.price,
        currentBid: item.price,
        bidIncrement: increment,
        buyNowPrice: status === "UPCOMING" ? undefined : Math.round(item.price * 2.4 * 100) / 100,
        startAt,
        endAt,
        status: status === "ENDED" ? "ENDED" : status,
      },
    });

    if (status !== "UPCOMING") {
      const numBids = faker.number.int({ min: 3, max: 11 });
      let currentBid = item.price;
      let lastBidder = null as (typeof bidderPool)[number] | null;
      const bidTimes: Date[] = [];
      for (let b = 0; b < numBids; b++) {
        currentBid = Math.round((currentBid + increment * faker.number.int({ min: 1, max: 3 })) * 100) / 100;
        const bidder = faker.helpers.arrayElement(bidderPool);
        lastBidder = bidder;
        const createdAt = new Date(startAt.getTime() + ((endAt.getTime() - startAt.getTime()) * (b + 1)) / (numBids + 1));
        bidTimes.push(createdAt);
        await prisma.bid.create({
          data: { auctionId: auction.id, bidderId: bidder.id, amount: currentBid, createdAt },
        });
      }
      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          currentBid,
          winnerId: status === "ENDED" ? lastBidder?.id : undefined,
          finalizedAt: status === "ENDED" ? endAt : undefined,
        },
      });
      if (status === "ENDED") {
        await prisma.listing.update({ where: { id: listing.id }, data: { status: "SOLD" } });
      }
    }
  }

  // --- Watchlist & cart for demo user ---
  const watchable = createdListings.filter((c) => c.listing.sellerId !== demoUser.id).slice(0, 6);
  for (const w of watchable.slice(0, 4)) {
    await prisma.watchlist.create({ data: { userId: demoUser.id, listingId: w.listing.id } });
  }
  const cartable = createdListings
    .filter((c) => c.listing.sellerId !== demoUser.id && c.item.type === "FIXED_PRICE")
    .slice(0, 2);
  for (const w of cartable) {
    await prisma.cartItem.create({ data: { userId: demoUser.id, listingId: w.listing.id, quantity: 1 } });
  }

  // --- A completed order + review history for the demo user ---
  const purchasable = createdListings.find((c) => c.item.type === "FIXED_PRICE" && c.listing.sellerId !== demoUser.id);
  if (purchasable) {
    const order = await prisma.order.create({
      data: {
        buyerId: demoUser.id,
        addressId: (await prisma.address.findFirstOrThrow({ where: { userId: demoUser.id } })).id,
        status: "DELIVERED",
        subtotal: purchasable.item.price,
        shippingTotal: purchasable.item.shippingCost,
        taxTotal: Math.round(purchasable.item.price * 0.0825 * 100) / 100,
        total: Math.round((purchasable.item.price + purchasable.item.shippingCost + purchasable.item.price * 0.0825) * 100) / 100,
        createdAt: faker.date.past({ years: 1 }),
        items: {
          create: [
            {
              listingId: purchasable.listing.id,
              sellerId: purchasable.listing.sellerId,
              titleSnapshot: purchasable.item.title,
              price: purchasable.item.price,
              quantity: 1,
              shippingCost: purchasable.item.shippingCost,
            },
          ],
        },
        payment: {
          create: {
            provider: "SIMULATED",
            amountCents: Math.round((purchasable.item.price + purchasable.item.shippingCost) * 100),
            status: "SIMULATED_PAID",
          },
        },
      },
    });

    await prisma.review.create({
      data: {
        listingId: purchasable.listing.id,
        orderId: order.id,
        reviewerId: demoUser.id,
        sellerId: purchasable.listing.sellerId,
        rating: 5,
        title: "Exactly as described!",
        body: "Fast shipping and the item was in great shape. Would buy from this seller again.",
      },
    });
  }

  // --- A handful of extra reviews spread across sellers for ratings ---
  for (const { listing } of createdListings.slice(0, 15)) {
    if (faker.datatype.boolean({ probability: 0.4 })) {
      const reviewer = faker.helpers.arrayElement(bidderPool);
      const order = await prisma.order.create({
        data: {
          buyerId: reviewer.id,
          addressId: (
            await prisma.address.upsert({
              where: { id: `addr-${reviewer.id}` },
              update: {},
              create: {
                id: `addr-${reviewer.id}`,
                userId: reviewer.id,
                fullName: reviewer.name,
                line1: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state({ abbreviated: true }),
                postalCode: faker.location.zipCode(),
                isDefault: true,
              },
            })
          ).id,
          status: "DELIVERED",
          subtotal: listing.price,
          shippingTotal: listing.shippingCost,
          taxTotal: Math.round(listing.price * 0.0825 * 100) / 100,
          total: Math.round((listing.price + listing.shippingCost + listing.price * 0.0825) * 100) / 100,
          createdAt: faker.date.past({ years: 1 }),
          items: {
            create: [
              {
                listingId: listing.id,
                sellerId: listing.sellerId,
                titleSnapshot: listing.title,
                price: listing.price,
                quantity: 1,
                shippingCost: listing.shippingCost,
              },
            ],
          },
          payment: { create: { provider: "SIMULATED", amountCents: Math.round(listing.price * 100), status: "SIMULATED_PAID" } },
        },
      });
      await prisma.review.create({
        data: {
          listingId: listing.id,
          orderId: order.id,
          reviewerId: reviewer.id,
          sellerId: listing.sellerId,
          rating: faker.number.int({ min: 4, max: 5 }),
          title: faker.helpers.arrayElement(["Great purchase", "As described", "Would buy again", "Smooth transaction"]),
          body: faker.lorem.sentences(2),
        },
      });
    }
  }

  // --- Questions ---
  for (const { listing } of createdListings.slice(0, 10)) {
    const asker = faker.helpers.arrayElement(bidderPool);
    const question = await prisma.question.create({
      data: {
        listingId: listing.id,
        askerId: asker.id,
        question: faker.helpers.arrayElement([
          "Does this ship internationally?",
          "Is the price negotiable?",
          "Can you provide more photos of any damage?",
          "What's the exact condition of the item?",
          "Will this be shipped with tracking?",
        ]),
      },
    });
    if (faker.datatype.boolean({ probability: 0.6 })) {
      await prisma.question.update({
        where: { id: question.id },
        data: {
          answer: faker.helpers.arrayElement([
            "Yes, happy to answer more questions before you buy!",
            "I can do local pickup too if that's easier.",
            "All items ship within 1-2 business days with tracking.",
          ]),
          answeredAt: new Date(),
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Demo login: demo@marketplace.test / ${DEMO_PASSWORD}`);
  console.log(`Created ${createdListings.length} listings, ${sellers.length + 1} sellers, ${bidderPool.length} bidders.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
