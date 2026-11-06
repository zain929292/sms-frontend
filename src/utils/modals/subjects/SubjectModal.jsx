import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

const INITIAL_FORM = {
  name: "",
  description: "",
  type: "",
  status: "active",
};

const SUBJECT_TYPE_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "compulsory", label: "Compulsory" },
  { value: "optional", label: "Optional" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const SubjectModal = ({
  open,
  subject,
  saving = false,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    setForm(
      subject
        ? {
            name: subject.name ?? "",
            description: subject.description ?? "",
            type: subject.type ?? "",
            status: subject.status ?? "active",
          }
        : { ...INITIAL_FORM }
    );

    setErrors({});
  }, [subject, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleClose = () => {
    if (saving) return;

    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Subject name is required.";
    } else if (form.name.trim().length > 50) {
      nextErrors.name = "Subject name cannot exceed 50 characters.";
    }

    if (!form.status) {
      nextErrors.status = "Status is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const success = await onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || null,
      type: form.type || null,
      status: form.status,
    });

    if (success) {
      handleClose();
    }
  };

  return (
    <ModalShell
      isOpen={open}
      onClose={handleClose}
      title={subject ? "Edit Subject" : "Add Subject"}
      subtitle="Manage subject information"
      icon={<BookOpen size={22} />}
      maxWidth="max-w-3xl"
      disabled={saving}
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Subject Name */}
          <div className="sm:col-span-2">
            <FormField
              label="Subject Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter subject name"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {form.name.length}/50
            </p>
          </div>

          {/* Subject Type */}
          <FormField
            label="Subject Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            options={SUBJECT_TYPE_OPTIONS}
            disabled={saving}
          />

          {/* Status */}
          <FormField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            error={errors.status}
            required
            disabled={saving}
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label
            htmlFor="subject-description"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="subject-description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="Optional description..."
            disabled={saving}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : subject
                ? "Update Subject"
                : "Create Subject"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default SubjectModal;
