
export default function EnrollmentClassTabs({
  classes = [],
  selectedClassTab,
  activeCount = 0,
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
    {
      id: "all",
      name: "All",
      count: activeCount,
    },
    ...classes
      .filter((classItem) => classItem.status === "active")
      .map((classItem) => ({
        id: String(classItem.id),
        name: getClassName(classItem.name),
        count: classTabCounts[String(classItem.id)] ?? 0,
      })),
  ];

  return (
    <div className="rounded-2xl border border-[var(--gray)] bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-800">
          Browse Students by Class
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Select a class to view its active enrollments.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isSelected = selectedClassTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onClassTabChange(tab.id)}
              className={`${getTabClass(isSelected)} min-w-[90px]`}
            >
              <span className="text-xs font-semibold">
                {tab.name}
              </span>

              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">
                  {tab.count}
                </span>

                <span className="text-[10px] font-medium">
                  students
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
