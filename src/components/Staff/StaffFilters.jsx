
import { Users } from "lucide-react";
import FilterBar from "../../utils/filter/FilterBar.util";

const StaffFilters = ({
  searchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  matches,
  onSearchChange,
  onClearSearch,
  onSelectStaff,
  onClearAll,
  hasFilters,
}) => {
  const filterConfig = {
    picker: {
      label: "Quick Staff Lookup",

      // Search input must always receive a string.
      searchTerm: typeof searchTerm === "string" ? searchTerm : "",

      onSearchChange,
      onClearSearch,

      placeholder: "Search staff, phone, qualification or ID...",

      isOpen: isDropdownOpen,
      setIsOpen: setIsDropdownOpen,

      items: Array.isArray(matches) ? matches : [],

      // Selected item is a staff object.
      onSelectItem: (item) => {
        if (item && typeof item === "object") {
          onSelectStaff?.(item);
        }
      },

      emptyMessage: "No matching staff found.",

      itemRenderer: (item) => (
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <Users size={14} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {item.user?.name ?? item.name ?? "Unnamed Staff"}
              </p>

              <p className="truncate text-[11px] text-slate-500">
                {item.phone || item.qualification || "Staff member"}
              </p>
            </div>
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

export default StaffFilters;
