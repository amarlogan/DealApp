import { Scale, FileText, ExternalLink, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | HuntMyDeal",
  description: "Read the terms and conditions for using the HuntMyDeal platform.",
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl mb-6">
          <Scale size={32} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Terms of Service</h1>
        <p className="text-gray-500 font-medium leading-relaxed">
          Last updated: April 19, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-amber max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><FileText size={20} className="text-gray-400" /></div>
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using HuntMyDeal.com (the "Site"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. We reserve the right to update these terms at any time without prior notice.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><AlertTriangle size={20} className="text-gray-400" /></div>
            2. Service Description & Disclaimers
          </h2>
          <p>
            HuntMyDeal is a deal aggregation platform that helps users find discounts from third-party retailers.
          </p>
          <ul>
            <li><strong>Accuracy of Information:</strong> While we strive for 100% accuracy, deal prices and availability can change in seconds. We are not responsible for discrepancies between HuntMyDeal and the final price at the checkout of a merchant site.</li>
            <li><strong>No Endorsement:</strong> Listing a deal on our site does not constitute an endorsement of the merchant or the product.</li>
          </ul>
        </section>

        <section className="bg-orange-50 p-8 rounded-3xl border border-orange-100 mb-12">
          <h3 className="text-orange-900 mt-0 flex items-center gap-2">
            <AlertTriangle size={20} /> Important: Third-Party Transactions
          </h3>
          <p className="text-orange-900/80 mb-0">
            HuntMyDeal is NOT a retailer. You do not buy products directly from us. All purchases are made on third-party websites. Any issues with orders, shipping, returns, or product defects must be resolved directly with the corresponding retailer.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><ExternalLink size={20} className="text-gray-400" /></div>
            3. User Accounts & Behavior
          </h2>
          <p>
            To use certain features like "Price Alerts," you must create an account. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>All activities that occur under your account.</li>
            <li>Not using the site for any illegal or unauthorized purpose, including scraping or automated data collection without our permission.</li>
          </ul>
        </section>

        <section>
          <h2>4. Limitation of Liability</h2>
          <p>
            HuntMyDeal and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or any products purchased via our affiliate links.
          </p>
        </section>
      </div>
    </div>
  );
}
