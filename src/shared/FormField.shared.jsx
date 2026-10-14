/**
 * @file FormField.shared.jsx
 * @module Shared/FormField
 * @description Reusable form field with icon, label, error, required marker, and optional dropdown support.
 */

import { AlertCircle } from "lucide-react";

const BASE_CONTROL =
  "w-full rounded-xl border bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-[#034A52] focus:ring-4 focus:ring-[#034A52]/10 disabled:opacity-50";

const FormField = ({
  label,
  hint,
  icon: Icon,
  name,
  type = "text",
  value,
  onChange,
  error,
  disabled,
  placeholder,
  required,
  min,
  max,
  step,
  options, // Array of strings or objects for dropdowns
}) => {
  const borderClass = error
    ? "border-rose-500 bg-rose-50/30"
    : "border-slate-200";

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
        {label}{" "}
        {required ? (
          <span className="text-rose-500">*</span>
        ) : hint ? (
          <span className="text-slate-400">({hint})</span>
        ) : null}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        )}

        {options ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${BASE_CONTROL} ${borderClass} appearance-none bg-white cursor-pointer`}
          >
            <option value="">Select {label}</option>
            {options.map((opt, index) => {
              // Handle both array of primitive strings/numbers or objects { id, label, value }
              const optValue =
                typeof opt === "object" ? (opt.value ?? opt.id) : opt;
              const optLabel =
                typeof opt === "object" ? (opt.label ?? opt.name) : opt;
              const optKey =
                typeof opt === "object" ? (opt.id ?? opt.value ?? index) : opt;

              return (
                <option key={optKey} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`${BASE_CONTROL} ${borderClass}`}
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
