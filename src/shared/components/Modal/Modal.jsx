import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable modal component backdrop.
 * Animates scale/opacity, handles close event triggers.
 */
export default function Modal({
  show,
  onClose,
  title,
  icon: Icon,
  children,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-appCard border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-appSecondary" />}
            <h3 className="font-extrabold text-appTextLight">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 text-appTextGray hover:text-appTextLight rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
