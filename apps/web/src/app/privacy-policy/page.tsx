import { Shield, Lock, Eye, Globe } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | HuntMyDeal",
  description: "Read the HuntMyDeal privacy policy to understand how we protect your data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-6">
          <Shield size={32} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-gray-500 font-medium leading-relaxed">
          Last updated: April 19, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-blue max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><Eye size={20} className="text-gray-400" /></div>
            1. Information We Collect
          </h2>
          <p>
            At HuntMyDeal, we believe in radical transparency. We collect information to provide better services to all our users.
          </p>
          <ul>
            <li><strong>Account Information:</strong> When you sign up, we collect your name, email, and preferences to personalize your deal feed.</li>
            <li><strong>Usage Data:</strong> We track which deals you click on and which categories you browse to improve our recommendation engine.</li>
            <li><strong>Cookies:</strong> We use cookies to track affiliate referrals. This is how we ensure our partner brands know that HuntMyDeal sent you, allowing us to keep this service free for you.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><Globe size={20} className="text-gray-400" /></div>
            2. How We Use Your Information
          </h2>
          <p>
            Your data is used primarily to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our deal aggregation services.</li>
            <li>Send you price drop alerts and seasonal deal notifications if you've opted in.</li>
            <li>Facilitate affiliate relationships with merchant partners.</li>
            <li>Protect our community from fraud and abuse.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><Lock size={20} className="text-gray-400" /></div>
            3. Data Sharing & Third Parties
          </h2>
          <p>
            We do not sell your personal data to advertisers. However, we do share information in limited circumstances:
          </p>
          <ul>
            <li><strong>Affiliate Links:</strong> When you click a deal, you are redirected to a merchant site (like Amazon or Walmart). These sites have their own privacy policies.</li>
            <li><strong>Service Providers:</strong> We use trusted third-party services (like Supabase for database management and Vercel for hosting) that are compliant with industry security standards.</li>
          </ul>
        </section>

        <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100 mb-12">
          <h3 className="text-gray-900 mt-0">Security Note</h3>
          <p className="mb-0">
            We use industry-standard encryption (SSL/TLS) to protect your data in transit. While no system is 100% secure, we regularly audit our infrastructure to ensure your information stays safe.
          </p>
        </section>

        <section>
          <h2>4. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time. If you wish to delete your HuntMyDeal account and all associated data, please visit your Profile Settings or contact us at <span className="text-[var(--primary)] font-bold">privacy@huntmydeal.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
