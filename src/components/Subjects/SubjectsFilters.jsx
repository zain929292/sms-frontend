import { BookOpen } from "lucide-react";
import FilterBar from "../../utils/filter/FilterBar.util";

const SubjectsFilters = ({
  searchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  matches,
  onSearchChange,
  onClearSearch,
  onSelectSubject,
  onClearAll,
  hasFilters,
}) => {
  const filterConfig = {
    picker: {
      label: "Quick Subject Lookup",
      searchTerm,
      onSearchChange,
      onClearSearch,
      placeholder: "Search subject, type, ID or status...",
      isOpen: isDropdownOpen,
      setIsOpen: setIsDropdownOpen,
      items: matches,
      onSelectItem: onSelectSubject,
      emptyMessage: "No matching subjects found.",
      itemRenderer: (item) => (
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <BookOpen size={14} />
            </span>

            <span className="truncate text-xs font-semibold text-slate-800">
              {item.name}
            </span>
          </div>

          <span className="shrink-0 text-[11px] text-slate-400">
            #{item.id}
          </span>
        </div>
      ),
    },
    hasFilters,
    onClearAll,
  };

  return <FilterBar {...filterConfig} />;
};

export default SubjectsFilters;