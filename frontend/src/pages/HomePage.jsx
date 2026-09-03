import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, ArrowRight, ChevronRight
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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-slate-950 to-slate-900 z-0"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI-Powered Home Services Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-tight tracking-tight">
              Reliable Home Repairs & Services <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">In Minutes</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Describe your problem in plain language. Our AI engine classifies your request, matches verified local experts, compares transparent quotes, and tracks jobs start-to-finish.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/dashboard/customer/requests/new"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                Book Service via AI Request
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/providers"
                className="w-full sm:w-auto px-6 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
              >
                Browse All Providers
              </Link>
            </div>

            {/* Quick stats banner */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-left">
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">100%</span>
                <p className="text-xs text-slate-400 font-medium">Verified Experts</p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-display">4.9★</span>
                <p className="text-xs text-slate-400 font-medium">Average Rating</p>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-display">AI</span>
                <p className="text-xs text-slate-400 font-medium">Smart Match Engine</p>
              </div>
            </div>
          </div>

          {/* Hero visual card demo */}
          <div className="relative">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-xs font-mono text-indigo-400">Live AI Assistant</span>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-xs space-y-2">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Customer Request Input:</span>
                <p className="text-slate-200 italic">"My kitchen tap is leaking continuously and water is coming under the sink."</p>
              </div>

              <div className="bg-indigo-950/60 p-4 rounded-2xl border border-indigo-500/30 text-xs space-y-3">
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
                <span className="text-indigo-400 font-semibold cursor-pointer">Instant Quotes Ready &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Top Services</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Popular Home Service Categories
            </h2>
          </div>
          <Link
            to="/services"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View all categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <ServiceCategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      </section>

      {/* How CareConnect Works Section */}
      <section className="bg-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Simple 4-Step Process</span>
            <h2 className="text-3xl font-extrabold font-display">How CareConnect Works</h2>
            <p className="text-slate-300 text-sm">
              From request creation to final job confirmation, everything is automated, transparent, and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                1
              </div>
              <h3 className="font-bold text-white text-base">Create Request</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Describe your issue in plain words. AI classifies the category, required skills, and urgency level.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                2
              </div>
              <h3 className="font-bold text-white text-base">Compare Quotes</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receive quotes from AI-recommended providers. Compare prices, timelines, and ratings.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                3
              </div>
              <h3 className="font-bold text-white text-base">Track Service</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track status updates live (Accepted, On the Way, In Progress). Provider uploads before/after photos.
              </p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
                4
              </div>
              <h3 className="font-bold text-white text-base">Confirm & Review</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Verify completed work, finalize invoice payment, and submit your rating and review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Providers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Top Rated Professionals</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Featured Verified Providers
            </h2>
          </div>
          <Link to="/providers" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View all providers <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((p) => (
            <ProviderCard key={p._id} provider={p} />
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-700 rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">Need Quick Home Maintenance Today?</h2>
            <p className="text-indigo-100 text-sm max-w-xl">
              Join thousands of satisfied homeowners. Create a request now and let our AI engine match you with the best nearby professional.
            </p>
          </div>
          <Link
            to="/dashboard/customer/requests/new"
            className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-all text-sm shrink-0"
          >
            Create Service Request Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
