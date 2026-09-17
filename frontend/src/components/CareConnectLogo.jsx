import React from 'react';

/**
 * CareConnect SVG Logo Component
 * Combines: house silhouette + infinity/connection loop + heart spark
 * Colors: indigo → cyan gradient (matching app theme)
 */
const CareConnectLogo = ({ size = 40, showText = false, textSize = 'text-xl' }) => {
  const id = `cclogo_${size}`;
  return (
    <div className="flex items-center gap-2.5">
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CareConnect Logo"
      >
        <defs>
          <linearGradient id={`grad1_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id={`grad2_${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <filter id={`glow_${id}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Rounded background */}
        <rect width="100" height="100" rx="22" fill={`url(#grad1_${id})`} />

        {/* House roof lines */}
        <polyline
          points="18,50 50,18 82,50"
          stroke="white"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.95"
        />
        {/* Chimney */}
        <rect x="62" y="24" width="7" height="13" rx="2" fill="white" opacity="0.9" />

        {/* Left loop of infinity/CC */}
        <path
          d="M 28,67 C 28,57 42,57 50,67 C 58,77 72,77 72,67 C 72,57 58,57 50,67 C 42,77 28,77 28,67 Z"
          fill="none"
          stroke="white"
          strokeWidth="5.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Heart at center of infinity */}
        <path
          d="M50,64 C50,64 44,59 44,55.5 C44,52.5 47,51 50,54 C53,51 56,52.5 56,55.5 C56,59 50,64 50,64 Z"
          fill="white"
          opacity="0.95"
          filter={`url(#glow_${id})`}
        />
      </svg>

      {showText && (
        <span className={`font-bold font-display tracking-tight ${textSize} bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 bg-clip-text text-transparent`}>
          Care<span className="text-cyan-500">Connect</span>
        </span>
      )}
    </div>
  );
};

export default CareConnectLogo;
