
import { memo } from "react";
import { Search, Calendar, X } from "lucide-react";

const searchInputClass =
  "w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all";

const dateInputClass =
  "w-full sm:w-auto pl-10 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all";

const TableFilters = memo(({
  searchValue = "",
  onSearch,
  searchPlaceholder = "Search...",

  enableMultiFilters = false,
  nameSearchValue = "",
  onNameSearchChange,
  nameSearchPlaceholder = "Search by name...",

  startDateValue = "",
  onStartDateChange,
  endDateValue = "",
  onEndDateChange,
  onClearFilters,
  filterControls,
}) => {
  const hasActiveFilters =
    Boolean(nameSearchValue) ||
    Boolean(startDateValue) ||
    Boolean(endDateValue);

  if (!onSearch && !enableMultiFilters && !filterControls) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 mb-5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

        {onSearch && !enableMultiFilters && (
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={searchInputClass}
            />
          </div>
        )}

        {enableMultiFilters && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1">

            {onNameSearchChange && (
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={nameSearchValue}
                  onChange={(e) =>
                    onNameSearchChange(e.target.value)
                  }
                  placeholder={nameSearchPlaceholder}
                  className={searchInputClass}
                />
              </div>
            )}

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">

              {onStartDateChange && (
                <div className="relative flex-1 sm:flex-initial">
                  <Calendar
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={startDateValue}
                    onChange={(e) =>
                      onStartDateChange(e.target.value)
                    }
                    title="Start Date"
                    className={dateInputClass}
                  />
                </div>
              )}

              {onStartDateChange && onEndDateChange && (
                <span className="text-slate-400 text-xs font-medium hidden sm:inline">
                  to
                </span>
              )}

              {onEndDateChange && (
                <div className="relative flex-1 sm:flex-initial">
                  <Calendar
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={endDateValue}
                    onChange={(e) =>
                      onEndDateChange(e.target.value)
                    }
                    title="End Date"
                    className={dateInputClass}
                  />
                </div>
              )}

              {hasActiveFilters && onClearFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
                  title="Clear filters"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {filterControls && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {filterControls}
          </div>
        )}
      </div>
    </div>
  );
});

TableFilters.displayName = "TableFilters";

export default TableFilters;
