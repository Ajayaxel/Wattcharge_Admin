import React from 'react';

/**
 * Reusable Input component supporting standard input types and textareas.
 * Integrates optional icons and floating visual layouts.
 */
export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  icon: Icon,
  className = '',
  rows,
  step,
}) {
  const isTextarea = type === 'textarea';
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold text-appTextGray uppercase mb-1.5">
          {label} {required && '*'}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-appTextGray" />
          </span>
        )}
        {isTextarea ? (
          <textarea
            placeholder={placeholder}
            required={required}
            rows={rows || 2}
            value={value}
            onChange={onChange}
            className="w-full px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-appTextLight focus:outline-none focus:border-appSecondary resize-none"
          />
        ) : (
          <input
            type={type}
            step={step}
            placeholder={placeholder}
            required={required}
            value={value}
            onChange={onChange}
            className={`w-full py-2.5 bg-black border border-white/10 rounded-xl text-xs text-appTextLight focus:outline-none focus:border-appSecondary focus:ring-1 focus:ring-appSecondary transition-all ${Icon ? 'pl-10 pr-4' : 'px-3.5'}`}
          />
        )}
      </div>
    </div>
  );
}
