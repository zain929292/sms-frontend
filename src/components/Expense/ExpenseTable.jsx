
import { useCallback } from "react";
import {
  Wallet,
  CalendarDays,
  Pencil,
  Trash2,
  Clock3,
  Receipt,
  ExternalLink,
} from "lucide-react";

import Table from "../../utils/table/Table.util";

const ExpenseTable = ({
  expenses = [],
  total = 0,
  currentPage,
  itemsPerPage,
  totalPages,
  loading,
  searchTerm,
  onRefresh,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
  limitOptions,
}) => {
  const formatAmount = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const columns = [
    {
      key: "id",
      label: "ID",
      width: "60px",
      render: (row) => (
        <span className="text-xs font-medium text-slate-500">
          #{row.id}
        </span>
      ),
    },
    {
      key: "title",
      label: "EXPENSE",
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Wallet size={15} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800 sm:text-sm">
              {row.title || "Untitled expense"}
            </p>
            <p className="mt-0.5 text-[11px] capitalize text-slate-400">
              {row.category || "Other"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "AMOUNT",
      render: (row) => (
        <span className="whitespace-nowrap text-xs font-semibold text-slate-700">
          {formatAmount(row.amount)}
        </span>
      ),
    },
    {
      key: "expense_date",
      label: "EXPENSE DATE",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-600">
          <CalendarDays size={13} className="text-slate-400" />
          {row.expense_date || "—"}
        </span>
      ),
    },
    {
      key: "payment_method",
      label: "PAYMENT METHOD",
      render: (row) => (
        <span className="whitespace-nowrap text-xs capitalize text-slate-600">
          {row.payment_method?.replace(/_/g, " ") || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => {
        const status = row.status?.toLowerCase();

        const styles = {
          paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
          pending: "border-amber-200 bg-amber-50 text-amber-700",
          inactive: "border-slate-200 bg-slate-50 text-slate-500",
        };

        const dotStyles = {
          paid: "bg-emerald-500",
          pending: "bg-amber-500",
          inactive: "bg-slate-400",
        };

        return (
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium capitalize ${
              styles[status] || styles.inactive
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                dotStyles[status] || dotStyles.inactive
              }`}
            />
            {status || "Unknown"}
          </span>
        );
      },
    },
    {
      key: "receipt",
      label: "RECEIPT",
      render: (row) =>
        row.receipt ? (
          <a
            href={row.receipt}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-teal-100 bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-700 transition hover:bg-teal-100"
          >
            <Receipt size={13} />
            View
            <ExternalLink size={11} />
          </a>
        ) : (
          <span className="text-xs text-slate-400">No receipt</span>
        ),
    },
  ];

  const getRowActions = useCallback(
    (row) => [
      {
        label: "Edit Expense",
        icon: <Pencil size={14} />,
        onClick: (selectedRow) => onEdit(selectedRow || row),
      },
      {
        label: "Delete Expense",
        icon: <Trash2 size={14} />,
        variant: "danger",
        onClick: (selectedRow) => onDelete(selectedRow || row),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <div className="min-w-0 overflow-hidden rounded-xl">
      <Table
        title="Expense Directory"
        description="Manage school expenses, payment records and receipts."
        actionButton={
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clock3
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
        columns={columns}
        data={expenses}
        keyField="id"
        loading={loading}
        emptyMessage={
          searchTerm
            ? "No matching expenses found. Try another search."
            : "No expenses available. Add your first expense to get started."
        }
        getRowActions={getRowActions}
        pagination={{
          page: currentPage,
          limit: itemsPerPage,
          total,
          last_page: totalPages,
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        limitOptions={limitOptions}
      />
    </div>
  );
};

export default ExpenseTable;
