import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800">
      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium">
        <p>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
