import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

const EMPTY_FORM = {
  name: "",
  start_date: "",
  end_date: "",
  status: "active",
  is_current: false,
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AcademicSessionModal({
  open,
  session,
  saving = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(
      session
        ? {
            name: session.name ?? "",
            start_date: session.start_date?.slice(0, 10) ?? "",
            end_date: session.end_date?.slice(0, 10) ?? "",
            status: session.status ?? "active",
            is_current: Boolean(session.is_current),
          }
        : { ...EMPTY_FORM },
    );

    setError("");
  }, [open, session]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    setError("");

    await onSubmit({
      ...form,
      is_current: Boolean(form.is_current),
    });
  };

  const invalidDates =
    Boolean(form.start_date && form.end_date) &&
    form.end_date < form.start_date;

  return (
    <ModalShell
      isOpen={open}
      onClose={onClose}
      title={
        session ? "Edit Academic Session" : "Add Academic Session"
      }
      subtitle="Enter the academic session details"
      icon={<CalendarDays size={22} />}
      maxWidth="max-w-lg"
      disabled={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <FormField
          label="Session Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. 2026-2027"
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Start Date"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
            required
          />

          <FormField
            label="End Date"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
            min={form.start_date || undefined}
            required
          />
        </div>

        {invalidDates && (
          <p className="text-xs text-red-600">
            End date cannot be earlier than start date.
          </p>
        )}

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <FormField
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
          required
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
          <input
            type="checkbox"
            name="is_current"
            checked={form.is_current}
            onChange={handleChange}
            disabled={saving}
            className="h-4 w-4 accent-[var(--primary)]"
          />

          <span>
            <span className="block text-sm font-semibold text-slate-700">
              Current Session
            </span>
            <span className="block text-xs text-slate-500">
              Mark this as the current academic session
            </span>
          </span>
        </label>

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
              invalidDates ||
              !form.name.trim() ||
              !form.start_date ||
              !form.end_date
            }
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : session
                ? "Update Session"
                : "Save Session"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
