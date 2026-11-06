
import { X } from "lucide-react";

const StaffViewModal = ({ staff, onClose }) => {
  if (!staff) return null;

  const details = [
    ["Name", staff.user?.name],
    ["Email", staff.user?.email],
    ["Phone", staff.phone],
    ["Gender", staff.gender],
    ["Date of Birth", staff.dob?.substring(0, 10)],
    ["CNIC", staff.cnic],
    ["Address", staff.address],
    ["Qualification", staff.qualification],
    ["Specialization", staff.specialization],
    ["Experience", `${staff.experience ?? 0} years`],
    ["Joining Date", staff.joining_date?.substring(0, 10)],
    ["Employment Type", staff.employment_type?.replaceAll("_", " ")],
    ["Emergency Contact", staff.emergency_contact],
    ["Remarks", staff.remarks],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Staff Details
          </h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="border-b border-gray-100 pb-2">
              <p className="text-[11px] text-gray-400">{label}</p>
              <p className="mt-1 break-words text-xs font-medium capitalize text-gray-800">
                {value || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffViewModal;
