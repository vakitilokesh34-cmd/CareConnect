import React from 'react';
import { Award, Star, CheckCircle2 } from 'lucide-react';

const OpsQuality = () => {
  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Service Quality & Analytics</h1>
        <p className="text-slate-500 mt-1">Platform service scorecards and quality metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="cc-card p-5 rounded-2xl space-y-2">
          <span className="font-semibold text-slate-500">Overall Customer Satisfaction</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">4.85 / 5.0</div>
        </div>

        <div className="cc-card p-5 rounded-2xl space-y-2">
          <span className="font-semibold text-slate-500">On-Time Arrival Rate</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">97.4%</div>
        </div>

        <div className="cc-card p-5 rounded-2xl space-y-2">
          <span className="font-semibold text-slate-500">Dispute Escalation Rate</span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">1.2%</div>
        </div>
      </div>
    </div>
  );
};

export default OpsQuality;
