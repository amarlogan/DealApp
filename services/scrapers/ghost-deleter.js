import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_anon_key';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Ghost-Deleter chron service initialized...');

// Simulating checking every minute (development) or once daily (production).
// 0 0 * * * = Midnight daily
cron.schedule('* * * * *', async () => {
    console.log('Running Ghost-Deleter sweep...');
    
    // In a real scenario, this would ping `external_url` for a 404 or parse "Out of Stock" string using Puppeteer/Cheerio.
    // Here, we simulate randomly finding expired deals.
    
    // Grab some active deals
    const { data: deals, error } = await supabase
        .from('deals')
        .select('id')
        .eq('status', 'active')
        .limit(10);
        
    if (error) {
         console.error('Error fetching deals', error);
         return;
    }
    
    if (deals && deals.length > 0) {
        // Mock random expiration logic
        const expiredDeal = deals[Math.floor(Math.random() * deals.length)];
        
        const { error: updateError } = await supabase
             .from('deals')
             .update({ status: 'expired' })
             .eq('id', expiredDeal.id);
             
        if (updateError) {
            console.error('Failed to expire deal:', updateError.message);
        } else {
            console.log(`Ghost-Deleter moved deal ${expiredDeal.id} to "expired" state.`);
        }
    }
});
