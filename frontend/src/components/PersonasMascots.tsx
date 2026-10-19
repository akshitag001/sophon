import React from 'react';

export const SvgPriya: React.FC<{ className?: string }> = ({ className = "w-10 h-10 mx-auto mb-2" }) => (
  <div className={`${className} rounded-full bg-white text-black font-bold text-sm select-none shadow-sm flex items-center justify-center`}>
    P
  </div>
);

export const SvgChen: React.FC<{ className?: string }> = ({ className = "w-10 h-10 mx-auto mb-2" }) => (
  <div className={`${className} rounded-full bg-zinc-900 border border-zinc-700 text-white font-semibold text-sm select-none shadow-sm flex items-center justify-center`}>
    C
  </div>
);

export const SvgAgent: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <div className={`${className} rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs shadow-sm select-none`}>
    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  </div>
);
