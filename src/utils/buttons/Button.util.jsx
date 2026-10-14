/**
 * @file Button.util.jsx
 * @module Components/Button
 * @description Modern SaaS action button with interactive states and smooth loading transitions.
 */

import { memo } from "react";
import Loader from "../loader/Loader.util.jsx";

const VARIANTS = {
  "btn-primary":
    "bg-teal-700 hover:bg-teal-800 text-white shadow-xs hover:shadow-md hover:shadow-teal-900/10 active:bg-teal-900 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
  "btn-secondary":
    "bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-md active:bg-slate-950 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
  "btn-danger":
    "bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md hover:shadow-rose-900/10 active:bg-rose-800 focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2",
  "btn-outline":
    "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
  "btn-ghost":
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5 min-h-[34px]",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2 min-h-[42px]",
  lg: "px-6 py-3.5 text-base rounded-xl gap-2.5 min-h-[50px]",
};

const BASE_CLASSES =
  "relative inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 ease-in-out select-none cursor-pointer active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100";

const Button = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  style,
  textStyle,
  width,
  height,
  size = "md",
  variant = "btn-primary",
  icon,
  className = "",
  type = "submit",
}) => {
  const classes = `${BASE_CLASSES} ${SIZES[size] || SIZES.md} ${
    VARIANTS[variant] || VARIANTS["btn-primary"]
  } ${className}`;

  return (
    <button
      type={type}
      onClick={onPress}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      style={{
        width: width || undefined,
        height: height || undefined,
        ...style,
      }}
      className={classes}
    >
      {loading ? (
        <Loader loading size={18} color="currentColor" />
      ) : (
        <>
          {icon && (
            <span className="inline-flex shrink-0 items-center justify-center text-current">
              {icon}
            </span>
          )}
          {title && <span style={textStyle}>{title}</span>}
        </>
      )}
    </button>
  );
};

export default memo(Button);
