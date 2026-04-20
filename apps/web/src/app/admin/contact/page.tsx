import { createSupabaseAdmin } from "@/lib/supabase-server";
import ContactManagerClient from "./ContactManagerClient";

export default async function AdminContactPage() {
  const supabase = createSupabaseAdmin();

  const { data: submissions, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500 font-black tracking-tight uppercase border-2 border-red-100 bg-red-50 rounded-3xl">
        Data Fetch Error: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Inquiries</h1>
          <p className="text-gray-500 font-medium">Manage support tickets and business collaboration requests.</p>
        </div>
      </div>

      <ContactManagerClient initialSubmissions={submissions || []} />
    </div>
  );
}
