
import { Pencil, Trash2 } from "lucide-react";

const ExamResultsTableColumns = ({
  onEdit,
  onDelete,
  deletingId,
}) => [
  {
    key: "student_name",
    label: "STUDENT NAME",
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
          {row.student_name?.[0]?.toUpperCase() || "S"}
        </div>

        <span className="text-xs font-bold text-slate-900">
          {row.student_name || "-"}
        </span>
      </div>
    ),
  },
  {
    key: "student_id",
    label: "STUDENT ID",
    width: "100px",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-700">
        {row.student_id ?? "-"}
      </span>
    ),
  },
  {
    key: "exam_name",
    label: "EXAM NAME",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-800">
        {row.exam_name || "-"}
      </span>
    ),
  },
  {
    key: "obtained_marks",
    label: "OBTAINED MARKS",
    width: "130px",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-700">
        {Number(row.obtained_marks || 0).toFixed(2)}
      </span>
    ),
  },
  {
    key: "grade",
    label: "GRADE",
    width: "90px",
    render: (row) => (
      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
        {row.grade || "-"}
      </span>
    ),
  },
  {
    key: "result_status",
    label: "RESULT STATUS",
    render: (row) => {
      const status = row.result_status?.toLowerCase() || "";

      const statusClasses = {
        pass: "bg-green-100 text-green-700",
        fail: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            statusClasses[status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : "-"}
        </span>
      );
    },
  },
  {
    key: "remarks",
    label: "REMARKS",
    render: (row) => (
      <span
        className="block max-w-[180px] truncate text-xs text-slate-700"
        title={row.remarks || ""}
      >
        {row.remarks || "-"}
      </span>
    ),
  },
  {
    key: "actions",
    label: "ACTIONS",
    width: "100px",
    render: (row) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(row)}
          title="Edit Result"
          className="rounded-md p-1.5 text-teal-600 transition hover:bg-teal-50"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          disabled={deletingId === row.id}
          onClick={() => onDelete(row.id)}
          title="Delete Result"
          className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
        >
          {deletingId === row.id ? (
            <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>
    ),
  },
];

export default ExamResultsTableColumns;
