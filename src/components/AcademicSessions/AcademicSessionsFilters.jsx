import { CalendarDays } from "lucide-react";
import FilterBar from "../../utils/filter/FilterBar.util";

const AcademicSessionsFilters = ({
  searchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  filteredSessions,
  selectedSessionId,
  onSearchChange,
  onClearSearch,
  onSelectSession,
  onClearAll,
}) => {
  const filterConfig = {
    picker: {
      label: "Quick Session Lookup",
      searchTerm,
      onSearchChange,
      onClearSearch,
      placeholder: "Search by session name, ID or status...",
      isOpen: isDropdownOpen,
      setIsOpen: setIsDropdownOpen,
      items: filteredSessions,
      onSelectItem: onSelectSession,
      emptyMessage: "No matching academic sessions found.",
      itemRenderer: (session) => (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <CalendarDays size={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {session.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {session.start_date || "No start date"} – {session.end_date || "No end date"}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs text-slate-400">ID: {session.id}</span>
        </>
      ),
    },
    hasFilters: Boolean(searchTerm) || Boolean(selectedSessionId),
    onClearAll,
  };

  return <FilterBar {...filterConfig} />;
};

export default AcademicSessionsFilters;
