// ─────────────────────────────────────────────────────────────────────────────
// HuntMyDeal Product Categories
// All deals are organized by product type, not by store.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  { id: 'electronics',  label: 'Electronics',          emoji: '⚡',  description: 'TVs, headphones, phones & more' },
  { id: 'home-kitchen', label: 'Home & Kitchen',        emoji: '🏠',  description: 'Appliances, cookware & décor' },
  { id: 'fashion',      label: 'Fashion & Apparel',     emoji: '👗',  description: 'Clothing, suits & accessories' },
  { id: 'shoes',        label: 'Shoes & Sneakers',      emoji: '👟',  description: 'Nike, Adidas & top brands' },
  { id: 'sports',       label: 'Sports & Outdoors',     emoji: '🏃',  description: 'Fitness, camping & adventure' },
  { id: 'toys',         label: 'Toys & Games',          emoji: '🧸',  description: 'Kids, games & entertainment' },
  { id: 'beauty',       label: 'Beauty & Personal Care',emoji: '💄',  description: 'Skincare, makeup & grooming' },
  { id: 'food',         label: 'Food & Dining',         emoji: '🍽️', description: 'Restaurants & food subscriptions' },
  { id: 'travel',       label: 'Travel & Hotels',       emoji: '✈️',  description: 'Flights, hotels & experiences' },
  { id: 'auto',         label: 'Auto & Tools',          emoji: '🔧',  description: 'Car accessories & hardware' },
  { id: 'health',       label: 'Health & Wellness',    emoji: '💊',  description: 'Vitamins, fitness & care' },
  { id: 'pets',         label: 'Pet Supplies',         emoji: '🐶',  description: 'Food, toys & accessories' },
  { id: 'books',        label: 'Books & Audible',      emoji: '📚',  description: 'Bestsellers & audiobooks' },
  { id: 'software',     label: 'Software & Apps',      emoji: '💻',  description: 'Subscriptions & digital goods' },
  { id: 'gaming',       label: 'Video Games',          emoji: '🎮',  description: 'Consoles, PC & accessories' },
  { id: 'grocery',      label: 'Groceries & Daily',    emoji: '🛒',  description: 'Pantry staples & fresh food' },
  { id: 'office',       label: 'Office Supplies',      emoji: '📎',  description: 'Desks, chairs & stationery' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const getCategoryLabel = (id: string): string =>
  CATEGORY_MAP[id]?.label ?? id;

export const getCategoryEmoji = (id: string): string =>
  CATEGORY_MAP[id]?.emoji ?? '🏷️';

// Homepage hero copy
export const HERO_COPY = {
  tag:      'Top Deals - Updated Daily',
  headline: 'Shop Smarter.',
  accent:   'Save More.',
  sub:      'The best deals across electronics, fashion, home, shoes, and more - from 200+ top brands.',
  cta:      'Browse Deals',
};
