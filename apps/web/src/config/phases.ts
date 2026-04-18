// ─────────────────────────────────────────────────────────────────────────────
// HuntMyDeal Phase Configuration
// ─────────────────────────────────────────────────────────────────────────────
// Change `phase` to 2 when you're ready to unlock local deals (beauty, food, etc.)
// Everything else adjusts automatically.
// ─────────────────────────────────────────────────────────────────────────────

export const PHASE = 1; // 1 = Affiliate/Product Deals  |  2 = + Local Deals

export const PHASE_CONFIG = {
  phase: PHASE,

  // Categories visible in Phase 1 nav + carousels
  phase1Categories: [
    { id: 'electronics', label: '⚡ Electronics', emoji: '⚡' },
    { id: 'amazon',      label: '📦 Amazon Picks', emoji: '📦' },
    { id: 'walmart',     label: '🏬 Walmart Deals', emoji: '🏬' },
    { id: 'fashion',     label: '👗 Fashion', emoji: '👗' },
    { id: 'shoes',       label: '👟 Shoes & Sneakers', emoji: '👟' },
    { id: 'home',        label: '🏠 Home & Kitchen', emoji: '🏠' },
  ],

  // Categories only live in Phase 2 — shown in nav as "Coming Soon"
  phase2Categories: [
    { id: 'beauty',  label: '💆 Beauty & Spas', emoji: '💆' },
    { id: 'food',    label: '🍽️ Food & Drink', emoji: '🍽️' },
    { id: 'local',   label: '📍 Local Deals', emoji: '📍' },
    { id: 'travel',  label: '✈️ Travel', emoji: '✈️' },
  ],

  // Hero banner copy per phase
  heroCopy: {
    1: {
      tag:      'Top Brand Deals — Updated Daily',
      headline: 'Shop Smarter.',
      accent:   'Save More.',
      sub:      'The best deals from Amazon, Walmart, Nike, and 200+ top brands — all in one place.',
      cta:      'Browse Deals',
    },
    2: {
      tag:      'New Season. New Deals.',
      headline: 'New Season.',
      accent:   'New Deals.',
      sub:      'Save up to 70% on beauty, adventures, dining, and more near you.',
      cta:      'Explore Deals',
    },
  },
} as const;

export type CategoryId = typeof PHASE_CONFIG.phase1Categories[number]['id']
                       | typeof PHASE_CONFIG.phase2Categories[number]['id'];
