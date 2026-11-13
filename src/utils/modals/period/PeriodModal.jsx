
import { useEffect, useState } from "react";
import { X, Clock, Save } from "lucide-react";

const INITIAL_FORM = {
  name: "",
  start_time: "",
  end_time: "",
  sort_order: "",
  status: "active",
};

export default function PeriodModal({
  isOpen,
  onClose,
  onSubmit,
  selectedPeriod,
  saving = false,
  periods = [],
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);

  const isEdit = Boolean(selectedPeriod?.id);

  useEffect(() => {
    if (!isOpen) return;

    if (selectedPeriod) {
      setFormData({
        name: selectedPeriod.name || "",
        start_time: selectedPeriod.start_time?.slice(0, 5) || "",
        end_time: selectedPeriod.end_time?.slice(0, 5) || "",
        sort_order: selectedPeriod.sort_order ?? "",
        status: selectedPeriod.status || "active",
      });
    } else {
      const nextOrder =
        periods.length > 0
          ? Math.max(
              ...periods.map((item) => Number(item.sort_order) || 0)
            ) + 1
          : 1;

      setFormData({
        ...INITIAL_FORM,
        sort_order: nextOrder,
      });
    }
  }, [isOpen, selectedPeriod, periods]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return;

    if (!formData.start_time || !formData.end_time) return;

    if (formData.end_time <= formData.start_time) return;

    const payload = {
      name: formData.name.trim(),
      start_time: formData.start_time,
      end_time: formData.end_time,
      sort_order: Number(formData.sort_order),
      status: formData.status,
    };

    await onSubmit(payload);
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-slate-600";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3">

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Clock size={16} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {isEdit ? "Edit Period" : "Add Period"}
              </h2>

              <p className="text-[11px] text-slate-500">
                {isEdit
                  ? "Update period details."
                  : "Add a new timetable period."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          <div className="space-y-3 p-4">

            {/* Period Name */}
            <div>
              <label className={labelClass}>
                Period Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Period 1 or Break"
                required
                className={inputClass}
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">

              <div>
                <label className={labelClass}>
                  Start Time <span className="text-red-500">*</span>
                </label>

                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  End Time <span className="text-red-500">*</span>
                </label>

                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

            </div>

            {/* Order and Status */}
            <div className="grid grid-cols-2 gap-3">

              <div>
                <label className={labelClass}>
                  Sort Order <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  name="sort_order"
                  min="1"
                  value={formData.sort_order}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

            </div>

            {formData.start_time &&
              formData.end_time &&
              formData.end_time <= formData.start_time && (
                <p className="text-[11px] text-red-500">
                  End time must be later than start time.
                </p>
              )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !formData.name.trim() ||
                !formData.start_time ||
                !formData.end_time ||
                !formData.sort_order ||
                formData.end_time <= formData.start_time
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />

              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Period"
                  : "Save Period"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
