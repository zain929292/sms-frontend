
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

const EMPTY_FORM = {
  notice: "",
  audience: "all",
  publish_date: "",
  status: "draft",
};

const AUDIENCE_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "students", label: "Students" },
  { value: "parents", label: "Parents" },
  { value: "teachers", label: "Teachers" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "inactive", label: "Inactive" },
];

export default function AnnouncementModal({
  open,
  announcement,
  saving = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(
      announcement
        ? {
            notice: announcement.notice ?? "",
            audience: announcement.audience ?? "all",
            publish_date:
              announcement.publish_date?.slice(0, 10) ?? "",
            status: announcement.status ?? "draft",
          }
        : { ...EMPTY_FORM },
    );

    setError("");
  }, [open, announcement]);

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

    if (!form.notice.trim()) {
      setError("Please enter announcement notice.");
      return;
    }

    if (!form.publish_date) {
      setError("Please select a publish date.");
      return;
    }

    setError("");

    await onSubmit({
      ...form,
      notice: form.notice.trim(),
    });
  };

  return (
    <ModalShell
      isOpen={open}
      onClose={onClose}
      title={
        announcement
          ? "Edit Announcement"
          : "Add Announcement"
      }
      subtitle="Enter the announcement details"
      icon={<Bell size={22} />}
      maxWidth="max-w-lg"
      disabled={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Announcement Notice <span className="text-red-500">*</span>
        </label>

        <textarea
          name="notice"
          value={form.notice}
          onChange={handleChange}
          placeholder="Enter announcement details..."
          rows={4}
          required
          className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
      </div>

        <FormField
          label="Audience"
          name="audience"
          value={form.audience}
          onChange={handleChange}
          options={AUDIENCE_OPTIONS}
          required
        />

        <FormField
          label="Publish Date"
          name="publish_date"
          type="date"
          value={form.publish_date}
          onChange={handleChange}
          required
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

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              !form.notice.trim() ||
              !form.publish_date
            }
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : announcement
                ? "Update"
                : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
