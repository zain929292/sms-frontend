
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = {
  admission_number: "",
  name: "",
  father_name: "",
  phone: "",
  dob: "",
  gender: "male",
  religion: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  admission_date: "",
  previous_school: "",
  previous_class: "",
  status: "active",
  remarks: "",
};

const StudentModal = ({ isOpen, onClose, studentData, onSubmit }) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (studentData) {
      setForm({
        ...EMPTY_FORM,
        ...studentData,
        dob: studentData.dob?.substring(0, 10) || "",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
  }, [studentData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...form,
    admission_number: String(form.admission_number ?? "").trim(),
    name: String(form.name ?? "").trim(),
    father_name: String(form.father_name ?? "").trim(),
    phone: String(form.phone ?? "").trim(),
    dob: form.dob || null,
    gender: form.gender || "male",
    religion: String(form.religion ?? "").trim(),
    address: String(form.address ?? "").trim(),
    city: String(form.city ?? "").trim(),
    state: String(form.state ?? "").trim(),
    postal_code: String(form.postal_code ?? "").trim(),
    admission_date: form.admission_date || null,
    previous_school: String(form.previous_school ?? "").trim(),
    previous_class: String(form.previous_class ?? "").trim(),
    status: form.status || "active",
    remarks: String(form.remarks ?? "").trim(),
    });
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-[var(--gray)] bg-white px-3 py-2.5 text-sm text-[var(--dark)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-teal-100";

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
        aria-labelledby="student-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--gray)] px-5 py-4 sm:px-6">
          <div>
            <h2
              id="student-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {studentData ? "Edit Student" : "Add Student"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the student's basic information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Admission Number *
              <input
                className={inputClass}
                name="admission_number"
                value={form.admission_number}
                onChange={handleChange}
                placeholder="e.g. ADM-004"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Student Name *
              <input
                className={inputClass}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter student name"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Father Name *
              <input
                className={inputClass}
                name="father_name"
                value={form.father_name}
                onChange={handleChange}
                placeholder="Enter father's name"
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Phone Number
              <input
                className={inputClass}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 03001234567"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Gender *
              <select
                className={inputClass}
                name="gender"
                value={form.gender}
                onChange={handleChange}
                required
              >
                <option value="male">male</option>
                <option value="Female">female</option>
                <option value="Other">other</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Date of Birth
              <input
                className={inputClass}
                type="date"
                name="dob"
                value={form.dob || ""}
                onChange={handleChange}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Admission Date
              <input
                className={inputClass}
                type="date"
                name="admission_date"
                value={form.admission_date || ""}
                onChange={handleChange}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Previous School
              <input
                className={inputClass}
                name="previous_school"
                value={form.previous_school}
                onChange={handleChange}
                placeholder="Enter previous school"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Previous Class
              <input
                className={inputClass}
                name="previous_class"
                value={form.previous_class}
                onChange={handleChange}
                placeholder="Enter previous class"
              />
            </label>


            <label className="text-sm font-medium text-slate-700">
              Religion
              <input
                className={inputClass}
                name="religion"
                value={form.religion}
                onChange={handleChange}
                placeholder="Enter religion"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              City
              <input
                className={inputClass}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              State
              <input
                className={inputClass}
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Postal Code
              <input
                className={inputClass}
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                placeholder="Enter postal code"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Status
              <select
                className={inputClass}
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="passout">Passout</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Address
              <textarea
                className={inputClass}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows={3}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Remarks
              <textarea
                className={inputClass}
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks"
                rows={3}
              />
            </label>

          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--gray)] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--gray)] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)]"
            >
              {studentData ? "Update Student" : "Save Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
