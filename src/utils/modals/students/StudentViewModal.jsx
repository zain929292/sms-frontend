import { X, UserRound, GraduationCap, MapPin } from "lucide-react";

const Detail = ({ label, value }) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
    <p className="mb-1 text-xs font-medium text-slate-500">
      {label}
    </p>
    <p className="break-words text-sm font-semibold text-slate-800">
      {value === null || value === undefined || value === ""
        ? "—"
        : String(value)}
    </p>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-3">
    <h3 className="flex items-center gap-2 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--primary)]">
      <Icon size={17} />
      {title}
    </h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {children}
    </div>
  </div>
);

const StudentViewModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const formatDate = (date) =>
    date ? String(date).substring(0, 10) : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-view-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2
              id="student-view-title"
              className="text-lg font-bold text-slate-900"
            >
              Student Details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Complete student information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4 rounded-xl bg-teal-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
              {student.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-900">
                {student.name || "Unknown Student"}
              </h3>
              <p className="text-xs text-slate-500">
                {student.admission_number || "No Admission Number"}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                student.status === "active"
                  ? "bg-green-100 text-green-700"
                  : student.status === "passout"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {student.status || "N/A"}
            </span>
          </div>

          <Section icon={UserRound} title="Personal Information">
            <Detail label="Student ID" value={student.id} />
            <Detail label="Student Name" value={student.name} />
            <Detail label="Father Name" value={student.father_name} />
            <Detail label="Phone Number" value={student.phone} />
            <Detail label="Gender" value={student.gender} />
            <Detail label="Date of Birth" value={formatDate(student.dob)} />
            <Detail label="Religion" value={student.religion} />
          </Section>

          <Section icon={GraduationCap} title="Admission Information">
            <Detail
              label="Admission Number"
              value={student.admission_number}
            />
            <Detail
              label="Admission Date"
              value={formatDate(student.admission_date)}
            />
            <Detail
              label="Previous School"
              value={student.previous_school}
            />
            <Detail
              label="Previous Class"
              value={student.previous_class}
            />
            <Detail label="Status" value={student.status} />
            <div className="sm:col-span-2">
              <Detail label="Remarks" value={student.remarks} />
            </div>
          </Section>

          <Section icon={MapPin} title="Address Information">
            <Detail label="City" value={student.city} />
            <Detail label="State" value={student.state} />
            <Detail label="Postal Code" value={student.postal_code} />
            <div className="sm:col-span-2">
              <Detail label="Complete Address" value={student.address} />
            </div>
          </Section>
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--secondary)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentViewModal;