
import { useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

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
  options,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const borderClass = error
    ? "border-rose-500 bg-rose-50/30"
    : "border-slate-200";

  const inputType =
    isPassword && showPassword ? "text" : type;

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
              const optValue =
                typeof opt === "object"
                  ? opt.value ?? opt.id
                  : opt;

              const optLabel =
                typeof opt === "object"
                  ? opt.label ?? opt.name
                  : opt;

              const optKey =
                typeof opt === "object"
                  ? opt.id ?? opt.value ?? index
                  : opt;

              return (
                <option key={optKey} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : (
          <>
            <input
              type={inputType}
              name={name}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              className={`${BASE_CONTROL} ${borderClass} ${
                isPassword ? "pr-11" : ""
              }`}
            />

            {isPassword && (
              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                disabled={disabled}
                tabIndex={-1}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#034A52] transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            )}
          </>
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
