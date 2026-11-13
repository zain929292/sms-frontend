
const formatLabel = (value) =>
  String(value || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const FeeStructureTableColumns = () => [
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
    key: "name",
    label: "FEE NAME",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        {formatLabel(row.name)}
      </span>
    ),
  },
  {
    key: "class_id",
    label: "CLASS",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-700">
        {row.class?.name || row.class_name || `Class ID: ${row.class_id}`}
      </span>
    ),
  },
  {
    key: "amount",
    label: "AMOUNT",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        Rs. {Number(row.amount || 0).toLocaleString("en-PK")}
      </span>
    ),
  },
  {
    key: "frequency",
    label: "FREQUENCY",
    render: (row) => (
      <span className="text-xs font-medium text-slate-700">
        {formatLabel(row.frequency)}
      </span>
    ),
  },
  {
    key: "description",
    label: "DESCRIPTION",
    render: (row) => (
      <span className="text-xs text-slate-600">
        {row.description || "-"}
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

export default FeeStructureTableColumns;
