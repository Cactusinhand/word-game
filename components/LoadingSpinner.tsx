
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
    <div className="w-16 h-16 border-4 border-emerald-500 border-dashed rounded-full animate-spin"></div>
    <p className="text-lg">Designing your game manual...</p>
  </div>
);

export default LoadingSpinner;
