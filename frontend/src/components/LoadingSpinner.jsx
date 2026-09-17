import React from 'react';

const LoadingSpinner = ({ fullScreen = false, message = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-12 h-12">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-cyan-400 animate-spin"
            style={{ animationDelay: `${i * 0.35}s`, animationDuration: '1.4s' }}
          />
        ))}
        <span className="absolute inset-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 opacity-25 blur-md animate-pulse" />
        <span className="absolute inset-3 rounded-full bg-slate-950" />
      </div>
      <span className="mt-4 text-xs font-semibold text-slate-200 tracking-wide">{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white cc-perspective">
        {content}
      </div>
    );
  }

  return <div className="flex flex-col items-center justify-center p-8">{content}</div>;
};

export default LoadingSpinner;