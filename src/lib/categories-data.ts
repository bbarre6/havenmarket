export type CategorySeed = {
  name: string;
  slug: string;
  icon: string;
  children: { name: string; slug: string }[];
};

export const CATEGORY_TREE: CategorySeed[] = [
  {
    name: "Electronics",
    slug: "electronics",
    icon: "Cpu",
    children: [
      { name: "Headphones", slug: "headphones" },
      { name: "Cameras", slug: "cameras" },
      { name: "Laptops", slug: "laptops" },
      { name: "Smartphones", slug: "smartphones" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "Shirt",
    children: [
      { name: "Sneakers", slug: "sneakers" },
      { name: "Watches", slug: "watches" },
      { name: "Handbags", slug: "handbags" },
      { name: "Outerwear", slug: "outerwear" },
    ],
  },
  {
    name: "Home & Garden",
    slug: "home-garden",
    icon: "Sofa",
    children: [
      { name: "Furniture", slug: "furniture" },
      { name: "Kitchen", slug: "kitchen" },
      { name: "Decor", slug: "decor" },
      { name: "Tools", slug: "tools" },
    ],
  },
  {
    name: "Automotive",
    slug: "automotive",
    icon: "Car",
    children: [
      { name: "Parts & Accessories", slug: "parts-accessories" },
      { name: "Tools & Equipment", slug: "tools-equipment" },
      { name: "Wheels & Tires", slug: "wheels-tires" },
    ],
  },
  {
    name: "Collectibles",
    slug: "collectibles",
    icon: "Gem",
    children: [
      { name: "Trading Cards", slug: "trading-cards" },
      { name: "Coins & Currency", slug: "coins-currency" },
      { name: "Comics", slug: "comics" },
      { name: "Vintage Toys", slug: "vintage-toys" },
    ],
  },
  {
    name: "Sports",
    slug: "sports",
    icon: "Dumbbell",
    children: [
      { name: "Cycling", slug: "cycling" },
      { name: "Fitness Equipment", slug: "fitness-equipment" },
      { name: "Outdoor Gear", slug: "outdoor-gear" },
      { name: "Team Sports", slug: "team-sports" },
    ],
  },
];
