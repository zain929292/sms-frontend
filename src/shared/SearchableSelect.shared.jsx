/**
 * @file SearchableSelect.shared.jsx
 * @module Shared/SearchableSelect
 * @description Searchable dropdown with icon, filtered list, and outside-click close.
 * Supports an optional `itemRenderer` prop — falls back to a sensible default.
 */

import { memo, useRef, useEffect, useMemo, useCallback } from "react";
import { AlertCircle } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                          Default item renderer                             */
/* -------------------------------------------------------------------------- */

const DEFAULT_AVATAR_CLASS = "bg-teal-50 text-[#00A3AD]";

/**
 * Default rendering used when the caller doesn't provide `itemRenderer`.
 * Works for patients, doctors, lab tests, suppliers, users, etc.
 */
const defaultItemRenderer = (item, avatarClass = DEFAULT_AVATAR_CLASS) => {
  const name =
    item?.name ||
    item?.full_name ||
    item?.test_name ||
    item?.company_name ||
    item?.title ||
    `#${item?.id ?? item?._id ?? ""}`;

  const subtitle =
    item?.specialization ||
    item?.company ||
    item?.category ||
    item?.cnic ||
    item?.phone ||
    item?.email ||
    item?.role ||
    "";

  const initial = String(name).trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <div className="flex items-center gap-2.5">
        <div
          className={`w-7 h-7 rounded-full ${avatarClass} flex items-center justify-center font-bold text-xs`}
        >
          {initial}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">{name}</p>
          {subtitle && <p className="text-[10px] text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {item?.id != null && (
        <span className="text-[11px] text-slate-400 font-medium">
          ID: {item.id}
        </span>
      )}
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                          SearchableSelect                                  */
/* -------------------------------------------------------------------------- */

const SearchableSelect = ({
  label,
  icon: Icon,
  iconClass = "text-slate-400",
  placeholder,
  searchTerm,
  onSearchChange,
  items = [],
  itemRenderer,
  onSelect,
  isOpen,
  onOpenChange,
  filterFn,
  error,
  avatarClass = DEFAULT_AVATAR_CLASS,
  emptyMessage = "No results found.",
}) => {
  const dropdownRef = useRef(null);

  /* ------------------------ Outside-click to close ----------------------- */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onOpenChange]);

  /* ------------------------------ Filtered ------------------------------- */
  const filtered = useMemo(
    () => (filterFn ? items.filter((it) => filterFn(it, searchTerm)) : items),
    [items, searchTerm, filterFn],
  );

  /* ------------------------------ Handlers ------------------------------- */
  const handleInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      onSearchChange(value);
      onOpenChange(true);
    },
    [onSearchChange, onOpenChange],
  );

  /* ------------------------ Choose renderer safely ----------------------- */
  const renderer =
    typeof itemRenderer === "function" ? itemRenderer : defaultItemRenderer;

  /* -------------------------------- Render ------------------------------- */
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          {label} <span className="text-rose-500">*</span>
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          {Icon && (
            <Icon
              size={18}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${iconClass}`}
            />
          )}
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => onOpenChange(true)}
            className={`w-full rounded-xl border ${
              error ? "border-rose-500" : "border-slate-200"
            } bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-[#034A52] focus:ring-2 focus:ring-[#034A52]/20`}
          />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item?.id ?? item?._id ?? item?.value}
                  onClick={() => onSelect(item)}
                  className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  {renderer(item, avatarClass)}
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

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

export default memo(SearchableSelect);
