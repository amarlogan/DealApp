-- Additional mock data to ensure all categories have items
INSERT INTO public.deals (title, description, merchant, external_url, affiliate_url, image_url, current_price, original_price, category_id, badge, rating, review_count, is_popular, in_stock, external_id)
VALUES 
-- SPORTS
('Bowflex SelectTech 552 Adjustable Dumbbells', 'Adjusts from 5 to 52.5 lbs. Replaces 15 sets of weights.', 'Amazon', 'https://amazon.com/dp/SPORTS1', 'https://amazon.com/dp/SPORTS1?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80', 349.00, 429.00, 'sports', 'Best Seller', 4.8, 18452, true, true, 'amz-SPORTS1'),
('YETI Tundra 45 Cooler', 'Extremely durable cooler that keeps ice for days.', 'Yeti', 'https://amazon.com/dp/SPORTS2', 'https://amazon.com/dp/SPORTS2?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1596766467362-e421ae0cc959?w=800&q=80', 299.99, 325.00, 'sports', null, 4.9, 5420, true, true, 'yeti-SPORTS2'),
('Spalding NBA Zi/O Indoor-Outdoor Basketball', 'Official size and weight. Zi/O composite leather cover.', 'Walmart', 'https://walmart.com/ip/SPORTS3', 'https://walmart.com/ip/SPORTS3?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80', 24.99, 39.99, 'sports', 'Rollback', 4.6, 3211, false, true, 'wmt-SPORTS3'),

-- TOYS
('LEGO Star Wars Millennium Falcon', '7,541 piece set. The ultimate collector series Millennium Falcon.', 'LEGO', 'https://amazon.com/dp/TOYS1', 'https://amazon.com/dp/TOYS1?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&q=80', 799.99, 849.99, 'toys', 'Hot Deal', 4.9, 1205, true, true, 'lego-TOYS1'),
('Hot Wheels 50-Car Pack', 'Awesome set of 50 different 1:64 scale vehicles.', 'Amazon', 'https://amazon.com/dp/TOYS2', 'https://amazon.com/dp/TOYS2?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80', 49.99, 65.00, 'toys', null, 4.8, 8920, false, true, 'amz-TOYS2'),
('Nintendo Switch OLED Model', '7-inch OLED screen, 64GB storage, enhanced audio.', 'Target', 'https://target.com/p/TOYS3', 'https://target.com/p/TOYS3?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80', 329.00, 349.99, 'toys', 'Popular', 4.9, 45210, true, true, 'tgt-TOYS3'),

-- MORE ELECTRONICS
('Sony PlayStation 5 Console', 'Experience lightning-fast loading with an ultra-high speed SSD.', 'Amazon', 'https://amazon.com/dp/ELEC1', 'https://amazon.com/dp/ELEC1?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80', 449.00, 499.00, 'electronics', 'Sale', 4.8, 56000, true, true, 'amz-ELEC1'),

-- MORE FASHION
('The North Face Men''s ThermoBall Eco Jacket', 'Packable, water-resistant, insulated jacket.', 'The North Face', 'https://amazon.com/dp/FASH1', 'https://amazon.com/dp/FASH1?tag=REPLACE_TAG', 'https://images.unsplash.com/photo-1555274175-6cbf6f3b1319?w=800&q=80', 139.00, 199.00, 'fashion', 'Clearance', 4.7, 3450, true, true, 'tnf-FASH1')

ON CONFLICT (external_id) DO UPDATE SET
    current_price = EXCLUDED.current_price,
    updated_at    = NOW();
