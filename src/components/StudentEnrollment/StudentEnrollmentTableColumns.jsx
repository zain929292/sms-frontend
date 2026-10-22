
const StudentEnrollmentTableColumns = () => [
  {
    key: "id",
    label: "ID",
    width: "70px",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-800">
        {row.id}
      </span>
    ),
  },
  {
    key: "student_name",
    label: "STUDENT",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-800">
        {row.student_name || "—"}
      </span>
    ),
  },
  {
    key: "class_name",
    label: "CLASS",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.class_name || "—"}
      </span>
    ),
  },
  {
    key: "academic_session",
    label: "ACADEMIC SESSION",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.academic_session || "—"}
      </span>
    ),
  },
  {
    key: "enrollment_date",
    label: "ENROLLMENT DATE",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.enrollment_date?.substring(0, 10) || "—"}
      </span>
    ),
  },
  {
    key: "status",
    label: "STATUS",
    render: (row) => {
      const styles = {
        active: "bg-green-100 text-green-700",
        promoted: "bg-blue-100 text-blue-700",
        completed: "bg-teal-100 text-teal-700",
        withdrawn: "bg-red-100 text-red-700",
      };

      return (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            styles[row.status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {row.status || "—"}
        </span>
      );
    },
  },
];

export default StudentEnrollmentTableColumns;
