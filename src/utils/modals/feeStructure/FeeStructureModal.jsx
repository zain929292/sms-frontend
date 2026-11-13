
import { useEffect, useState } from "react";
import {
  Receipt,
  GraduationCap,
  Wallet,
  CalendarDays,
  FileText,
  ToggleLeft,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  class_id: "",
  name: "tuition_fee",
  amount: "",
  frequency: "monthly",
  description: "",
  status: "active",
};

const FEE_NAME_OPTIONS = [
  { value: "tuition_fee", label: "Tuition Fee" },
  { value: "paper_fund", label: "Paper Fund" },
  { value: "others", label: "Others" },
];

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "one_time", label: "One Time" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const FeeStructureModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedFeeStructure,
  classes = [],
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [classSearch, setClassSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const isEdit = Boolean(selectedFeeStructure?.id);

useEffect(() => {
  if (!isOpen) return;

  const source = selectedFeeStructure || {};

  setForm({
    ...EMPTY_FORM,
    class_id: String(source.class_id ?? ""),
    name: source.name ?? "tuition_fee",
    amount: source.amount ?? "",
    frequency: source.frequency ?? "monthly",
    description: source.description ?? "",
    status: source.status ?? "active",
  });

  setClassSearch(source.class?.name || source.class_name || "");
  setOpenDropdown(null);

}, [isOpen, selectedFeeStructure?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    onClose();
  };

  const handleClassSelect = (item) => {
    setForm((prev) => ({
      ...prev,
      class_id: String(item.id),
    }));

    setClassSearch(item.name ?? "");
    setOpenDropdown(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.class_id ||
      !form.name ||
      !form.amount ||
      Number(form.amount) < 0 ||
      !form.frequency ||
      !form.status
    ) {
      return;
    }

    onSubmit({
      class_id: Number(form.class_id),
      name: form.name,
      amount: Number(form.amount),
      frequency: form.frequency,
      description: form.description.trim() || null,
      status: form.status,
    });
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Update Fee Structure" : "Add Fee Structure"}
      subtitle="Configure class fees and payment frequency."
      icon={<Receipt size={22} />}
      maxWidth="max-w-2xl"
      disabled={saving}
    >
      <div
        className={`origin-center transform transition-all duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Class */}
            <SearchableSelect
              label="Class"
              icon={GraduationCap}
              placeholder="Search class..."
              searchTerm={classSearch}
              onSearchChange={(value) => {
                setClassSearch(value);
                setForm((prev) => ({
                  ...prev,
                  class_id: "",
                }));
              }}
              items={classes}
              isOpen={openDropdown === "class"}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "class" : null)
              }
              filterFn={(item, search) =>
                String(item.name ?? "")
                  .toLowerCase()
                  .includes(search.toLowerCase())
              }
              onSelect={handleClassSelect}
              itemRenderer={(item) => (
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Class ID: {item.id}
                  </p>
                </div>
              )}
              emptyMessage="No classes found."
            />

            {/* Fee Name */}
            <FormField
              label="Fee Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              options={FEE_NAME_OPTIONS}
              required
              disabled={saving}
            />

            {/* Amount */}
            <FormField
              label="Amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter fee amount"
              required
              disabled={saving}
            />

            {/* Frequency */}
            <FormField
              label="Frequency"
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              options={FREQUENCY_OPTIONS}
              required
              disabled={saving}
            />

            {/* Status */}
            <FormField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={STATUS_OPTIONS}
              required
              disabled={saving}
            />

            {/* Description */}
            <div className="sm:col-span-2">
              <FormField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter fee description..."
                disabled={saving}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !form.class_id ||
                !form.name ||
                form.amount === "" ||
                Number(form.amount) < 0
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Fee Structure"
                  : "Save Fee Structure"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default FeeStructureModal;
