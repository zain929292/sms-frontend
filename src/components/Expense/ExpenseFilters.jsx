
import { Wallet, CalendarDays, FilterX } from "lucide-react";
import FilterBar from "../../utils/filter/FilterBar.util";

const ExpenseFilters = ({
  searchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  filteredExpenses,
  selectedExpenseId,
  onSearchChange,
  onClearSearch,
  onSelectExpense,

  category,
  status,
  paymentMethod,
  month,
  year,

  onCategoryChange,
  onStatusChange,
  onPaymentMethodChange,
  onMonthChange,
  onYearChange,
  onClearAll,
}) => {
  const filterConfig = {
    picker: {
      label: "Quick Expense Lookup",
      searchTerm,
      onSearchChange,
      onClearSearch,
      placeholder: "Search by expense title...",
      isOpen: isDropdownOpen,
      setIsOpen: setIsDropdownOpen,
      items: filteredExpenses,
      onSelectItem: onSelectExpense,
      emptyMessage: "No matching expenses found.",
      itemRenderer: (expense) => (
        <>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Wallet size={17} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {expense.title}
              </p>

              <p className="mt-0.5 text-xs capitalize text-slate-500">
                {expense.category || "Other"} · {expense.status || "Unknown"}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-semibold text-slate-700">
              Rs. {Number(expense.amount || 0).toLocaleString("en-PK")}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              ID: {expense.id}
            </p>
          </div>
        </>
      ),
    },

    hasFilters:
      Boolean(searchTerm) ||
      Boolean(selectedExpenseId) ||
      Boolean(category) ||
      Boolean(status) ||
      Boolean(paymentMethod) ||
      Boolean(month) ||
      Boolean(year),

    onClearAll,
  };

  const selectClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  return (
    <div className="space-y-3">
      <FilterBar {...filterConfig} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Categories</option>
          <option value="salary">Salary</option>
          <option value="electricity">Electricity</option>
          <option value="water">Water</option>
          <option value="internet">Internet</option>
          <option value="maintenance">Maintenance</option>
          <option value="stationery">Stationery</option>
          <option value="transport">Transport</option>
          <option value="rent">Rent</option>
          <option value="other">Other</option>
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Payment Methods</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cheque">Cheque</option>
          <option value="online">Online</option>
        </select>

        {/* Month and Year */}
        <div className="relative">
          <CalendarDays
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="month"
            value={month && year ? `${year}-${month}` : ""}
            onChange={(e) => {
              const [selectedYear, selectedMonth] =
                e.target.value.split("-");

              onYearChange(selectedYear || "");
              onMonthChange(selectedMonth || "");
            }}
            className={`${selectClass} pl-9`}
          />
        </div>
      </div>

      {(category || status || paymentMethod || month || year) && (
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition hover:text-red-700"
        >
          <FilterX size={14} />
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default ExpenseFilters;
