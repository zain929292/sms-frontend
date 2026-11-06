
import {
  UserRound,
  CalendarDays,
  Clock,
  LogIn,
  LogOut,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const StaffAttendanceViewModal = ({
  isOpen,
  onClose,
  attendance,
}) => {
  const { isVisible, isAnimating } = useModalAnimation(isOpen);

  if (!isVisible || !attendance) return null;

  const statusStyles = {
    present: "bg-green-50 text-green-700 border-green-100",
    absent: "bg-red-50 text-red-700 border-red-100",
    late: "bg-amber-50 text-amber-700 border-amber-100",
    leave: "bg-blue-50 text-blue-700 border-blue-100",
  };

  const status = attendance.status?.toLowerCase();

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        <Icon size={15} />
        <span className="text-[11px] font-medium">{label}</span>
      </div>

      <p className="break-words text-xs font-semibold text-slate-700">
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Staff Attendance Details"
      isAnimating={isAnimating}
    >
      <div className="space-y-4">
        {/* Staff Information */}
        <div className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <UserRound size={21} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {attendance.user_name || "Unknown Staff"}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Staff ID: {attendance.user_id || "N/A"}
            </p>
          </div>

          <span
            className={`ml-auto shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${
              statusStyles[status] ||
              "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {attendance.status || "N/A"}
          </span>
        </div>

        {/* Attendance Details */}
        <div>
          <h3 className="mb-2 text-xs font-bold text-slate-700">
            Attendance Information
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem
              icon={CalendarDays}
              label="Attendance Date"
              value={attendance.attendance_date}
            />

            <DetailItem
              icon={CheckCircle2}
              label="Attendance Status"
              value={attendance.status}
            />

            <DetailItem
              icon={LogIn}
              label="Check In"
              value={
                attendance.check_in
                  ? attendance.check_in.slice(0, 5)
                  : "Not Recorded"
              }
            />

            <DetailItem
              icon={LogOut}
              label="Check Out"
              value={
                attendance.check_out
                  ? attendance.check_out.slice(0, 5)
                  : "Not Recorded"
              }
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <ClipboardList size={15} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-700">
              Remarks
            </h3>
          </div>

          <div className="min-h-16 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
            <p className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
              {attendance.remarks || "No remarks added."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--primary)] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[var(--secondary)]"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

export default StaffAttendanceViewModal;
