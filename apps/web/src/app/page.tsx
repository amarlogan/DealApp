"use client";

import { useState } from "react";
import DealCard from "@/components/DealCard";
import { ChevronRight, Sparkles, Gift, Utensils, Plane, ShoppingBag, Dumbbell, MapPin, Clock, TrendingUp, Percent } from "lucide-react";

// Rich mock data for a compelling prototype
const MOCK_CATEGORIES = {
  trending: [
    { id: '1', title: 'Family Fun Center & Bullwinkle\'s - Up to 24% Off Packages', merchant: 'Family Fun Center', location: 'Tukwila · 2.1 mi', current_price: 28.00, original_price: 45.99, discount_percentage: 24, promo_code: 'FUN', rating: 4.7, reviews: '21,195', isPopular: true, image_url: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80' },
    { id: '2', title: 'Admission to Woodland Park Zoo with Family Passes', merchant: 'Woodland Park Zoo', location: 'Seattle · 4.3 mi', current_price: 25.80, original_price: 32.25, discount_percentage: 20, promo_code: null, rating: 4.8, reviews: '1,639', isPopular: true, image_url: 'https://images.unsplash.com/photo-1504173010664-32509107926d?w=800&q=80' },
    { id: '3', title: 'Indoor Skydiving Experience for One or Two', merchant: 'iFly Indoor Skydiving', location: 'Renton · 8 mi', current_price: 49.99, original_price: 89.95, discount_percentage: 44, promo_code: 'FLY44', rating: 4.9, reviews: '3,842', isPopular: true, image_url: 'https://images.unsplash.com/photo-1544475185-ef1b939e1e0e?w=800&q=80' },
    { id: '4', title: '3-7 Days of Parking Near SeaTac Airport', merchant: 'Masterpark Lot B', location: 'SeaTac · 4 mi', current_price: 54.49, original_price: 60.00, discount_percentage: 9, promo_code: 'SPRING', rating: 4.9, reviews: '6,201', isPopular: false, image_url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=800&q=80' },
    { id: '5', title: 'Relaxing 60-Minute Swedish Massage with Aromatherapy', merchant: 'Tranquil Spa Oasis', location: 'Bellevue · 8 mi', current_price: 45.00, original_price: 90.00, discount_percentage: 50, promo_code: null, rating: 4.6, reviews: '422', isPopular: true, image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' },
    { id: '10', title: 'Kayak or Paddleboard Rental for 2 Hours on Lake Union', merchant: 'Seattle Paddle Co.', location: 'Eastlake · 3 mi', current_price: 39.00, original_price: 65.00, discount_percentage: 40, promo_code: 'PADDLE', rating: 4.8, reviews: '892', isPopular: true, image_url: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80' },
  ],
  gifts: [
    { id: '6', title: 'The Legendary Campfire Feast: 3-Course Steakhouse Dinner', merchant: 'Black Angus Steakhouse', location: '30 Locations', current_price: 33.49, original_price: 41.99, discount_percentage: 12, promo_code: 'SPRING', rating: 4.6, reviews: '11,340', isPopular: true, image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80' },
    { id: '7', title: 'Hands-On Children\'s Museum: Interactive Exhibits for Kids', merchant: 'Hands On Children\'s Museum', location: 'Olympia · 43 mi', current_price: 16.00, original_price: 19.95, discount_percentage: 20, promo_code: null, rating: 4.9, reviews: '4,480', isPopular: true, image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80' },
    { id: '8', title: 'Bowlero Bowling: Up to 72% Off Lanes + Shoe Rental', merchant: 'Bowlero', location: 'Seattle', current_price: 38.00, original_price: 103.52, discount_percentage: 61, promo_code: 'BOWL', rating: 4.7, reviews: '71,867', isPopular: true, image_url: 'https://images.unsplash.com/photo-1562609952-ef72af0919ec?w=800&q=80' },
    { id: '9', title: 'Seattle CityPASS Tickets - Save Up to 47% on Top Attractions', merchant: 'Seattle CityPASS', location: '6 Locations', current_price: 139.00, original_price: 250.00, discount_percentage: 44, promo_code: null, rating: 4.7, reviews: '54', isPopular: true, image_url: 'https://images.unsplash.com/photo-1503197979108-c8241732e365?w=800&q=80' },
    { id: '11', title: 'Wine & Paint Workshop for Two – Any Night', merchant: 'Pinot\'s Palette', location: 'Capitol Hill · 2 mi', current_price: 55.00, original_price: 75.00, discount_percentage: 27, promo_code: null, rating: 4.8, reviews: '1,203', isPopular: true, image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80' },
    { id: '12', title: 'Pottery Class for Two: 2-Hour Session with Materials', merchant: 'Seattle Clay Arts', location: 'Fremont · 5 mi', current_price: 65.00, original_price: 120.00, discount_percentage: 46, promo_code: 'CRAFT', rating: 4.9, reviews: '341', isPopular: false, image_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80' },
  ],
  beauty: [
    { id: '13', title: 'Full Body Facial & Dermaplaning Treatment (75 min)', merchant: 'Lux Skin Studio', location: 'Bellevue · 9 mi', current_price: 59.00, original_price: 130.00, discount_percentage: 55, promo_code: null, rating: 4.9, reviews: '876', isPopular: true, image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80' },
    { id: '14', title: 'Shellac Manicure + Classic Pedicure Combo', merchant: 'Nail Luxe Spa', location: 'Redmond · 12 mi', current_price: 45.00, original_price: 85.00, discount_percentage: 47, promo_code: 'NAILS', rating: 4.7, reviews: '2,134', isPopular: false, image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80' },
    { id: '15', title: '60-Min Deep Tissue + Hot Stone Massage Fusion', merchant: 'The Healing Touch', location: 'Kirkland · 14 mi', current_price: 65.00, original_price: 110.00, discount_percentage: 41, promo_code: null, rating: 4.8, reviews: '993', isPopular: true, image_url: 'https://images.unsplash.com/photo-1498576260462-eefc9d0ce9b7?w=800&q=80' },
    { id: '16', title: 'Brazilian Blowout + Haircut + Blowdry', merchant: 'Salon Luxe', location: 'Belltown · 1 mi', current_price: 75.00, original_price: 220.00, discount_percentage: 66, promo_code: 'HAIR', rating: 4.6, reviews: '541', isPopular: true, image_url: 'https://images.unsplash.com/photo-1560066984-138daaa0b490?w=800&q=80' },
    { id: '17', title: 'Vitamin C Glow Facial + LED Therapy Treatment', merchant: 'Clarity Skincare', location: 'Capitol Hill · 2 mi', current_price: 49.99, original_price: 95.00, discount_percentage: 47, promo_code: null, rating: 4.9, reviews: '287', isPopular: false, image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80' },
  ],
  food: [
    { id: '18', title: '$40 to Spend on Dinner for Two at Canlis Fine Dining', merchant: 'Canlis Restaurant', location: 'Queen Anne · 3 mi', current_price: 20.00, original_price: 40.00, discount_percentage: 50, promo_code: null, rating: 4.9, reviews: '3,201', isPopular: true, image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
    { id: '19', title: 'Unlimited Sushi Brunch + Bottomless Mimosas (Sat/Sun)', merchant: 'Japonessa Sushi', location: 'Pike Place · 1 mi', current_price: 38.00, original_price: 70.00, discount_percentage: 46, promo_code: 'BRUNCH', rating: 4.7, reviews: '8,034', isPopular: true, image_url: 'https://images.unsplash.com/photo-1617196034199-68222d3b81b7?w=800&q=80' },
    { id: '20', title: 'Seattle Brewery Tour for 2: 5 Craft Breweries', merchant: 'Seattle Brewery Tours', location: 'SoDo · 5 mi', current_price: 55.00, original_price: 89.00, discount_percentage: 38, promo_code: 'BREW', rating: 4.8, reviews: '1,156', isPopular: false, image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80' },
    { id: '21', title: '3-Course Dinner for Two with Wine Pairing', merchant: 'Purple Café & Wine Bar', location: 'Downtown · 2 mi', current_price: 49.00, original_price: 95.00, discount_percentage: 48, promo_code: null, rating: 4.8, reviews: '4,892', isPopular: true, image_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' },
    { id: '22', title: 'Chef\'s Tasting Menu: 5-Course Omakase Experience', merchant: 'Nishino', location: 'Madison Valley · 4 mi', current_price: 89.00, original_price: 150.00, discount_percentage: 41, promo_code: null, rating: 4.9, reviews: '712', isPopular: true, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
  ],
};

const QUICK_CATEGORIES = [
  { icon: <TrendingUp size={20} />, label: 'Trending', color: 'bg-orange-100 text-orange-600' },
  { icon: <Gift size={20} />, label: 'Gifts', color: 'bg-pink-100 text-pink-600' },
  { icon: <Dumbbell size={20} />, label: 'Fitness', color: 'bg-blue-100 text-blue-600' },
  { icon: <Utensils size={20} />, label: 'Food', color: 'bg-yellow-100 text-yellow-700' },
  { icon: <Plane size={20} />, label: 'Travel', color: 'bg-sky-100 text-sky-600' },
  { icon: <ShoppingBag size={20} />, label: 'Shopping', color: 'bg-purple-100 text-purple-600' },
  { icon: <Sparkles size={20} />, label: 'Beauty', color: 'bg-rose-100 text-rose-600' },
  { icon: <MapPin size={20} />, label: 'Local', color: 'bg-green-100 text-green-700' },
];

const PROMO_BANNERS = [
  { icon: '🌸', label: 'Spring Savings', sublabel: 'Up to 70% off', color: 'from-pink-400 to-rose-500' },
  { icon: '💆', label: 'Spa & Wellness', sublabel: '50%+ off treatments', color: 'from-teal-400 to-cyan-500' },
  { icon: '🍕', label: 'Food & Drink', sublabel: 'Restaurants near you', color: 'from-orange-400 to-amber-500' },
  { icon: '✈️', label: 'Travel Deals', sublabel: 'Hotels, flights & more', color: 'from-blue-400 to-indigo-500' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('Trending');

  const renderCarousel = (title: string, deals: any[], icon?: React.ReactNode, featured = false) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#53A318]">{icon}</span>}
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
        </div>
        <a href="#" className="text-sm font-semibold text-[#53A318] hover:text-[#438a10] transition-colors flex items-center gap-1 group">
          See all <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar snap-x snap-mandatory">
        {deals.map(deal => (
          <div className="snap-start" key={deal.id}>
            <DealCard deal={deal} featured={featured} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-in w-full mb-8">

      {/* Hero Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden mb-8 shadow-xl">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/hero_banner.png')` }}
        />
        {/* Frosted overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a0f]/80 via-[#1a3a0f]/50 to-transparent" />

        <div className="relative z-10 p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[300px]">
          <div className="text-white max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-white/30">
              <Sparkles size={12} /> Spring Sale — Limited Time
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-3 drop-shadow-sm">
              New Season.<br/>
              <span className="text-[#90e050]">New Deals.</span>
            </h1>
            <p className="text-lg text-white/85 font-medium mb-6">
              Save up to 70% on beauty, adventures, dining, and more near Seattle.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-[#53A318] hover:bg-[#438a10] text-white px-7 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <Percent size={16} /> Explore Deals
              </button>
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-full font-semibold border border-white/40 transition-all">
                Browse Categories
              </button>
            </div>
          </div>

          {/* Stats callout */}
          <div className="hidden lg:grid grid-cols-2 gap-3 flex-shrink-0">
            {[
              { value: '50,000+', label: 'Active Deals' },
              { value: 'Up to 70%', label: 'Max Savings' },
              { value: '200+', label: 'Top Merchants' },
              { value: '4.9 ⭐', label: 'Avg Rating' },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-4 text-center min-w-[120px]">
                <div className="text-2xl font-black text-[#53A318]">{stat.value}</div>
                <div className="text-xs text-gray-600 font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Category Pills */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-6">
        {QUICK_CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(cat.label)}
            className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border-2 transition-all hover:shadow-md ${
              activeCategory === cat.label
                ? 'border-[#53A318] bg-[#e8f4e0] shadow-sm'
                : 'border-transparent bg-white hover:border-gray-200'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${cat.color}`}>{cat.icon}</div>
            <span className="text-xs font-bold text-gray-700">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Promo Highlight Banners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {PROMO_BANNERS.map((banner) => (
          <a
            key={banner.label}
            href="#"
            className={`bg-gradient-to-br ${banner.color} rounded-2xl p-5 text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
          >
            <div className="text-3xl mb-2">{banner.icon}</div>
            <div className="font-black text-base leading-tight">{banner.label}</div>
            <div className="text-xs font-medium opacity-80 mt-0.5">{banner.sublabel}</div>
          </a>
        ))}
      </div>

      {/* Flash Deals Timer Banner */}
      <div className="bg-gradient-to-r from-[#232323] to-[#3a3a3a] rounded-2xl px-6 py-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚡</div>
          <div>
            <div className="text-white font-black text-lg">Flash Deals</div>
            <div className="text-gray-400 text-sm">Limited-time prices ending soon!</div>
          </div>
        </div>
        <FlashTimer />
      </div>

      {/* Main Deal Carousels */}
      {renderCarousel("Trending Now", MOCK_CATEGORIES.trending, <TrendingUp size={22} />)}
      {renderCarousel("Trending Gifts 🎁", MOCK_CATEGORIES.gifts, <Gift size={22} />, true)}
      {renderCarousel("Beauty & Spas 💆", MOCK_CATEGORIES.beauty, <Sparkles size={22} />)}
      {renderCarousel("Food & Drink 🍽️", MOCK_CATEGORIES.food, <Utensils size={22} />)}

      {/* Newsletter Section */}
      <div className="bg-gradient-to-br from-[#53A318] to-[#2d7a00] rounded-3xl p-8 lg:p-12 text-white mt-8">
        <div className="max-w-xl mx-auto text-center">
          <div className="text-4xl mb-3">📬</div>
          <h2 className="text-3xl font-black mb-2">Never Miss a Deal</h2>
          <p className="text-white/80 mb-6 font-medium">Get the best deals in your inbox daily. Over 200,000 savvy shoppers have already joined!</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email..."
              className="flex-1 px-5 py-3 rounded-full text-gray-900 font-medium outline-none placeholder-gray-400 shadow-inner"
            />
            <button className="bg-[#ff6128] hover:bg-[#e0521e] text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all hover:scale-105 whitespace-nowrap">
              Get Deals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Flash countdown timer component
function FlashTimer() {
  const [time, setTime] = useState({ h: 4, m: 23, s: 17 });

  // Note: In a real app we'd use useEffect for live countdown
  return (
    <div className="flex items-center gap-2">
      <div className="text-white text-sm font-medium mr-1">Ends in:</div>
      {[
        { val: String(time.h).padStart(2, '0'), label: 'hr' },
        { val: String(time.m).padStart(2, '0'), label: 'min' },
        { val: String(time.s).padStart(2, '0'), label: 'sec' },
      ].map((unit, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-[#ff6128] text-white font-black text-xl px-3 py-1.5 rounded-lg min-w-[52px] text-center tabular-nums">
            {unit.val}
          </div>
          <span className="text-gray-400 text-xs font-medium">{unit.label}</span>
          {i < 2 && <span className="text-[#ff6128] font-black text-xl">:</span>}
        </div>
      ))}
    </div>
  );
}
