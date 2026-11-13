
const formatAmount = (value) => {
  const amount = Number(value ?? 0);

  return `Rs. ${amount.toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  return String(value).substring(0, 10);
};

const formatMonth = (value) => {
  if (!value) return "-";

  const [year, month] = value.split("-");

  const date = new Date(Number(year), Number(month) - 1);

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

const PayrollTableColumns = () => [
  {
    key: "id",
    label: "ID",
    width: "65px",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-800">
        {row.id ?? "-"}
      </span>
    ),
  },
  {
    key: "staff_name",
    label: "STAFF NAME",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        {row.staff_name || "-"}
      </span>
    ),
  },
  {
    key: "salary_month",
    label: "SALARY MONTH",
    render: (row) => (
      <span className="text-xs font-medium text-slate-700">
        {formatMonth(row.salary_month)}
      </span>
    ),
  },
  {
    key: "basic_salary",
    label: "BASIC SALARY",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {formatAmount(row.basic_salary)}
      </span>
    ),
  },
  {
    key: "allowances",
    label: "ALLOWANCES",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {formatAmount(row.allowances)}
      </span>
    ),
  },
  {
    key: "deductions",
    label: "DEDUCTIONS",
    render: (row) => (
      <span className="text-xs text-rose-600">
        {formatAmount(row.deductions)}
      </span>
    ),
  },
  {
    key: "net_salary",
    label: "NET SALARY",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-900">
        {formatAmount(row.net_salary)}
      </span>
    ),
  },
  {
    key: "paid_amount",
    label: "PAID",
    render: (row) => (
      <span className="text-xs font-semibold text-green-700">
        {formatAmount(row.paid_amount)}
      </span>
    ),
  },
  {
    key: "remaining_amount",
    label: "REMAINING",
    render: (row) => (
      <span className="text-xs font-semibold text-rose-600">
        {formatAmount(row.remaining_amount)}
      </span>
    ),
  },
  {
    key: "payment_date",
    label: "PAYMENT DATE",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {formatDate(row.payment_date)}
      </span>
    ),
  },
  {
    key: "payment_status",
    label: "STATUS",
    render: (row) => {
      const status = row.payment_status || "unpaid";

      const statusClasses = {
        paid: "bg-green-100 text-green-700",
        partial: "bg-amber-100 text-amber-700",
        unpaid: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            statusClasses[status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
];

export default PayrollTableColumns;
