const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const UsersTableColumns = () => [
  {
    key: "id",
    label: "ID",
    width: "65px",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-700">
        #{row.id}
      </span>
    ),
  },
  {
    key: "name",
    label: "NAME",
    render: (row) => (
      <div className="flex min-w-[170px] items-center gap-2.5">
        {row.user_details?.photo ? (
          <img
            src={row.user_details.photo}
            alt={row.name || "User"}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
            {row.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-800">
            {row.name || "—"}
          </p>
          <p className="text-[10px] text-slate-400">
            ID: {row.id}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "email",
    label: "EMAIL",
    render: (row) => (
      <span className="text-xs text-slate-600">
        {row.email || "—"}
      </span>
    ),
  },
  {
    key: "role_name",
    label: "ROLE",
    render: (row) => {
      const role = row.role_name?.toLowerCase();

      return (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${
            role === "admin"
              ? "bg-purple-50 text-purple-700"
              : role === "teacher"
                ? "bg-teal-50 text-teal-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {row.role_name || "—"}
        </span>
      );
    },
  },
  {
    key: "cnic",
    label: "CNIC",
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-slate-600">
        {row.user_details?.cnic || "—"}
      </span>
    ),
  },
  {
    key: "phone",
    label: "PHONE",
    render: (row) => (
      <span className="text-xs text-slate-600">
        {row.user_details?.phone || "—"}
      </span>
    ),
  },
  {
    key: "gender",
    label: "GENDER",
    render: (row) => (
      <span className="text-xs capitalize text-slate-600">
        {row.user_details?.gender || "—"}
      </span>
    ),
  },

  {
    key: "employment_type",
    label: "STATUS",
    render: (row) => (
      <span className="whitespace-nowrap text-xs capitalize text-slate-600">
        {row.user_details?.employment_type?.replaceAll("_", " ") || "—"}
      </span>
    ),
  },
 ];

export default UsersTableColumns;
