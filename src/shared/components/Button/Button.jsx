import React from 'react';

/**
 * Reusable Button component matching the UI design guidelines.
 * Supports primary, secondary, danger, and icon-based variants.
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
}) {
  const baseStyle = "font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50";
  
  const variants = {
    primary: "bg-appSecondary hover:bg-appSecondary/90 text-black shadow-lg shadow-appSecondary/20 py-3 w-full",
    secondary: "bg-white/5 hover:bg-white/10 border border-white/10 text-appTextLight py-3 w-full",
    danger: "bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 py-2.5 w-full",
    ghost: "p-2 text-appTextGray hover:text-appTextLight rounded-full hover:bg-white/5 transition-all"
  };

  const selectedVariant = variants[variant] || '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${selectedVariant} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </button>
  );
}
