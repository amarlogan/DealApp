import { Handshake, HelpCircle, DollarSign, ListChecks } from "lucide-react";

export const metadata = {
  title: "Affiliate Disclosure | HuntMyDeal",
  description: "Learn how HuntMyDeal earns commissions through hand-picked deals.",
};

export default function AffiliateDisclosure() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-2xl mb-6">
          <Handshake size={32} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Affiliate Disclosure</h1>
        <p className="text-gray-500 font-medium leading-relaxed">
          How we keep HuntMyDeal free for our community.
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-green max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><HelpCircle size={20} className="text-gray-400" /></div>
            Why This Disclosure?
          </h2>
          <p>
            Transparency is the foundation of the HuntMyDeal community. In compliance with FTC guidelines, we want to be 100% clear about how we make money. Our goal is to provide you with the best deals, and to do this without charging a subscription fee, we partner with retailers.
          </p>
        </section>

        <section className="bg-green-50 p-8 rounded-3xl border border-green-100 mb-12 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 shrink-0 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-green-900 mt-0 mb-2">How it works</h3>
            <p className="text-green-900/80 mb-0">
              When you click on a deal and make a purchase on a merchant's site (like Amazon, Nike, or Target), the merchant may pay us a small commission. This happens at <strong>no extra cost to you</strong>. In many cases, our partnerships actually help us negotiate exclusive promo codes for our users.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg"><ListChecks size={20} className="text-gray-400" /></div>
            Our Commitment to Honesty
          </h2>
          <p>
            Do commissions influence which deals we post?
          </p>
          <ul>
            <li><strong>Independence:</strong> Our deal hunters prioritize real value. If a deal isn't a great price, we don't post it, regardless of the affiliate commission.</li>
            <li><strong>Merchant Agnostic:</strong> We work with hundreds of brands. We are not "owned" by any retailer, allowing us to stay objective.</li>
            <li><strong>User First:</strong> Our priority is finding you the absolute best price. If the best price for a product is currently at a store we don't have a partnership with, we will still show you where to find it.</li>
          </ul>
        </section>

        <section className="border-t border-gray-100 pt-12">
          <h2>Amazon Associate Disclosure</h2>
          <p className="text-sm italic">
            HuntMyDeal is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
          </p>
        </section>
      </div>
    </div>
  );
}
