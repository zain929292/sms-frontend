import { memo, useRef, useEffect, useCallback } from "react";
import { Search, X, Calendar, FileSpreadsheet } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                             Default styles                                 */
/* -------------------------------------------------------------------------- */

const INPUT_CLASS =
  "w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A3AD] focus:ring-1 focus:ring-[#00A3AD]/20 transition-all text-slate-700";

const DATE_INPUT_CLASS =
  "w-full sm:w-auto pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00A3AD] focus:ring-1 focus:ring-[#00A3AD]/20 text-slate-700";

const LABEL_CLASS =
  "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1";

/* -------------------------------------------------------------------------- */
/*                              Search Input                                  */
/* -------------------------------------------------------------------------- */

const SearchInput = memo(
  ({
    label,
    value,
    onChange,
    onFocus,
    onClear,
    placeholder,
    className = "",
  }) => (
    <div className={`relative ${className}`}>
      {label && <label className={LABEL_CLASS}>{label}</label>}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          className={INPUT_CLASS}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  ),
);
SearchInput.displayName = "SearchInput";

/* -------------------------------------------------------------------------- */
/*                             Date Range Inputs                              */
/* -------------------------------------------------------------------------- */

const DateRangeInput = memo(
  ({
    label = "Date Range",
    startValue,
    endValue,
    onStartChange,
    onEndChange,
  }) => (
    <div>
      {label && <label className={LABEL_CLASS}>{label}</label>}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          <Calendar
            size={15}
            className="absolute left-3 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            value={startValue}
            onChange={onStartChange}
            className={DATE_INPUT_CLASS}
          />
        </div>
        <span className="text-xs text-slate-400 font-medium px-0.5">to</span>
        <div className="relative flex items-center">
          <Calendar
            size={15}
            className="absolute left-3 text-slate-400 pointer-events-none"
          />
          <input
            type="date"
            value={endValue}
            onChange={onEndChange}
            className={DATE_INPUT_CLASS}
          />
        </div>
      </div>
    </div>
  ),
);
DateRangeInput.displayName = "DateRangeInput";

/* -------------------------------------------------------------------------- */
/*                            Export Button                                   */
/* -------------------------------------------------------------------------- */

const ExportButton = memo(
  ({ onClick, count = 0, label = "Export", showCount = false }) => {
    const disabled = count === 0;
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all shadow-sm ${
          disabled
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
        }`}
        title={disabled ? "No data to export" : label}
      >
        <FileSpreadsheet size={16} />
        {label}
        {showCount && !disabled && (
          <span className="text-[10px] font-normal opacity-70">({count})</span>
        )}
      </button>
    );
  },
);
ExportButton.displayName = "ExportButton";

/* -------------------------------------------------------------------------- */
/*                           Picker Dropdown                                  */
/* -------------------------------------------------------------------------- */

const PickerDropdown = memo(
  ({
    label,
    searchTerm,
    onSearchChange,
    onClearSearch,
    placeholder,
    isOpen,
    setIsOpen,
    items,
    onSelectItem,
    itemRenderer,
    emptyMessage = "No results found.",
    widthClass = "lg:w-96",
  }) => {
    const containerRef = useRef(null);

    useEffect(() => {
      const handler = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
      }
    }, [isOpen, setIsOpen]);

    const defaultRenderer = useCallback(
      (item) => (
        <>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-teal-50 text-[#00A3AD] flex items-center justify-center font-bold text-xs">
              {item.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{item.name}</p>
              {item.subtitle && (
                <p className="text-[10px] text-slate-500 font-mono">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
          {item.meta && (
            <span className="text-[11px] text-slate-400 font-medium">
              {item.meta}
            </span>
          )}
        </>
      ),
      [],
    );

    const renderItem = itemRenderer || defaultRenderer;

    return (
      <div className={`relative w-full ${widthClass}`} ref={containerRef}>
        {label && <label className={LABEL_CLASS}>{label}</label>}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsOpen(true)}
            onChange={onSearchChange}
            placeholder={placeholder}
            className={INPUT_CLASS}
          />
          {searchTerm && onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  {renderItem(item)}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                {emptyMessage}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
PickerDropdown.displayName = "PickerDropdown";

/* -------------------------------------------------------------------------- */
/*                            Main FilterBar                                  */
/* -------------------------------------------------------------------------- */

const FilterBar = memo(
  ({
    // Picker (optional — usually only one per bar)
    picker,

    // Search inputs (array)
    searches = [],

    // Date range (optional)
    dateRange,

    // Custom slots
    customFilters, // JSX or array of JSX
    customActions, // JSX or array of JSX (right side, before export)

    // Export
    exportConfig, // { onClick, count, label, showCount }

    // Clear all
    hasFilters = false,
    onClearAll,

    // Layout
    layout = "default", // "default" | "stacked" | "compact"
    className = "",
  }) => {
    const layoutClass =
      {
        default:
          "flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between",
        stacked: "flex flex-col gap-4",
        compact: "flex flex-wrap gap-3 items-end",
      }[layout] || "";

    return (
      <div
        className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm ${layoutClass} ${className}`}
      >
        {/* Left: picker + searches + date range + custom */}
        <div className="flex flex-wrap gap-3 items-end w-full lg:w-auto flex-1">
          {picker && <PickerDropdown {...picker} />}

          {searches.map((s, idx) => (
            <SearchInput
              key={s.key ?? idx}
              {...s}
              className="flex-1 min-w-[200px]"
            />
          ))}

          {dateRange && <DateRangeInput {...dateRange} />}

          {customFilters && (
            <div className="flex flex-wrap gap-3 items-end">
              {Array.isArray(customFilters) ? customFilters : customFilters}
            </div>
          )}
        </div>

        {/* Right: custom actions + export + clear */}
        <div className="flex flex-wrap items-end gap-2 w-full lg:w-auto">
          {customActions}

          {exportConfig && <ExportButton {...exportConfig} />}

          {hasFilters && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-2 transition-all shrink-0 mb-0.5"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    );
  },
);

FilterBar.displayName = "FilterBar";

export { FilterBar, SearchInput, DateRangeInput, PickerDropdown, ExportButton };
export default FilterBar;
