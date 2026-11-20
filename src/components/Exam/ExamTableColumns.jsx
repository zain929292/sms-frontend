
import { Users, School } from "lucide-react";

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(`${String(value).substring(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ExamTableColumns = () => [
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
    key: "name",
    label: "EXAM NAME",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        {row.name || "-"}
      </span>
    ),
  },
  {
    key: "exam_type",
    label: "EXAM TYPE",
    render: (row) => (
      <span className="text-xs font-medium text-slate-700">
        {formatLabel(row.exam_type)}
      </span>
    ),
  },
  {
    key: "academic_session",
    label: "ACADEMIC SESSION",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.academic_session?.name ||
          row.academic_session_name ||
          "-"}
      </span>
    ),
  },
  {
    key: "scope",
    label: "SCOPE",
    render: (row) => {
      const isWholeSchool = row.scope === "whole_school";

      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isWholeSchool
              ? "bg-teal-50 text-teal-700"
              : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {isWholeSchool ? (
            <School size={12} />
          ) : (
            <Users size={12} />
          )}
          {formatLabel(row.scope)}
        </span>
      );
    },
  },
  {
    key: "classes",
    label: "SELECTED CLASSES",
    render: (row) => {
      if (row.scope === "whole_school") {
        return (
          <span className="text-xs font-medium text-teal-700">
            All Classes
          </span>
        );
      }

      const classes = Array.isArray(row.classes)
        ? row.classes
        : [];

      if (!classes.length) {
        return (
          <span className="text-xs text-slate-400">
            No classes selected
          </span>
        );
      }

      return (
        <div className="flex max-w-[220px] flex-wrap items-center gap-1.5">
          {classes.slice(0, 3).map((item) => (
            <span
              key={item.id}
              className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700"
            >
              {item.name}
            </span>
          ))}

          {classes.length > 3 && (
            <span
              title={classes
                .slice(3)
                .map((item) => item.name)
                .join(", ")}
              className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600"
            >
              +{classes.length - 3} more
            </span>
          )}
        </div>
      );
    },
  },
  {
    key: "start_date",
    label: "START DATE",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {formatDate(row.start_date)}
      </span>
    ),
  },
  {
    key: "end_date",
    label: "END DATE",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {formatDate(row.end_date)}
      </span>
    ),
  },
  {
    key: "status",
    label: "STATUS",
    render: (row) => {
      const status = row.status || "";

      const statusClasses = {
        scheduled: "bg-amber-100 text-amber-700",
        completed: "bg-blue-100 text-blue-700",
        cancelled: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            statusClasses[status.toLowerCase()] ||
            "bg-slate-100 text-slate-600"
          }`}
        >
          {status ? formatLabel(status) : "-"}
        </span>
      );
    },
  },
];

export default ExamTableColumns;
