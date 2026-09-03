import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <p className="font-medium text-slate-200 text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
      <span className="text-xs font-medium text-slate-500">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
