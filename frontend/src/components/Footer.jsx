import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950/85 text-slate-400 border-t border-indigo-900/50 text-xs backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center cc-float shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-display">
                Care<span className="cc-gradient-text">Connect</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-enabled marketplace connecting verified home service professionals with homeowners for reliable, transparent service.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="hover:text-white transition-colors">Plumbing Repair</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Electrical Services</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Home Deep Cleaning</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">AC & Appliance Repair</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/providers" className="hover:text-white transition-colors">Find Providers</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Become a Provider</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Support & Legal</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-white cursor-pointer">Help & FAQs</span></li>
              <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Dispute Resolution</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} CareConnect Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for AI-Enabled Home Operations
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
