import React from 'react';
import { CheckCircle2, Clock, MapPin, Wrench, FileCheck2, AlertCircle } from 'lucide-react';

const BookingStatusTimeline = ({ currentStatus }) => {
  const steps = [
    { key: 'CONFIRMED', label: 'Booked', icon: Clock },
    { key: 'ACCEPTED', label: 'Accepted', icon: CheckCircle2 },
    { key: 'ON_THE_WAY', label: 'On The Way', icon: MapPin },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
    { key: 'COMPLETED', label: 'Job Finished', icon: FileCheck2 },
    { key: 'CUSTOMER_CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  ];

  const statusOrder = ['PENDING', 'CONFIRMED', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CUSTOMER_CONFIRMED'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center text-rose-800 text-xs font-semibold flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-600" />
        This booking was cancelled.
      </div>
    );
  }

  if (currentStatus === 'DISPUTED') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center text-amber-800 text-xs font-semibold flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        This booking is under dispute review by support.
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background Connector Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length)) * 100))}%`,
          }}
        ></div>

        {steps.map((step, idx) => {
          const stepIndex = statusOrder.indexOf(step.key);
          const isPassed = currentIndex >= stepIndex && currentIndex !== -1;
          const isCurrent = currentStatus === step.key;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110 shadow-lg'
                    : isPassed
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-[11px] font-semibold text-center whitespace-nowrap ${
                  isCurrent
                    ? 'text-indigo-700 font-bold'
                    : isPassed
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStatusTimeline;
