
export const CardShell = ({
  title,
  Icon,
  iconClass,
  children,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6">
    <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
      <Icon size={16} className={iconClass} />
      <span className="truncate">{title}</span>
    </h3>

    {children}
  </div>
);

export const ChartBody = ({ heightClass, children }) => (
  <div className={heightClass}>
    <div className="w-full h-full" style={{ minWidth: 0 }}>
      {children}
    </div>
  </div>
);
