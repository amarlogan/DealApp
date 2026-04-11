import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Palette, Calendar, Clock, Edit2, Play, Eye } from "lucide-react";

export default async function AdminSeasonsPage() {
  const supabase = createSupabaseAdmin();

  const { data: seasons, error } = await supabase
    .from("seasons")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return <div className="p-8 text-red-500 font-bold tracking-tight">PLATFORM ERROR: {error.message}</div>;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Seasonal & Themes</h1>
          <p className="text-gray-500 mt-1">Manage platform-wide thematic events and visual branding cycles.</p>
        </div>
        <button className="bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
          <Palette size={16} /> New Season
        </button>
      </div>

      <div className="space-y-6">
        {seasons?.map((season) => {
          const isActive = today >= season.start_date && today <= season.end_date;
          const isUpcoming = today < season.start_date;
          
          return (
            <div key={season.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row group transition-shadow hover:shadow-md">
              <div 
                className="w-full md:w-48 p-8 flex flex-col items-center justify-center text-white"
                style={{ backgroundColor: (season.css_variables as any)["--primary"] || "#000" }}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 border border-white/30">
                  <Palette size={32} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest opacity-80">CSS</span>
              </div>

              <div className="flex-1 p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-gray-900">{season.name}</h2>
                    {isActive ? (
                      <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100 animate-pulse">Live Now</span>
                    ) : isUpcoming ? (
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-100">Upcoming</span>
                    ) : null}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Calendar size={14} className="text-gray-400" />
                      {season.start_date}
                    </div>
                    <span className="text-gray-300">to</span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Clock size={14} className="text-gray-400" />
                      {season.end_date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-2">
                    <Edit2 size={14} /> Edit Season
                  </button>
                  <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors border border-gray-100">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
