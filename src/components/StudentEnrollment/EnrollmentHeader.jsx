
import { Plus } from "lucide-react";

export default function EnrollmentHeader({ onEnrollClick }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onEnrollClick}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[var(--secondary)] active:scale-95"
      >
        <Plus size={18} />
        Enroll Student
      </button>
    </div>
  );
}
