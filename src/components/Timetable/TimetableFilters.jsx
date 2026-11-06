import { Search, RotateCcw } from "lucide-react";
import FilterBar from "../../utils/filter/FilterBar.util";

const TimetableFilters = ({
  searchTerm,
  onSearchChange,
  onClear,
  hasFilters,
}) => {
  const filterConfig = {
    searches: [
      {
        key: "timetable",
        value: searchTerm,
        onChange: (e) => onSearchChange(e.target.value),
        placeholder: "Search teacher or subject name...",
        icon: <Search size={16} />,
      },
    ],
    customFilters: [
      ...(hasFilters
        ? [
            <button
              key="clear"
              type="button"
              onClick={onClear}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw size={14} />
              Reset
            </button>,
          ]
        : []),
    ],
    hasFilters,
    layout: "compact",
  };

  return <FilterBar {...filterConfig} />;
};

export default TimetableFilters;