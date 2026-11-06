import { useEffect, useState } from "react";
import { School } from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

const EMPTY_FORM = {
  name: "",
  section: "",
  status: "active",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const ClassModal = ({
  open,
  classData,
  saving = false,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm({
      name: classData?.name ?? "",
      section: classData?.section ?? "",
      status: classData?.status ?? "active",
    });

    setError("");
  }, [open, classData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const section = form.section.trim();

    if (!name) {
      setError("Class name is required.");
      return;
    }

    if (name.length > 10) {
      setError("Class name cannot exceed 10 characters.");
      return;
    }

    setError("");

    await onSubmit({
      name,
      section: section || null,
      status: form.status,
    });
  };

  return (
    <ModalShell
      isOpen={open}
      onClose={onClose}
      title={classData ? "Edit Class" : "Add Class"}
      subtitle="Enter class information below."
      icon={<School size={22} />}
      maxWidth="max-w-md"
      disabled={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div>
          <FormField
            label="Class Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. 5th"
            required
            max="10"
          />

          <p className="mt-1 text-xs text-slate-400">
            Maximum 10 characters.
          </p>
        </div>

        <FormField
          label="Section (Optional)"
          name="section"
          value={form.section}
          onChange={handleChange}
          placeholder="e.g. A"
        />

        <FormField
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
          required
        />

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !form.name.trim()}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : classData
                ? "Update Class"
                : "Create Class"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default ClassModal;
