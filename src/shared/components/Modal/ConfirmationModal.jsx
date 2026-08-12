import React from 'react';
import { AlertTriangle, HelpCircle, Info, X } from 'lucide-react';
import Button from '../Button/Button';

/**
 * Reusable modal for confirming destructive or critical actions (e.g. deletion).
 * Employs a premium design with animated blur backdrops and icon badges.
 */
export default function ConfirmationModal({
  show,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
}) {
  if (!show) return null;

  let Icon = HelpCircle;
  let iconColorClass = 'text-appSecondary bg-appSecondary/10 border-appSecondary/25';
  let confirmVariant = 'primary';

  if (type === 'danger') {
    Icon = AlertTriangle;
    iconColorClass = 'text-red-400 bg-red-950/20 border-red-500/20';
    confirmVariant = 'danger';
  } else if (type === 'info') {
    Icon = Info;
    iconColorClass = 'text-blue-400 bg-blue-950/20 border-blue-500/20';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-appCard border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 text-appTextGray hover:text-appTextLight rounded-lg transition-all cursor-pointer"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="px-6 pb-6 text-center flex flex-col items-center">
          {/* Icon Badge */}
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-lg ${iconColorClass}`}>
            <Icon className="w-7 h-7 animate-pulse" />
          </div>

          <h3 className="text-lg font-extrabold text-appTextLight mb-2">{title}</h3>
          <p className="text-xs text-appTextGray font-semibold px-4 leading-relaxed">{message}</p>

          {/* Action buttons */}
          <div className="flex gap-3 w-full mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
