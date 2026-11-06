
import { useEffect, useState } from "react";
import {
  CalendarDays,
  UserRound,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  Clock,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const LeaveApprovalModal = ({
  isOpen,
  onClose,
  leaveRequest,
  onSubmit,
  approving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [status, setStatus] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [errors, setErrors] = useState({});

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    setStatus("");
    setApprovalRemarks("");
    setErrors({});
  }, [isOpen, leaveRequest]);

  // Close modal
  const handleClose = () => {
    if (approving) return;

    onClose();
  };

  // Select approval status
  const handleStatusChange = (value) => {
    setStatus(value);

    setErrors((prev) => ({
      ...prev,
      status: "",
    }));
  };

  // Submit approval
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!status) {
      newErrors.status = "Please select an approval decision.";
    }

    if (!approvalRemarks.trim()) {
      newErrors.approval_remarks =
        "Please enter approval remarks.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      status,
      approval_remarks: approvalRemarks.trim(),
    });
  };

  if (!shouldRender) return null;

  const isApproved = status === "approved";

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title="Leave Request Approval"
      subtitle="Review the request and submit your decision."
      icon={<ClipboardCheck size={22} />}
      maxWidth="max-w-2xl"
      disabled={approving}
    >
      <div
        className={`origin-center transform transition-all duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">

          {/* Request Summary */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Leave Request
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Request #{leaveRequest?.id || "-"}
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase text-amber-700">
                {leaveRequest?.status || "Pending"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* User */}
              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-500">
                  Requested By
                </p>

                <div className="flex items-center gap-2">
                  <UserRound size={14} className="text-teal-700" />

                  <p className="text-xs font-semibold text-slate-800">
                    {leaveRequest?.user_name || "-"}
                  </p>
                </div>
              </div>

              {/* Leave Type */}
              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-500">
                  Leave Type
                </p>

                <p className="text-xs font-semibold capitalize text-slate-800">
                  {leaveRequest?.leave_type || "-"}
                </p>
              </div>

              {/* Start Date */}
              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-500">
                  Start Date
                </p>

                <p className="text-xs font-semibold text-slate-800">
                  {formatDate(leaveRequest?.start_date)}
                </p>
              </div>

              {/* End Date */}
              <div>
                <p className="mb-1 text-[11px] font-medium text-slate-500">
                  End Date
                </p>

                <p className="text-xs font-semibold text-slate-800">
                  {formatDate(leaveRequest?.end_date)}
                </p>
              </div>

            </div>

            {/* Duration */}
            <div className="mt-4 flex items-center justify-between rounded-lg border border-teal-100 bg-white px-3 py-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock size={15} />

                <span className="text-xs font-medium">
                  Total Leave Duration
                </span>
              </div>

              <span className="text-sm font-bold text-teal-700">
                {leaveRequest?.total_days ?? 0} Days
              </span>
            </div>

            {/* Reason */}
            <div className="mt-4">
              <p className="mb-1 text-[11px] font-semibold text-slate-500">
                Leave Reason
              </p>

              <p className="rounded-lg border border-slate-100 bg-white p-3 text-xs leading-5 text-slate-700">
                {leaveRequest?.reason || "No reason provided."}
              </p>
            </div>

          </div>

          {/* Approval Decision */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Approval Decision <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">

              {/* Approve */}
              <button
                type="button"
                onClick={() => handleStatusChange("approved")}
                disabled={approving}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  status === "approved"
                    ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-green-300 hover:bg-green-50"
                } disabled:opacity-50`}
              >
                <CheckCircle size={17} />
                Approve
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => handleStatusChange("rejected")}
                disabled={approving}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  status === "rejected"
                    ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-100"
                    : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:bg-red-50"
                } disabled:opacity-50`}
              >
                <XCircle size={17} />
                Reject
              </button>

            </div>

            {errors.status && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.status}
              </p>
            )}
          </div>

          {/* Approval Remarks */}
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Approval Remarks <span className="text-red-500">*</span>
            </label>

            <textarea
              rows={3}
              maxLength={255}
              value={approvalRemarks}
              onChange={(e) => {
                setApprovalRemarks(e.target.value);

                setErrors((prev) => ({
                  ...prev,
                  approval_remarks: "",
                }));
              }}
              disabled={approving}
              placeholder="Enter reason for approval or rejection..."
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
            />

            {errors.approval_remarks && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.approval_remarks}
              </p>
            )}

            <p className="mt-1 text-right text-[11px] text-slate-400">
              {approvalRemarks.length}/255
            </p>
          </div>

          {/* Decision Preview */}
          {status && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg p-3 ${
                isApproved
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {isApproved ? (
                <CheckCircle size={17} />
              ) : (
                <XCircle size={17} />
              )}

              <p className="text-xs font-semibold">
                {isApproved
                  ? "This request will be approved."
                  : "This request will be rejected."}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">

            <button
              type="button"
              onClick={handleClose}
              disabled={approving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={approving || !status}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                isApproved
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {approving
                ? "Processing..."
                : isApproved
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
            </button>

          </div>

        </form>
      </div>
    </ModalShell>
  );
};

export default LeaveApprovalModal;
