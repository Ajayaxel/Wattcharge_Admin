import React from 'react';

/**
 * Premium spinner loader loader component with spinning circular paths and optional text details.
 */
export default function Loader({ size = 'medium', message }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer glowing pulsing circle */}
        <div className="absolute inset-0 rounded-full border-2 border-appSecondary/20 animate-ping" />
        {/* Spinning indicator */}
        <div className="absolute inset-0 rounded-full border-t-2 border-appSecondary animate-spin" />
      </div>
      {message && <p className="text-xs text-appTextGray font-semibold animate-pulse">{message}</p>}
    </div>
  );
}
