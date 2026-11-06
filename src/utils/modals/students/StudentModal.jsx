import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

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

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "passout", label: "Passout" },
];

const StudentModal = ({
  isOpen,
  onClose,
  studentData,
  onSubmit,
  saving = false,
}) => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (studentData) {
      setForm({
        ...EMPTY_FORM,
        ...studentData,
        dob: studentData.dob?.substring(0, 10) ?? "",
        admission_date:
          studentData.admission_date?.substring(0, 10) ?? "",
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }

    setErrors({});
  }, [studentData, isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.admission_number.trim()) {
      nextErrors.admission_number = "Admission number is required.";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Student name is required.";
    }

    if (!form.father_name.trim()) {
      nextErrors.father_name = "Father name is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const payload = {
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
    };

    await onSubmit(payload);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={studentData ? "Edit Student" : "Add Student"}
      subtitle="Enter the student's basic information."
      icon={<GraduationCap size={22} />}
      maxWidth="max-w-3xl"
      disabled={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Admission Number"
            name="admission_number"
            value={form.admission_number}
            onChange={handleChange}
            error={errors.admission_number}
            placeholder="e.g. ADM-004"
            required
          />

          <FormField
            label="Student Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter student name"
            required
          />

          <FormField
            label="Father Name"
            name="father_name"
            value={form.father_name}
            onChange={handleChange}
            error={errors.father_name}
            placeholder="Enter father's name"
            required
          />

          <FormField
            label="Phone Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 03001234567"
          />

          <FormField
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={GENDER_OPTIONS}
            required
          />

          <FormField
            label="Date of Birth"
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
          />

          <FormField
            label="Admission Date"
            name="admission_date"
            type="date"
            value={form.admission_date}
            onChange={handleChange}
          />

          <FormField
            label="Previous School"
            name="previous_school"
            value={form.previous_school}
            onChange={handleChange}
            placeholder="Enter previous school"
          />

          <FormField
            label="Previous Class"
            name="previous_class"
            value={form.previous_class}
            onChange={handleChange}
            placeholder="Enter previous class"
          />

          <FormField
            label="Religion"
            name="religion"
            value={form.religion}
            onChange={handleChange}
            placeholder="Enter religion"
          />

          <FormField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Enter city"
          />

          <FormField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Enter state"
          />

          <FormField
            label="Postal Code"
            name="postal_code"
            value={form.postal_code}
            onChange={handleChange}
            placeholder="Enter postal code"
          />

          <FormField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            required
          />

          <div className="sm:col-span-2">
            <label
              htmlFor="student-address"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Address
            </label>

            <textarea
              id="student-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              disabled={saving}
              placeholder="Enter complete address"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:opacity-60"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="student-remarks"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Remarks
            </label>

            <textarea
              id="student-remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={3}
              disabled={saving}
              placeholder="Enter remarks"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : studentData
                ? "Update Student"
                : "Save Student"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default StudentModal;
