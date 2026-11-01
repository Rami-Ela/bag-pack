// Templates given to every new account (and backfilled for existing ones by the
// add_trip_templates migration). Categories are ItemCategory names, translated in the UI.
export type DefaultTemplate = {
  name: string;
  emoji: string;
  items: {
    name: string;
    category: string;
    quantity: number;
    perDay: boolean;
  }[];
};

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    name: "Plage",
    emoji: "🏖️",
    items: [
      { name: "T-shirt", category: "Clothing", quantity: 1, perDay: true },
      { name: "Short", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Sous-vêtements",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      {
        name: "Maillot de bain",
        category: "Clothing",
        quantity: 2,
        perDay: false,
      },
      { name: "Tongs", category: "Footwear", quantity: 1, perDay: false },
      {
        name: "Crème solaire",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Lunettes de soleil",
        category: "Accessories",
        quantity: 1,
        perDay: false,
      },
      { name: "Chapeau", category: "Accessories", quantity: 1, perDay: false },
      {
        name: "Serviette de plage",
        category: "Accessories",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Chargeur téléphone",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Brosse à dents",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      { name: "Passeport", category: "Documents", quantity: 1, perDay: false },
    ],
  },
  {
    name: "Ville",
    emoji: "🏙️",
    items: [
      { name: "T-shirt", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Sous-vêtements",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      { name: "Chaussettes", category: "Clothing", quantity: 1, perDay: true },
      { name: "Jean", category: "Clothing", quantity: 2, perDay: false },
      { name: "Veste", category: "Clothing", quantity: 1, perDay: false },
      { name: "Pyjama", category: "Clothing", quantity: 1, perDay: false },
      {
        name: "Baluchon vêtement sale",
        category: "Clothing",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Brosse à dents",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Coupe-ongles",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      { name: "Goutière", category: "Toiletries", quantity: 1, perDay: false },
      {
        name: "Chargeur téléphone",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Appareil photo",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Ordinateur",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      { name: "Switch", category: "Electronics", quantity: 1, perDay: false },
    ],
  },
  {
    name: "Affaires",
    emoji: "💼",
    items: [
      { name: "Chemise", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Sous-vêtements",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      { name: "Chaussettes", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Veste de costume",
        category: "Clothing",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Pantalon de costume",
        category: "Clothing",
        quantity: 2,
        perDay: false,
      },
      { name: "Cravate", category: "Accessories", quantity: 2, perDay: false },
      {
        name: "Chaussures de ville",
        category: "Footwear",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Ordinateur portable",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Chargeur PC",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Chargeur téléphone",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Cartes de visite",
        category: "Documents",
        quantity: 1,
        perDay: false,
      },
      { name: "Passeport", category: "Documents", quantity: 1, perDay: false },
    ],
  },
  {
    name: "Ski",
    emoji: "🎿",
    items: [
      { name: "T-shirt", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Chaussettes de ski",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      {
        name: "Sous-vêtements",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      {
        name: "Veste de ski",
        category: "Clothing",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Pantalon de ski",
        category: "Clothing",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Sous-couche thermique",
        category: "Clothing",
        quantity: 2,
        perDay: false,
      },
      {
        name: "Gants de ski",
        category: "Accessories",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Lunettes de ski",
        category: "Accessories",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Crème solaire",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Baume à lèvres",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Chargeur téléphone",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
    ],
  },
  {
    name: "Randonnée",
    emoji: "🥾",
    items: [
      { name: "T-shirt", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Chaussettes de randonnée",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      {
        name: "Sous-vêtements",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      {
        name: "Pantalon de randonnée",
        category: "Clothing",
        quantity: 2,
        perDay: false,
      },
      {
        name: "Veste de pluie",
        category: "Clothing",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Chaussures de randonnée",
        category: "Footwear",
        quantity: 1,
        perDay: false,
      },
      { name: "Gourde", category: "Gear", quantity: 1, perDay: false },
      { name: "Sac à dos", category: "Gear", quantity: 1, perDay: false },
      {
        name: "Trousse de premiers secours",
        category: "Gear",
        quantity: 1,
        perDay: false,
      },
      { name: "Lampe frontale", category: "Gear", quantity: 1, perDay: false },
      {
        name: "Crème solaire",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Chargeur téléphone",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
    ],
  },
  {
    name: "Autre",
    emoji: "📦",
    items: [
      { name: "T-shirt", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Sous-vêtements",
        category: "Clothing",
        quantity: 1,
        perDay: true,
      },
      { name: "Chaussettes", category: "Clothing", quantity: 1, perDay: true },
      {
        name: "Chargeur téléphone",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Brosse à dents",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Ordinateur",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Chargeur PC",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Appareil photo",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Écouteurs",
        category: "Electronics",
        quantity: 1,
        perDay: false,
      },
      { name: "Gourde", category: "Gear", quantity: 1, perDay: false },
      { name: "Veste", category: "Clothing", quantity: 1, perDay: false },
      { name: "Pull", category: "Clothing", quantity: 1, perDay: false },
      { name: "Pantalon", category: "Clothing", quantity: 1, perDay: false },
      { name: "Passeport", category: "Documents", quantity: 1, perDay: false },
      { name: "Billets", category: "Documents", quantity: 1, perDay: false },
      { name: "Déodorant", category: "Toiletries", quantity: 1, perDay: false },
      {
        name: "Coupe-ongles",
        category: "Toiletries",
        quantity: 1,
        perDay: false,
      },
      { name: "Goutière", category: "Toiletries", quantity: 1, perDay: false },
      { name: "Pyjama", category: "Clothing", quantity: 1, perDay: false },
      {
        name: "Baluchon vêtement sale",
        category: "Clothing",
        quantity: 1,
        perDay: false,
      },
      {
        name: "Serviette",
        category: "Accessories",
        quantity: 1,
        perDay: false,
      },
      { name: "Switch", category: "Electronics", quantity: 1, perDay: false },
      {
        name: "Chaussures de randonnée",
        category: "Footwear",
        quantity: 1,
        perDay: false,
      },
      { name: "Livre", category: "Accessories", quantity: 1, perDay: false },
      {
        name: "Vêtements de sport",
        category: "Clothing",
        quantity: 1,
        perDay: false,
      },
    ],
  },
];
