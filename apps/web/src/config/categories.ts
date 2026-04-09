// ─────────────────────────────────────────────────────────────────────────────
// DealNexus Product Categories
// All deals are organized by product type, not by store.
// ─────────────────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  label: string;
  emoji: string;
  description: string;
  phase: 1 | 2;  // 2 = coming soon (local/service deals)
};

export const CATEGORIES: Category[] = [
  { id: 'electronics',  label: 'Electronics',          emoji: '⚡',  description: 'TVs, headphones, phones & more',    phase: 1 },
  { id: 'home-kitchen', label: 'Home & Kitchen',        emoji: '🏠',  description: 'Appliances, cookware & décor',      phase: 1 },
  { id: 'fashion',      label: 'Fashion & Apparel',     emoji: '👗',  description: 'Clothing, suits & accessories',     phase: 1 },
  { id: 'shoes',        label: 'Shoes & Sneakers',      emoji: '👟',  description: 'Nike, Adidas & top brands',         phase: 1 },
  { id: 'sports',       label: 'Sports & Outdoors',     emoji: '🏃',  description: 'Fitness, camping & adventure',      phase: 1 },
  { id: 'toys',         label: 'Toys & Games',          emoji: '🧸',  description: 'Kids, games & entertainment',       phase: 1 },
  { id: 'beauty',       label: 'Beauty & Personal Care',emoji: '💄',  description: 'Skincare, makeup & grooming',       phase: 2 },
  { id: 'food',         label: 'Food & Dining',         emoji: '🍽️', description: 'Restaurants & food subscriptions', phase: 2 },
  { id: 'travel',       label: 'Travel & Hotels',       emoji: '✈️',  description: 'Flights, hotels & experiences',    phase: 2 },
  { id: 'auto',         label: 'Auto & Tools',          emoji: '🔧',  description: 'Car accessories & hardware',        phase: 2 },
];

export const ACTIVE_CATEGORIES   = CATEGORIES.filter(c => c.phase === 1);
export const UPCOMING_CATEGORIES = CATEGORIES.filter(c => c.phase === 2);

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export const getCategoryLabel = (id: string): string =>
  CATEGORY_MAP[id]?.label ?? id;

export const getCategoryEmoji = (id: string): string =>
  CATEGORY_MAP[id]?.emoji ?? '🏷️';

// Homepage hero copy
export const HERO_COPY = {
  tag:      'Top Deals — Updated Daily',
  headline: 'Shop Smarter.',
  accent:   'Save More.',
  sub:      'The best deals across electronics, fashion, home, shoes, and more — from 200+ top brands.',
  cta:      'Browse Deals',
};
