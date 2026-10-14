/**
 * @file PurchaseModal.jsx
 * @module Modals/PurchaseModal
 * @description Purchase create / update modal with multi-item purchase order.
 */

import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Wallet,
  Landmark,
  Banknote,
  Sparkles,
  Building2,
  CreditCard,
  User,
  Trash2,
  Pill,
  FileText,
  Building,
} from "lucide-react";
import {
  createPurchase,
  updatePurchase,
  fetchAllPurchases,
} from "../../../redux/slices/Purchases.slice.redux";
import { fetchAllMedicines } from "../../../redux/slices/Medicine.slice.redux";
import { fetchAllSuppliers } from "../../../redux/slices/Supplier.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const BANKS = [
  { value: "mcb", label: "MCB Bank" },
  { value: "ubl", label: "UBL Bank" },
  { value: "hbl", label: "HBL Bank" },
  { value: "allied", label: "Allied Bank" },
  { value: "meezan", label: "Meezan Bank" },
  { value: "bank_alfalah", label: "Bank Alfalah" },
  { value: "standard_chartered", label: "Standard Chartered" },
  { value: "other", label: "Other Bank" },
];

const TODAY = () => new Date().toISOString().split("T")[0];

const emptyItem = () => ({
  item_id: "",
  quantity: 1,
  price: 0,
  discount: 0,
  tax: 0,
});

