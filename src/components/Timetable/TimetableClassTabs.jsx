export default function TimetableClassTabs({
  classes = [],
  selectedClassTab,
  totalCount = 0,
  classTabCounts = {},
  onClassTabChange,
}) {
  const getClassName = (name) => {
    if (!name) return "Class";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getTabClass = (isSelected) =>
    `flex shrink-0 flex-col items-start gap-1 rounded-xl border px-3 py-2 transition ${
      isSelected
        ? "border-[var(--primary)] bg-[var(--primary)] text-white"
        : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50"
    }`;

  const getCountClass = (isSelected) =>
    `rounded-full px-2 py-0.5 text-[10px] ${
      isSelected
        ? "bg-white/20 text-white"
        : "bg-slate-100 text-slate-600"
    }`;

  const tabs = [
    { id: "all", name: "All Classes", count: totalCount },
    ...classes.map((item) => ({
      id: String(item.id),
      name: getClassName(item.name),
      count: classTabCounts[String(item.id)] || 0,
    })),
  ];

  return (
    <div className="rounded-xl border border-[var(--gray)] bg-white p-3 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-800">
          Timetable by Class
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Select a class to view its periods and schedule.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isSelected = selectedClassTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onClassTabChange(tab.id)}
              className={`${getTabClass(isSelected)} min-w-[90px]`}
            >
              <span className="text-xs font-semibold">{tab.name}</span>

              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">{tab.count}</span>
                <span className="text-[10px] font-medium">periods</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}