import { createSupabaseAdmin } from "@/lib/supabase-server";
import SeasonsManagerClient from "./SeasonsManagerClient";

export default async function AdminSeasonsPage() {
  const supabase = createSupabaseAdmin();

  const { data: seasons, error } = await supabase
    .from("seasons")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500 font-bold tracking-tight uppercase border-2 border-red-100 rounded-3xl bg-red-50">
        Database Sync Error: {error.message}
      </div>
    );
  }

  return <SeasonsManagerClient initialSeasons={seasons || []} />;
}
