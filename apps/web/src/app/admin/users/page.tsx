import { createSupabaseAdmin } from "@/lib/supabase-server";
import UsersManagerClient from "./UsersManagerClient";

export default async function AdminUsersPage() {
  const supabaseAdmin = createSupabaseAdmin();

  // 1. Fetch Auth Users (to get emails) and Public Profiles (to get roles) in parallel
  const [{ data: authRes, error: authError }, { data: profiles, error: profileError }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
  ]);
  
  if (authError || profileError) {
    return (
      <div className="p-8 text-red-500 font-black tracking-tight uppercase border-2 border-red-100 bg-red-50 rounded-3xl">
        Access Error: Users list could not be retrieved from the security vault.
      </div>
    );
  }

  const authUsers = authRes?.users;

  // 2. Merge Auth data (emails/activity) with Profile data (roles/preferences)
  const mergedUsers = profiles?.map(profile => {
    const authUser = authUsers?.find(u => u.id === profile.id);
    return {
      ...profile,
      email: authUser?.email || "Unknown",
      last_sign_in: authUser?.last_sign_in_at,
    };
  });

  return <UsersManagerClient initialUsers={mergedUsers || []} />;
}
