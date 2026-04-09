"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const CATEGORIES = [
  "Electronics", "Home & Kitchen", "Fashion", "Beauty", 
  "Toys & Games", "Sports", "Automotive", "Pet Supplies"
];

export default function ProfilePage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
        if (selectedTags.length < 5) setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app we'd update auth.users user_metadata or a separate profiles table
    // await supabase.auth.updateUser({ data: { interests: selectedTags } });
    await new Promise(r => setTimeout(r, 800)); // mock delay
    setIsSaving(false);
    alert("Preferences saved! Your homepage is now personalized.");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 mt-12 animate-in fade-in slide-in-from-bottom-8">
      <h2 className="text-3xl font-bold font-outfit mb-2">Niche Interests Wizard</h2>
      <p className="text-gray-400 mb-8">Select 3-5 tags to personalize your smart shopping grid.</p>
      
      <div className="flex flex-wrap gap-3 mb-10">
        {CATEGORIES.map(category => {
          const isSelected = selectedTags.includes(category);
          return (
             <button
                key={category}
                onClick={() => toggleTag(category)}
                disabled={!isSelected && selectedTags.length >= 5}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all duration-300 font-medium tracking-wide
                  ${isSelected ? 'bg-[var(--color-primary,#4f46e5)] border-transparent text-white shadow-lg scale-105' : 'border-white/20 hover:border-white/40 text-gray-300 disabled:opacity-30 disabled:scale-100'}
                `}
             >
                {category}
                {isSelected && <Check size={16} className="text-white" />}
             </button>
          )
        })}
      </div>
      
      <div className="flex justify-between items-center border-t border-white/10 pt-6">
         <span className="text-sm font-medium text-gray-400">
            {selectedTags.length} / 5 selected
         </span>
         <button 
           onClick={handleSave}
           disabled={selectedTags.length < 1 || isSaving}
           className="px-8 py-3 rounded-full bg-white text-black font-bold disabled:opacity-50 hover:bg-gray-200 transition-colors"
         >
           {isSaving ? "Saving..." : "Save Preferences"}
         </button>
      </div>
    </div>
  );
}
