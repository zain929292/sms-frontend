
import { Plus } from "lucide-react";

export default function UsersHeader({ onAddClick }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          Users
        </h1>

        <p className="text-xs text-slate-500">
          Manage user records and roles
        </p>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-teal-800"
      >
        <Plus size={15} />
        Add User
      </button>
    </div>
  );
}
