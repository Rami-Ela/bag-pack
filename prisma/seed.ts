import "dotenv/config";
import { PrismaClient, TripType } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// perDay: true  → quantity = baseQuantity × trip duration in days
// perDay: false → fixed quantity regardless of duration
const PRESETS: Array<{
  tripType: TripType;
  name: string;
  category: string;
  perDay: boolean;
  baseQuantity: number;
}> = [
  // ── BEACH ──────────────────────────────────────────────────────────────────
  {
    tripType: "BEACH",
    name: "T-Shirt",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Shorts",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Underwear",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Swimsuit",
    category: "Clothing",
    perDay: false,
    baseQuantity: 2,
  },
  {
    tripType: "BEACH",
    name: "Flip flops",
    category: "Footwear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Sunscreen",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Sunglasses",
    category: "Accessories",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Hat",
    category: "Accessories",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Beach towel",
    category: "Accessories",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Phone charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Toothbrush",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BEACH",
    name: "Passport",
    category: "Documents",
    perDay: false,
    baseQuantity: 1,
  },

  // ── CITY ───────────────────────────────────────────────────────────────────
  {
    tripType: "CITY",
    name: "T-Shirt",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Underwear",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Socks",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Jeans",
    category: "Clothing",
    perDay: false,
    baseQuantity: 2,
  },
  {
    tripType: "CITY",
    name: "Jacket",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Pyjama",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Clothing Bundle",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Toothbrush",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Nail clipper",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Splint",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Phone charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Camera",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Computer",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "CITY",
    name: "Switch",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },

  // ── BUSINESS ───────────────────────────────────────────────────────────────
  {
    tripType: "BUSINESS",
    name: "Dress shirt",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Underwear",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Socks",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Suit jacket",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Dress pants",
    category: "Clothing",
    perDay: false,
    baseQuantity: 2,
  },
  {
    tripType: "BUSINESS",
    name: "Tie",
    category: "Accessories",
    perDay: false,
    baseQuantity: 2,
  },
  {
    tripType: "BUSINESS",
    name: "Dress shoes",
    category: "Footwear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Laptop",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Laptop charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Phone charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Business cards",
    category: "Documents",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "BUSINESS",
    name: "Passport",
    category: "Documents",
    perDay: false,
    baseQuantity: 1,
  },

  // ── SKI ────────────────────────────────────────────────────────────────────
  {
    tripType: "SKI",
    name: "T-Shirt",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Ski socks",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Underwear",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Ski jacket",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Ski pants",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Thermal base layer",
    category: "Clothing",
    perDay: false,
    baseQuantity: 2,
  },
  {
    tripType: "SKI",
    name: "Ski gloves",
    category: "Accessories",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Ski goggles",
    category: "Accessories",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Sunscreen",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Lip balm",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "SKI",
    name: "Phone charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },

  // ── HIKING ─────────────────────────────────────────────────────────────────
  {
    tripType: "HIKING",
    name: "T-Shirt",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Hiking socks",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Underwear",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Hiking pants",
    category: "Clothing",
    perDay: false,
    baseQuantity: 2,
  },
  {
    tripType: "HIKING",
    name: "Rain jacket",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Hiking boots",
    category: "Footwear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Water bottle",
    category: "Gear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Backpack",
    category: "Gear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "First aid kit",
    category: "Gear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Headlamp",
    category: "Gear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Sunscreen",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "HIKING",
    name: "Phone charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },

  // ── OTHER ──────────────────────────────────────────────────────────────────
  {
    tripType: "OTHER",
    name: "T-Shirt",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Underwear",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Socks",
    category: "Clothing",
    perDay: true,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Phone charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Toothbrush",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Computer",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Laptop charger",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Camera",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Headphones",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Water bottle",
    category: "Gear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Jacket",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Sweater",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Pants",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Passport",
    category: "Documents",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Tickets",
    category: "Documents",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Deodorant",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Nail clipper",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Splint",
    category: "Toiletries",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Pyjama",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Clothing Bundle",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Towel",
    category: "Accessories",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Switch",
    category: "Electronics",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Hiking boots",
    category: "Footwear",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Book",
    category: "Accessories",
    perDay: false,
    baseQuantity: 1,
  },
  {
    tripType: "OTHER",
    name: "Athletic wear",
    category: "Clothing",
    perDay: false,
    baseQuantity: 1,
  },
];

async function main() {
  console.log("Seeding trip presets…");
  await prisma.tripPreset.deleteMany();
  await prisma.tripPreset.createMany({ data: PRESETS });
  console.log(`Seeded ${PRESETS.length} presets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
