import React from 'react';

export default function GridLoadChart() {
  return (
    <div className="bg-appCard border border-white/5 rounded-2xl p-6 lg:col-span-2 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-md font-bold">Grid Load Activity Analytics</h2>
            <p className="text-xs text-appTextGray">Realtime power consumption graph across the charging network</p>
          </div>
          <span className="text-[10px] font-bold text-appSecondary bg-appSecondary/10 px-2 py-0.5 border border-appSecondary/15 rounded">Realtime</span>
        </div>

        {/* Animated CSS SVG Line chart graph */}
        <div className="h-44 w-full relative mt-6 flex items-end">
          <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38C9AD" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38C9AD" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Fill Area */}
            <path
              d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 T500,45 L500,100 L0,100 Z"
              fill="url(#neonGlow)"
            />
            {/* Line path */}
            <path
              d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 T500,45"
              fill="none"
              stroke="#38C9AD"
              strokeWidth="2.5"
              className="dash-animate"
            />
          </svg>
          
          {/* Grid lines layout */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
            <div className="border-b border-white w-full" />
            <div className="border-b border-white w-full" />
            <div className="border-b border-white w-full" />
            <div className="border-b border-white w-full" />
          </div>
        </div>
      </div>

      {/* Time scales */}
      <div className="flex justify-between text-[10px] text-appTextGray mt-4 pt-4 border-t border-white/5">
        <span>08:00 AM</span>
        <span>12:00 PM</span>
        <span>04:00 PM</span>
        <span>08:00 PM</span>
        <span>12:00 AM</span>
      </div>
    </div>
  );
}
