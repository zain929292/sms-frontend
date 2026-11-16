
import { useEffect, useState } from "react";
import {
  Wallet,
  Upload,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

const EMPTY_FORM = {
  title: "",
  category: "",
  amount: "",
  expense_date: "",
  payment_method: "cash",
  status: "pending",
  description: "",
  receipt: null,
};

const CATEGORY_OPTIONS = [
  { value: "salary", label: "Salary" },
  { value: "electricity", label: "Electricity" },
  { value: "water", label: "Water" },
  { value: "internet", label: "Internet" },
  { value: "maintenance", label: "Maintenance" },
  { value: "stationery", label: "Stationery" },
  { value: "transport", label: "Transport" },
  { value: "rent", label: "Rent" },
  { value: "other", label: "Other" },
];

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "online", label: "Online" },
];

const STATUS_OPTIONS = [
  { value: "cancelled", label: "Cancelled" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
];

export default function ExpenseModal({
  open,
  expense,
  saving = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    if (!open) return;

    setForm(
      expense
        ? {
            title: expense.title ?? "",
            category: expense.category ?? "",
            amount: expense.amount ?? "",
            expense_date: expense.expense_date?.slice(0, 10) ?? "",
            payment_method: expense.payment_method ?? "cash",
            status: expense.status ?? "pending",
            description: expense.description ?? "",
            receipt: null,
          }
        : { ...EMPTY_FORM },
    );

    setReceiptPreview(expense?.receipt ?? null);
    setError("");
  }, [open, expense]);

  useEffect(() => {
    return () => {
      if (receiptPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and PDF receipts are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Receipt size must not exceed 2MB.");
      event.target.value = "";
      return;
    }

    setForm((previous) => ({
      ...previous,
      receipt: file,
    }));

    setReceiptPreview(
      file.type === "application/pdf"
        ? null
        : URL.createObjectURL(file),
    );

    setError("");
  };

  const removeReceipt = () => {
    setForm((previous) => ({
      ...previous,
      receipt: null,
    }));

    setReceiptPreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter expense title.");
      return;
    }

    if (!form.category) {
      setError("Please select expense category.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    if (!form.expense_date) {
      setError("Please select expense date.");
      return;
    }

    const payload = new FormData();

    payload.append("title", form.title.trim());
    payload.append("category", form.category);
    payload.append("amount", form.amount);
    payload.append("expense_date", form.expense_date);
    payload.append("payment_method", form.payment_method);
    payload.append("status", form.status);
    payload.append("description", form.description.trim());

    if (form.receipt) {
      payload.append("receipt", form.receipt);
    }

    setError("");

    await onSubmit(payload);
  };

  return (
    <ModalShell
      isOpen={open}
      onClose={onClose}
      title={expense ? "Edit Expense" : "Add Expense"}
      subtitle="Enter the expense details"
      icon={<Wallet size={22} />}
      maxWidth="max-w-xl"
      disabled={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <FormField
          label="Expense Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter expense title..."
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            options={CATEGORY_OPTIONS}
            required
          />

          <FormField
            label="Amount (Rs.)"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            required
          />

          <FormField
            label="Expense Date"
            name="expense_date"
            type="date"
            value={form.expense_date}
            onChange={handleChange}
            required
          />

          <FormField
            label="Payment Method"
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            options={PAYMENT_OPTIONS}
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
        </div>

        <div className="w-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter expense description..."
            rows={3}
            className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Receipt <span className="text-xs text-slate-400">(Optional · Max 2MB)</span>
          </label>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs font-medium text-slate-600 transition hover:border-teal-400 hover:bg-teal-50">
            <Upload size={16} className="text-teal-600" />
            {form.receipt ? form.receipt.name : "Upload JPG, PNG or PDF"}
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleReceiptChange}
              className="hidden"
            />
          </label>

          {(receiptPreview || (form.receipt && form.receipt.type === "application/pdf")) && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
              {receiptPreview ? (
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="h-12 w-12 rounded-md border border-slate-100 object-cover"
                />
              ) : (
                <FileText size={28} className="text-red-500" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-700">
                  {form.receipt?.name || "Existing receipt"}
                </p>

                {expense?.receipt && !form.receipt && (
                  <a
                    href={expense.receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-teal-700 hover:underline"
                  >
                    View existing receipt
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={removeReceipt}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Remove receipt"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {expense?.receipt && !form.receipt && !receiptPreview && (
            <a
              href={expense.receipt}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"
            >
              <FileText size={13} />
              View existing receipt
              <ExternalLink size={11} />
            </a>
          )}
        </div>

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
            disabled={saving}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : expense
                ? "Update"
                : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