const DEFAULT_FORM = {
  invoice_no: "",
  supplier_id: "",
  supplier_name: "",
  discount: 0,
  date: TODAY(),
  payment_method: "Cash",
  bank: "",
  status: "Received",
  items: [emptyItem()],
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const initialState = { form: DEFAULT_FORM, errors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {
        form: { ...DEFAULT_FORM, date: TODAY(), items: [emptyItem()] },
        errors: {},
      };
    case "INIT":
      return { form: action.form, errors: {} };
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };
    case "SELECT_SUPPLIER":
      return {
        ...state,
        form: {
          ...state.form,
          supplier_id: action.supplier.id,
          supplier_name: action.supplier.company_name || "",
        },
        errors: { ...state.errors, supplier_id: "" },
      };
    case "SET_ITEMS":
      return { ...state, form: { ...state.form, items: action.items } };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

/* -------------------------------------------------------------------------- */
/*                              Validation                                    */
/* -------------------------------------------------------------------------- */

const validate = (form) => {
  const errors = {};
  if (!form.invoice_no.trim()) errors.invoice_no = "Invoice number is required";
  if (!form.supplier_id) errors.supplier_id = "Please select a supplier";
  if (!form.date) errors.date = "Date is required";
  if (!form.payment_method)
    errors.payment_method = "Payment method is required";

  if (!form.items.length) errors.items = "At least one item is required";
  else {
    form.items.forEach((item, i) => {
      if (!item.item_id)
        errors[`item_${i}_item_id`] = "Medicine selection is required";
      if (Number(item.quantity) <= 0)
        errors[`item_${i}_quantity`] = "Quantity must be greater than 0";
    });
  }
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const PurchaseModal = ({ isOpen, onClose, purchaseData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(purchaseData);

  const creating = useSelector((s) => s.purchases?.creating ?? false);
  const updating = useSelector((s) => s.purchases?.updating ?? false);
  const isSubmitting = creating || updating;

  const medicines = useSelector(
    (s) => s.medicine?.medicines || s.medicine?.data || [],
  );
  const suppliers = useSelector(
    (s) => s.suppliers?.suppliers || s.suppliers?.data || [],
  );
  const suppliersLoading = useSelector((s) => s.suppliers?.loading ?? false);

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchAllMedicines());
    dispatch(fetchAllSuppliers());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    if (purchaseData) {
      const supplier = suppliers.find((s) => s.id === purchaseData.supplier_id);
      dispatchAction({
        type: "INIT",
        form: {
          invoice_no: purchaseData.invoice_no || "",
          supplier_id: purchaseData.supplier_id || "",
          supplier_name:
            supplier?.company_name || purchaseData.supplier?.company_name || "",
          discount: Number(purchaseData.discount || 0),
          date:
            purchaseData.purchase_date ||
            purchaseData.created_at?.split("T")[0] ||
            TODAY(),
          payment_method: purchaseData.payment_method || "Cash",
          bank: purchaseData.bank || "",
          status: purchaseData.status || "Received",
          items: purchaseData.items?.map((item) => ({
            item_id: item.item_id || item.medicine?.id || "",
            quantity: Number(item.quantity || 1),
            price: Number(item.purchase_price || item.price || 0),
            discount: Number(item.discount || 0),
            tax: Number(item.tax || 0),
          })) || [emptyItem()],
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, purchaseData, suppliers]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "supplier_id") {
        const supplier = suppliers.find((s) => String(s.id) === String(value));
        if (supplier) {
          dispatchAction({ type: "SELECT_SUPPLIER", supplier });
          return;
        }
      }
      dispatchAction({ type: "SET_FIELD", field: name, value });
    },
    [suppliers],
  );

  const handleItemChange = useCallback(
    (index, field, value) => {
      const items = [...state.form.items];

      if (field === "item_id") {
        const med = medicines.find((m) => String(m.id) === String(value));
        items[index] = {
          ...items[index],
          item_id: value,
          price: med ? Number(med.purchase_price || med.price || 0) : 0,
        };
      } else {
        items[index] = { ...items[index], [field]: value };
      }

      dispatchAction({ type: "SET_ITEMS", items });
      if (state.errors[`item_${index}_item_id`]) {
        dispatchAction({
          type: "SET_ERRORS",
          errors: { ...state.errors, [`item_${index}_item_id`]: "" },
        });
      }
    },
    [state.form.items, state.errors, medicines],
  );

  const handleAddItem = useCallback(() => {
    dispatchAction({
      type: "SET_ITEMS",
      items: [...state.form.items, emptyItem()],
    });
  }, [state.form.items]);

  const handleRemoveItem = useCallback(
    (index) => {
      if (state.form.items.length === 1) {
        toast.error("At least one item is required.");
        return;
      }
      dispatchAction({
        type: "SET_ITEMS",
        items: state.form.items.filter((_, i) => i !== index),
      });
    },
    [state.form.items],
  );

  /* ------------------------------- Totals -------------------------------- */

  const totals = useMemo(() => {
    const totalAmount = state.form.items.reduce(
      (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
      0,
    );
    const itemDiscount = state.form.items.reduce(
      (sum, it) => sum + Number(it.discount || 0),
      0,
    );
    const itemTax = state.form.items.reduce(
      (sum, it) => sum + Number(it.tax || 0),
      0,
    );
    const grandTotal =
      totalAmount + itemTax - Number(state.form.discount || 0) - itemDiscount;
    return {
      totalAmount,
      discount: Number(state.form.discount || 0),
      grandTotal: Math.max(0, grandTotal),
    };
  }, [state.form.items, state.form.discount]);

  /* ------------------------------ Submit --------------------------------- */

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors in the form.");
        return;
      }

      const payload = {
        invoice_no: state.form.invoice_no,
        supplier_id: Number(state.form.supplier_id),
        supplier_name: state.form.supplier_name,
        payment_method: state.form.payment_method,
        status: state.form.status,
        purchase_date: state.form.date,
        bank: state.form.payment_method === "Online" ? state.form.bank : "",
        discount: Number(state.form.discount),
        items: state.form.items.map((it) => ({
          item_id: Number(it.item_id),
          quantity: Number(it.quantity),
          purchase_price: Number(it.price),
          discount: Number(it.discount),
          tax: Number(it.tax),
        })),
      };

      try {
        if (isEditMode) {
          const res = await dispatch(
            updatePurchase({ id: purchaseData.id, ...payload }),
          ).unwrap();
          toast.success(res?.message || "Purchase updated successfully!");
        } else {
          const res = await dispatch(createPurchase(payload)).unwrap();
          toast.success(res?.message || "Purchase created successfully!");
        }
        dispatch(fetchAllPurchases());
        close();
      } catch (err) {
        toast.error(err?.message || "Operation failed.");
      }
    },
    [state.form, isEditMode, purchaseData, dispatch, close],
  );

  /* --------------------------- Dropdown options -------------------------- */

  const supplierOptions = useMemo(
    () =>
      suppliers.map((s) => ({
        value: s.id,
        label: `${s.company_name}${s.contact_person ? ` - ${s.contact_person}` : ""}`,
      })),
    [suppliers],
  );

  const medicineOptions = useMemo(
    () =>
      medicines.map((m) => ({
        value: m.id,
        label: `${m.name}${m.strength ? ` (${m.strength})` : ""} - Rs ${m.purchase_price || m.price || 0}`,
      })),
    [medicines],
  );

  const noSuppliers = suppliers.length === 0;

  /* -------------------------------- Render ------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isSubmitting}
      title={
        <>
          {isEditMode ? "Edit Purchase Order" : "Create Purchase Order"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update purchase details below"
          : "Fill in the details below to process a new purchase"
      }
      icon={<Wallet size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <FormField
          label="Invoice Number"
          icon={FileText}
          name="invoice_no"
          value={state.form.invoice_no}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g., INV-2026-001"
          error={state.errors.invoice_no}
          required
        />

        <FormField
          label="Supplier"
          icon={Building}
          name="supplier_id"
          value={state.form.supplier_id}
          onChange={handleChange}
          disabled={isSubmitting || suppliersLoading}
          error={state.errors.supplier_id}
          required
          options={supplierOptions}
        />

        {suppliersLoading && (
          <p className="text-xs text-slate-500 -mt-3">Loading suppliers...</p>
        )}
        {noSuppliers && !suppliersLoading && (
          <p className="text-xs text-amber-600 -mt-3">
            No suppliers available. Please add a supplier first.
          </p>
        )}

        <FormField
          label="Supplier Name"
          icon={User}
          name="supplier_name"
          value={state.form.supplier_name}
          disabled
          placeholder="Select a supplier to auto-fill"
        />

        {/* Items */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CreditCard size={16} className="text-[#00A3AD]" />
              Purchase Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={isSubmitting}
              className="text-xs font-semibold text-[#00A3AD] hover:text-[#008C94]"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {state.form.items.map((item, index) => (
              <div
                key={index}
                className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item #{index + 1}
                  </span>
                  {state.form.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <FormField
                  label="Medicine"
                  icon={Pill}
                  name={`item_${index}_item_id`}
                  value={item.item_id}
                  onChange={(e) =>
                    handleItemChange(index, "item_id", e.target.value)
                  }
                  error={state.errors[`item_${index}_item_id`]}
                  required
                  options={medicineOptions}
                />

                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    label="Quantity"
                    name={`qty_${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    error={state.errors[`item_${index}_quantity`]}
                    required
                  />
                  <FormField
                    label="Price"
                    name={`price_${index}`}
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                  />
                  <FormField
                    label="Tax"
                    name={`tax_${index}`}
                    type="number"
                    step="0.01"
                    value={item.tax}
                    onChange={(e) =>
                      handleItemChange(index, "tax", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <FormField
          label="Discount"
          name="discount"
          type="number"
          value={state.form.discount}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="0"
        />

        <FormField
          label="Date"
          icon={null}
          name="date"
          type="date"
          value={state.form.date}
          onChange={handleChange}
          disabled={isSubmitting}
          error={state.errors.date}
          required
        />

        {/* Payment method buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Payment Method <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["Cash", "Online"].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() =>
                  dispatchAction({
                    type: "SET_FIELD",
                    field: "payment_method",
                    value: method,
                  })
                }
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  state.form.payment_method === method
                    ? "bg-[#034A52] text-white border-[#034A52]"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {method === "Cash" ? (
                  <Banknote size={16} />
                ) : (
                  <Landmark size={16} />
                )}
                {method}
              </button>
            ))}
          </div>
        </div>

        {state.form.payment_method === "Online" && (
          <FormField
            label="Bank"
            icon={Building2}
            name="bank"
            value={state.form.bank}
            onChange={handleChange}
            disabled={isSubmitting}
            options={BANKS}
          />
        )}

        <FormField
          label="Status"
          name="status"
          value={state.form.status}
          disabled
        />

        {/* Totals */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total Amount</span>
            <span className="font-semibold text-slate-800">
              Rs {totals.totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span className="font-semibold text-rose-600">
              - Rs {totals.discount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
            <span className="text-sm font-bold text-slate-800">
              Grand Total
            </span>
            <span className="text-sm font-bold text-[#034A52]">
              Rs {totals.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || noSuppliers}
            title={noSuppliers ? "No suppliers available" : ""}
            className={`rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50 ${
              noSuppliers
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-[#034A52] hover:bg-[#02373d] shadow-[#034A52]/20"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet size={16} />
                {isEditMode ? "Update Order" : "Confirm Order"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default PurchaseModal;
