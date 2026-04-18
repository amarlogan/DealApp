import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Assuming root .env or pass dynamically

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_anon_key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock data simulating disparate API feeds
const rawFeeds = {
    amazon: [
        {
            asin: 'B0C7J81K8K',
            productName: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
            msrp: 398.00,
            salePrice: 298.00,
            url: 'https://amazon.com/dp/B0C7J81K8K',
            tags: ['electronics', 'audio', 'headphones']
        }
    ],
    ebay: [
        {
            itemId: '204918231',
            listingTitle: 'Apple Watch Series 9 (GPS, 41mm) - Midnight',
            originalPrice: 399.00,
            currentBidOrBuyNow: 320.00,
            link: 'https://ebay.com/itm/204918231',
            categories: ['tech', 'wearables', 'apple']
        }
    ]
};

async function normalizeAndUpsert() {
    console.log('Starting data normalization...');
    const normalizedDeals = [];

    const categoryMapper = (tags) => {
        const validCategories = ['electronics', 'home-kitchen', 'fashion', 'shoes', 'sports', 'toys', 'health', 'pets'];
        const tagMap = {
            'tech': 'electronics',
            'audio': 'electronics',
            'wearables': 'electronics',
            'apple': 'electronics',
            'appliances': 'home-kitchen',
            'clothing': 'fashion'
        };
        
        for (const tag of tags) {
            const normalizedTag = tag.toLowerCase();
            if (validCategories.includes(normalizedTag)) return normalizedTag;
            if (tagMap[normalizedTag]) return tagMap[normalizedTag];
        }
        return 'other';
    };

    // Transform Amazon data
    rawFeeds.amazon.forEach(item => {
        normalizedDeals.push({
            title: item.productName,
            description: `Great deal on ${item.productName}`,
            merchant: 'Amazon',
            external_url: item.url,
            current_price: item.salePrice,
            original_price: item.msrp,
            category_id: categoryMapper(item.tags),
            image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
            external_id: `amz-${item.asin}`,
            status: 'active'
        });
    });

    // Transform eBay data
    rawFeeds.ebay.forEach(item => {
        normalizedDeals.push({
            title: item.listingTitle,
            description: `Limited time find: ${item.listingTitle}`,
            merchant: 'eBay',
            external_url: item.link,
            current_price: item.currentBidOrBuyNow,
            original_price: item.originalPrice,
            category_id: categoryMapper(item.categories),
            image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
            external_id: `ebay-${item.itemId}`,
            status: 'active'
        });
    });

    // UPSERT into Supabase (matching on external_id)
    for (const deal of normalizedDeals) {
        const { data, error } = await supabase
            .from('deals')
            .upsert(deal, { onConflict: 'external_id' })
            .select();
        
        if (error) {
            console.error(`Failed to ingest ${deal.title}:`, error.message);
        } else {
            console.log(`Ingested ${deal.merchant} Deal: ${deal.title}`);
            // Let's also create dummy price history to trigger 30-day average calculations
            if (data && data.length > 0) {
                 await supabase.from('price_history').insert([
                     { deal_id: data[0].id, price: deal.original_price - 10, recorded_at: new Date(Date.now() - 15 * 86400000).toISOString() },
                     { deal_id: data[0].id, price: deal.original_price, recorded_at: new Date(Date.now() - 28 * 86400000).toISOString() }
                 ]);
            }
        }
    }
    console.log('Normalization complete.');
}

normalizeAndUpsert();
