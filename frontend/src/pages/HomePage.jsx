import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, ArrowRight, ChevronRight, Cpu, Users, Star
} from 'lucide-react';
import api from '../services/api';
import ServiceCategoryCard from '../components/ServiceCategoryCard';
import ProviderCard from '../components/ProviderCard';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, provRes] = await Promise.all([
          api.get('/categories'),
          api.get('/providers?limit=4'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data.categories || []);
        if (provRes.data.success) setProviders((provRes.data.data.providers || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20 relative text-white">
      {/* ============ HERO SECTION ============ */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 cc-perspective overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6 text-center lg:text-left cc-rise">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold cc-pulse-ring">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI-Powered Home Services Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight cc-preserve3d">
              Reliable Home Repairs &amp; Services{' '}
              <span className="cc-gradient-text">In Minutes</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Describe your problem in plain language. Our AI engine classifies your request, matches verified local experts, compares transparent quotes, and tracks jobs start-to-finish.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/dashboard/customer/requests/new"
                className="w-full sm:w-auto px-8 py-4 cc-btn-glow text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm"
              >
                Book Service via AI Request
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/providers"
                className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-semibold rounded-2xl transition-all hover:-translate-y-0.5 backdrop-blur-md flex items-center justify-center gap-2 text-sm"
              >
                Browse All Providers
              </Link>
            </div>

            {/* Quick stats banner */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/10 text-left">
              <div className="cc-card rounded-2xl p-4 -my-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-display cc-gradient-text">100%</span>
                <p className="text-xs text-slate-400 font-medium">Verified Experts</p>
              </div>
              <div className="cc-card rounded-2xl p-4 -my-1" style={{ animationDelay: '0.1s' }}>
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-display">4.9★</span>
                <p className="text-xs text-slate-400 font-medium">Average Rating</p>
              </div>
              <div className="cc-card rounded-2xl p-4 -my-1" style={{ animationDelay: '0.2s' }}>
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-display">AI</span>
                <p className="text-xs text-slate-400 font-medium">Smart Match Engine</p>
              </div>
            </div>
          </div>

          {/* Hero visual card demo — 3D floating */}
          <div className="relative cc-preserve3d cc-rise" style={{ animationDelay: '0.15s' }}>
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-indigo-600/30 via-transparent to-cyan-500/30 blur-2xl cc-spin-slow -z-10" />
            <div className="cc-card rounded-3xl p-6 shadow-2xl shadow-indigo-900/50 border border-indigo-500/25 space-y-4 cc-float">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-xs font-mono text-indigo-300">Live AI Assistant</span>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Customer Request Input:</span>
                <p className="text-slate-200 italic">"My kitchen tap is leaking continuously and water is coming under the sink."</p>
              </div>

              <div className="bg-indigo-950/60 backdrop-blur-xl p-4 rounded-2xl border border-indigo-500/30 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    AI Classification Output
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[10px]">98% Confidence</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase">Category</span>
                    <strong className="text-white">Plumbing</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[9px] uppercase">Urgency</span>
                    <strong className="text-amber-400">Medium</strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-400">Required Skills: </span>
                  <span className="font-semibold text-indigo-300">Leak Repair, Pipe Repair, Sealant Fix</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> 10 Verified Providers Matched
                </span>
                <span className="text-indigo-300 font-semibold cursor-pointer group-hover:translate-x-1 transition-transform">Instant Quotes Ready →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICE CATEGORIES ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Top Services</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display cc-gradient-text">
              Popular Home Service Categories
            </h2>
          </div>
          <Link to="/services" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors">
            View all categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div key={cat._id} className="cc-rise" style={{ animationDelay: `${i * 90}ms` }}>
              <ServiceCategoryCard category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-2/3 h-40 bg-gradient-to-r from-indigo-600/20 via-cyan-500/20 to-violet-600/20 blur-3xl rounded-full -z-0" />
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Simple 4-Step Process</span>
            <h2 className="text-3xl font-extrabold font-display cc-gradient-text">How CareConnect Works</h2>
            <p className="text-slate-300 text-sm">
              From request creation to final job confirmation, everything is automated, transparent, and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 cc-perspective">
            {[
              { n: 1, title: 'Create Request', desc: 'Describe your issue in plain words. AI classifies the category, required skills, and urgency level.', grad: 'from-indigo-600 to-indigo-500' },
              { n: 2, title: 'Compare Quotes', desc: 'Receive quotes from AI-recommended providers. Compare prices, timelines, and ratings.', grad: 'from-cyan-600 to-cyan-500' },
              { n: 3, title: 'Track Service', desc: 'Track status updates live (Accepted, On the Way, In Progress). Provider uploads before/after photos.', grad: 'from-emerald-600 to-emerald-500' },
              { n: 4, title: 'Confirm & Review', desc: 'Verify completed work, finalize invoice payment, and submit your rating and review.', grad: 'from-amber-500 to-orange-500' },
            ].map((step, i) => (
              <div
                key={step.n}
                className="cc-card rounded-2xl p-6 border-white/10 relative space-y-3 cc-rise transform hover:rotateY-6"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.grad} text-white font-bold flex items-center justify-center text-xl shadow-lg shadow-indigo-900/30 cc-float`}>
                  {step.n}
                </div>
                <h3 className="font-bold text-white text-base">{step.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED PROVIDERS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Top Rated Professionals</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display cc-gradient-text">
              Featured Verified Providers
            </h2>
          </div>
          <Link to="/providers" className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 transition-colors">
            View all providers <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((p, i) => (
            <div key={p._id} className="cc-rise" style={{ animationDelay: `${i * 90}ms` }}>
              <ProviderCard provider={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ CALL TO ACTION ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden cc-perspective">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-700 opacity-90" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl cc-spin-slow" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-cyan-300/30 rounded-full blur-3xl cc-spin-slow" />

          <div className="relative space-y-3 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-white/15 px-3 py-1 rounded-full border border-white/25">
              <Cpu className="w-3.5 h-3.5 text-cyan-200" /> Instant AI matching
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">Need Quick Home Maintenance Today?</h2>
            <p className="text-indigo-100 text-sm max-w-xl">
              Join thousands of satisfied homeowners. Create a request now and let our AI engine match you with the best nearby professional.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2 text-xs text-indigo-100">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 10k+ bookings</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-300 text-amber-300" /> 4.9 avg rating</span>
            </div>
          </div>

          <Link
            to="/dashboard/customer/requests/new"
            className="relative z-10 px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl shadow-xl hover:bg-indigo-50 transition-all hover:-translate-y-1 hover:shadow-2xl text-sm shrink-0"
          >
            Create Service Request Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;