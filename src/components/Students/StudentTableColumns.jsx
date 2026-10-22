
const StudentTableColumns = () => [
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
    key: "admission_number",
    label: "ADMISSION NO.",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-700">
        {row.admission_number || "-"}
      </span>
    ),
  },
  {
    key: "name",
    label: "STUDENT NAME",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        {row.name || "-"}
      </span>
    ),
  },
  {
    key: "father_name",
    label: "FATHER NAME",
    render: (row) => (
      <span className="text-xs font-bold text-slate-900">
        {row.father_name || "-"}
      </span>
    ),
  },

  {
    key: "dob",
    label: "DOB",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.dob || "-"}
      </span>
    ),
  },
  {
    key: "gender",
    label: "GENDER",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.gender || "-"}
      </span>
    ),
  },
{
  key: "admission_date",
  label: "ADMISSION DATE",
  render: (row) => (
    <span className="text-xs text-slate-700">
      {row.admission_date?.substring(0, 10) || "—"}
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
            : status === "passout"
              ? "bg-blue-100 text-blue-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  },
},


];

export default StudentTableColumns;
