
import { memo } from "react";

/* -------------------------------------------------------------------------- */
/*                                  Presets                                   */
/* -------------------------------------------------------------------------- */

const SIZE_PRESETS = {
  sm: {
    padding: "p-4",
    title: "text-[10px]",
    value: "text-2xl",
    iconBox: "w-10 h-10",
    iconSize: 20,
  },
  md: {
    padding: "p-5",
    title: "text-xs",
    value: "text-3xl",
    iconBox: "w-12 h-12",
    iconSize: 24,
  },
  lg: {
    padding: "p-6",
    title: "text-sm",
    value: "text-4xl",
    iconBox: "w-14 h-14",
    iconSize: 28,
  },
};

const COLOR_PRESETS = {
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    valueClass: "text-slate-900",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    valueClass: "text-emerald-600",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    valueClass: "text-amber-600",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    valueClass: "text-rose-600",
  },
  teal: {
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    valueClass: "text-teal-600",
  },
  slate: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    valueClass: "text-slate-900",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    valueClass: "text-violet-600",
  },
};

/* -------------------------------------------------------------------------- */
/*                              Progress Bar                                  */
/* -------------------------------------------------------------------------- */

const ProgressBar = memo(({ value, color = "bg-emerald-500" }) => {
  if (value == null || value <= 0) return null;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
});
ProgressBar.displayName = "ProgressBar";

/* -------------------------------------------------------------------------- */
/*                              Stat Card                                     */
/* -------------------------------------------------------------------------- */

const StatCard = memo(
  ({
    // Content
    title,
    value,
    subtitle,
    icon: Icon,

    // Sizing & Color
    size = "md",
    color = "blue",
    valueClass: valueClassProp,
    iconBg: iconBgProp,
    iconColor: iconColorProp,

    // Progress
    progressPct,
    progressColor = "bg-emerald-500",

    // Extras
    trailing,
    filterTag, // JSX to render next to title
    className = "",

    // Interaction
    onClick,

    // States
    loading = false,
  }) => {
    const sizeStyles = SIZE_PRESETS[size] || SIZE_PRESETS.md;
    const colorStyles = COLOR_PRESETS[color] || COLOR_PRESETS.blue;

    const iconBg = iconBgProp ?? colorStyles.iconBg;
    const iconColor = iconColorProp ?? colorStyles.iconColor;
    const valueClass = valueClassProp ?? colorStyles.valueClass;

    const CardWrapper = onClick ? "button" : "div";
    const wrapperProps = onClick
      ? {
          type: "button",
          onClick,
          className: `text-left w-full ${className} bg-white rounded-2xl border border-slate-200/80 shadow-sm ${sizeStyles.padding} hover:shadow-md hover:border-slate-300 transition-all cursor-pointer`,
        }
      : {
          className: `${className} bg-white rounded-2xl border border-slate-200/80 shadow-sm ${sizeStyles.padding} hover:shadow-md transition-all`,
        };

    /* -------------------------- Loading skeleton ------------------------- */
    if (loading) {
      return (
        <div
          className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${sizeStyles.padding} animate-pulse`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-24" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
            <div className={`${sizeStyles.iconBox} rounded-xl bg-slate-200`} />
          </div>
        </div>
      );
    }

    /* ------------------------------ Render ------------------------------- */
    return (
      <CardWrapper {...wrapperProps}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p
              className={`${sizeStyles.title} font-semibold text-slate-500 uppercase tracking-wider truncate`}
            >
              {title}
              {filterTag}
            </p>

            {/* Value: string/number OR custom JSX */}
            {typeof value === "object" && value !== null ? (
              <div className="mt-2">{value}</div>
            ) : (
              <p className={`${sizeStyles.value} font-bold mt-2 ${valueClass}`}>
                {value}
              </p>
            )}
          </div>

          {Icon && (
            <div
              className={`${sizeStyles.iconBox} rounded-xl ${iconBg} flex items-center justify-center shrink-0 ml-3`}
            >
              <Icon size={sizeStyles.iconSize} className={iconColor} />
            </div>
          )}
        </div>

        {(subtitle || progressPct != null || trailing) && (
          <div className="mt-3 flex items-center gap-2">
            {subtitle && (
              <span className="text-xs text-slate-500 truncate">
                {subtitle}
              </span>
            )}
            <ProgressBar value={progressPct} color={progressColor} />
            {trailing}
          </div>
        )}
      </CardWrapper>
    );
  },
);

StatCard.displayName = "StatCard";

export default StatCard;
