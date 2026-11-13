
const formatLabel = (value) =>
  String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatAmount = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;

const SalaryStructureTableColumns = () => [
  {
    key: "id",
    label: "ID",
    width: "70px",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-800">
        {row.id ?? "-"}
      </span>
    ),
  },
  {
    key: "user_name",
    label: "STAFF NAME",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        {row.user_name || row.user?.name || "-"}
      </span>
    ),
  },
  {
    key: "basic_salary",
    label: "BASIC SALARY",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        {formatAmount(row.basic_salary)}
      </span>
    ),
  },
  {
    key: "allowances",
    label: "ALLOWANCES",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-700">
        {formatAmount(row.allowances)}
      </span>
    ),
  },
  {
    key: "total_salary",
    label: "TOTAL SALARY",
    render: (row) => (
      <span className="text-xs font-bold text-teal-700">
        {formatAmount(row.total_salary)}
      </span>
    ),
  },
  {
    key: "remarks",
    label: "REMARKS",
    render: (row) => (
      <span className="text-xs text-slate-600">
        {row.remarks || "-"}
      </span>
    ),
  },
  {
    key: "status",
    label: "STATUS",
    render: (row) => {
      const status = row.status || "inactive";

      return (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {formatLabel(status)}
        </span>
      );
    },
  },
];

export default SalaryStructureTableColumns;
