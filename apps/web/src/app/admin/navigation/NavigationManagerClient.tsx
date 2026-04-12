"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Check, Search, RotateCcw, Link, Tag, Flame } from "lucide-react";
import AdminModal from "@/components/admin/AdminModal";
import NavigationForm from "@/components/admin/NavigationForm";
import { useRouter } from "next/navigation";

interface NavigationManagerClientProps {
  initialItems: any[];
  categories: any[];
}

export default function NavigationManagerClient({ initialItems, categories }: NavigationManagerClientProps) {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  const router = useRouter();

  // ── SEARCH LOGIC ──────────────────────────────────────────────────────────
  const filteredItems = items.filter(item => {
    const label = item.label_override || item.categories?.label || item.href || "";
    return label.toLowerCase().includes(search.toLowerCase());
  });

  // ── REORDERING LOGIC ───────────────────────────────────────────────────────
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const actualIndex = items.indexOf(filteredItems[index]);
    const newIndex = direction === 'up' ? actualIndex - 1 : actualIndex + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(actualIndex, 1);
    newItems.splice(direction === 'up' ? actualIndex - 1 : actualIndex + 1, 0, movedItem);

    setItems(newItems);
    setHasChanges(true);
  };

  const handleSaveLayout = async () => {
    setIsLoading(true);
    try {
      const reordered = items.map((item, i) => ({
        id: item.id,
        sort_order: (i + 1) * 10
      }));

      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", data: { items: reordered } }),
      });

      if (!res.ok) throw new Error("Failed to save layout");
      
      setHasChanges(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── CRUD LOGIC ────────────────────────────────────────────────────────────
  const handleSaveItem = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingItem ? "update" : "create",
          id: editingItem?.id,
          data: { ...data, sort_order: editingItem?.sort_order || (items.length + 1) * 10 }
        }),
      });

      if (!response.ok) throw new Error("Failed to save item");

      setIsModalOpen(false);
      setEditingItem(null);
      router.refresh();
      // Faster local update
      if (editingItem) {
          setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
      } else {
          window.location.reload(); // Hard reload for complex relations
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove the link from the top navigation.")) return;
    setIsLoading(true);
    try {
      await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      setItems(prev => prev.filter(i => i.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Top Navigation</h1>
          <p className="text-gray-500 mt-1">Manage the primary menu links, highlight sales, and control external links.</p>
        </div>
        <div className="flex gap-3">
            {hasChanges && (
                <button 
                onClick={() => { setItems(initialItems); setHasChanges(false); }}
                className="bg-gray-100 text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                <RotateCcw size={16} /> Reset
                </button>
            )}
            <button 
                onClick={hasChanges ? handleSaveLayout : () => { setEditingItem(null); setIsModalOpen(true); }}
                className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center gap-2 ${
                    hasChanges ? "bg-[#53A318] text-white hover:scale-105" : "bg-black text-white hover:scale-105"
                }`}
            >
                {hasChanges ? <Check size={16} /> : <Plus size={16} />}
                {hasChanges ? "Save Layout" : "New Nav Link"}
            </button>
        </div>
      </div>

      {/* Global Search Feature */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search navigation links by label..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#53A318] transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Order</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Navigation Label</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Source/Link</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Settings</th>
                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredItems.map((item, index) => {
              const label = item.label_override || item.categories?.label || "Untitled Link";
              const isCategory = !!item.category_id;
              
              return (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                            <button 
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0}
                                className="p-1 rounded-lg text-gray-300 hover:text-[#53A318] disabled:opacity-10"
                            >
                                <ChevronUp size={14} />
                            </button>
                            <span className="text-[10px] font-black text-gray-400">{index + 1}</span>
                            <button 
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === filteredItems.length - 1}
                                className="p-1 rounded-lg text-gray-300 hover:text-[#53A318] disabled:opacity-10"
                            >
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${item.is_highlighted ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                {isCategory ? <Tag size={16} /> : <Link size={16} />}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black ${item.is_highlighted ? 'text-amber-600' : 'text-gray-900'}`}>
                                    {label}
                                </span>
                                {item.label_override && (
                                    <span className="text-[10px] font-medium text-gray-400 italic">Override active</span>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500 truncate max-w-[200px]">{item.href || `Linked to: ${item.categories?.label}`}</span>
                            <span className="text-[9px] font-black uppercase text-gray-400 mt-1">Source: {isCategory ? 'Category' : 'Direct Link'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                             {item.is_highlighted && (
                                <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                                    <Flame size={10} /> HOT
                                </span>
                             )}
                             {item.is_visible ? (
                                <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">Live</span>
                             ) : (
                                <span className="bg-red-50 text-red-500 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-red-100">Hidden</span>
                             )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-600 hover:text-[#53A318] hover:border-[#53A318] transition-all shadow-sm"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2.5 rounded-xl border border-gray-100 bg-white text-gray-300 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        title={editingItem ? "Refine Navigation Link" : "Add Primary Nav Link"}
      >
        <NavigationForm 
          initialData={editingItem}
          categories={categories}
          onSave={handleSaveItem}
          isLoading={isLoading}
        />
      </AdminModal>
    </div>
  );
}
