import Link from "next/link";
import Image from "next/image";

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-2xl tracking-tighter text-indigo-600">
              proov.
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Blog</Link>
              <Link href="#" className="hover:text-slate-900 transition-colors">Docs</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">
              Login
            </Link>
            <Link href="/login?tab=register" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-8">
          <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px]">NEW</span>
          Trusted by manufacturers in 12+ countries &gt;
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Production.<br />Priced by you.
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Dream it. Price it. Watch the world proov it.<br/>
          The global custom product marketplace where buyers set the terms and manufacturers compete to win.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-medium px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-indigo-200">
            Start producing
          </Link>
          <Link href="/login" className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-lg font-medium px-8 py-3.5 rounded-full transition-colors flex items-center justify-center gap-2">
            Post your order <span className="text-slate-400">↗</span>
          </Link>
        </div>
      </section>

      {/* Product Image Mockup */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 md:p-4 shadow-2xl shadow-indigo-100/50">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white aspect-[16/9] relative flex items-center justify-center">
            {/* We'll use a placeholder gradient mimicking the screenshot in the PDF */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-slate-800 font-semibold mb-2">Proov Dashboard</h3>
              <p className="text-slate-500 text-sm">Log in to view the interactive dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-6 text-indigo-500">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">You set the price.</h3>
            <p className="text-slate-600 leading-relaxed">Upload your product brief, and simply name what you'll pay. We'll handle the rest.</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-6 text-indigo-500">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Matched in minutes.</h3>
            <p className="text-slate-600 leading-relaxed">Your inquiry hits factory floors across 50+ countries the second you post it.</p>
          </div>
          <div>
            <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-6 text-indigo-500">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Zero risk on both sides.</h3>
            <p className="text-slate-600 leading-relaxed">Your money moves only when your order does. Milestone-based releases ensure trust.</p>
          </div>
        </div>
      </section>

      {/* Feature Details */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 block">Features</span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Everything you need to source custom products</h2>
          <p className="text-lg text-slate-600">From AI-assisted techpack creation to secure escrow tracking, get the full picture of your supply chain.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Escrow protection</h3>
            <p className="text-slate-600 mb-8">Secure your funds in an escrow smart contract. Release milestone payments only when production phases are approved.</p>
            <ul className="space-y-3 text-sm text-slate-700 font-medium">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> USDC & Fiat integrations</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Automated payout routing</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Fasset off-ramp to PKR</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Realtime tracking</h3>
            <p className="text-slate-600 mb-8">Watch manufacturer bids arrive and interact with your RFQ as it happens. Negotiate live.</p>
            <ul className="space-y-3 text-sm text-slate-700 font-medium">
              <li className="flex items-center gap-2"><span className="text-blue-500">✓</span> Live manufacturer count</li>
              <li className="flex items-center gap-2"><span className="text-blue-500">✓</span> Interactive bidding feed</li>
              <li className="flex items-center gap-2"><span className="text-blue-500">✓</span> Streaming activity alerts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 block">Pricing</span>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Simplified pricing</h2>
          <p className="text-lg text-slate-600 mb-12">No confusing tiers. You just pay for what you use.</p>
          
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 max-w-md mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Proov Premium</h3>
            <p className="text-slate-500 mb-8">For serious manufacturers</p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl font-extrabold text-slate-900">$49</span>
              <span className="text-slate-500 font-medium">/mo</span>
            </div>
            <Link href="/login?tab=register" className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors mb-6">
              Start 14 day free trial
            </Link>
            <ul className="text-left space-y-4 text-slate-600 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
                Unlimited bidding on active RFQs
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
                Direct invoice link generation
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
                Escrow payment protection
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">See what's driving your revenue</h2>
        <p className="text-xl text-slate-600 mb-10">Join the manufacturers and buyers already using proov to close cross-border deals without the risk.</p>
        <Link href="/login" className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-medium px-8 py-3.5 rounded-full transition-colors shadow-lg shadow-indigo-200">
          Get started today
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="font-bold text-2xl tracking-tighter text-white mb-4 block">
              proov.
            </Link>
            <p className="max-w-xs mb-6">Built over hundreds of late nights, proov gives you a transparent, secure platform for global manufacturing.</p>
            <p>© 2026 Proov Inc.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/login?tab=register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Studio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Escrow Agreement</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
