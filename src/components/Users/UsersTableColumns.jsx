
import { Eye, Pencil, Trash2 } from "lucide-react";

const UsersTableColumns = ({
  onView,
  onEdit,
  onDelete,
}) => [
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
    key: "name",
    label: "USER",
    render: (row) => (
      <span className="text-xs font-semibold text-slate-800">
        {row.name || "—"}
      </span>
    ),
  },
  {
    key: "email",
    label: "EMAIL",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.email || "—"}
      </span>
    ),
  },
  {
    key: "role_name",
    label: "ROLE",
    render: (row) => (
      <span className="text-xs text-slate-700">
        {row.role_name || "—"}
      </span>
    ),
  },
  {
    key: "actions",
    label: "ACTIONS",
    render: (row) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onView(row)}
          title="View User"
          className="rounded-md p-1.5 text-teal-700 hover:bg-teal-50"
        >
          <Eye size={15} />
        </button>

        <button
          type="button"
          onClick={() => onEdit(row)}
          title="Edit User"
          className="rounded-md p-1.5 text-blue-700 hover:bg-blue-50"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(row)}
          title="Delete User"
          className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={15} />
        </button>
      </div>
    ),
  },
];

export default UsersTableColumns;
