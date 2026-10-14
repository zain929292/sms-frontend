/**
 * @file SaleModal.jsx
 * @module Modals/SaleModal
 * @description Sale order create modal with stock validation.
 */

import { memo, useReducer, useEffect, useCallback, useMemo } from "react";
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
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  createSale,
  fetchAllSales,
} from "../../../redux/slices/Sales.slice.redux";
import { fetchAllMedicines } from "../../../redux/slices/Medicine.slice.redux";
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
  patient_name: "",
  discount: 0,
  date: TODAY(),
  payment_method: "Cash",
  bank: "",
  items: [emptyItem()],
};

/* -------------------------------------------------------------------------- */
/*                              Stock helper                                  */
/* -------------------------------------------------------------------------- */

const checkStockAvailability = (medicines, items) => {
  const insufficient = {};
  items.forEach((item, index) => {
    if (!item.item_id) return;
    const med = medicines.find((m) => String(m.id) === String(item.item_id));
    if (!med) return;
    const available = med.stock || 0;
    const requested = Number(item.quantity) || 0;
    if (requested > available) {
      insufficient[index] = {
        available,
        requested,
        name: med.name,
      };
    }
  });
  return insufficient;
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const initialState = { form: DEFAULT_FORM, errors: {}, stockErrors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {
        form: { ...DEFAULT_FORM, date: TODAY(), items: [emptyItem()] },
        errors: {},
        stockErrors: {},
      };
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };
    case "SET_ITEMS":
      return { ...state, form: { ...state.form, items: action.items } };
    case "SET_STOCK_ERRORS":
      return { ...state, stockErrors: action.stockErrors };
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
  if (!form.patient_name.trim())
    errors.patient_name = "Patient name is required";
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
/*                              Sale Item Row                                 */
/* -------------------------------------------------------------------------- */

const SaleItemRow = memo(
  ({
    index,
    item,
    medicines,
    error,
    stockError,
    onChange,
    onRemove,
    canRemove,
  }) => {
    const selectedMedicine = medicines.find(
      (m) => String(m.id) === String(item.item_id),
    );

    return (
      <div
        className={`bg-slate-50/80 rounded-xl p-3 border ${
          stockError ? "border-rose-300 bg-rose-50/50" : "border-slate-200/80"
        } space-y-2`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Item #{index + 1}
          </span>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
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
          onChange={(e) => onChange(index, "item_id", e.target.value)}
          error={error}
          required
          options={medicines.map((m) => {
            const stock = m.stock || 0;
            const stockLabel =
              stock > 0 ? `(Stock: ${stock})` : "(Out of Stock)";
            return {
              value: m.id,
              label: `${m.name}${m.strength ? ` (${m.strength})` : ""} - Rs ${m.price || m.selling_price || 0} ${stockLabel}`,
            };
          })}
        />

        {selectedMedicine && (
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg text-xs">
            <Package size={14} className="text-slate-400" />
            <span className="text-slate-600">
              Available: <strong>{selectedMedicine.stock || 0}</strong> units
            </span>
            {selectedMedicine.stock <= 5 && selectedMedicine.stock > 0 && (
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <AlertTriangle size={12} /> Low Stock!
              </span>
            )}
            {selectedMedicine.stock === 0 && (
              <span className="flex items-center gap-1 text-rose-600 font-semibold">
                <AlertTriangle size={12} /> Out of Stock!
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <FormField
            label="Quantity"
            name={`qty_${index}`}
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onChange(index, "quantity", e.target.value)}
            error={error || stockError ? undefined : undefined}
            required
          />
          <FormField
            label="Price"
            name={`price_${index}`}
            type="number"
            step="0.01"
            value={item.price}
            onChange={(e) => onChange(index, "price", e.target.value)}
          />
          <FormField
            label="Tax"
            name={`tax_${index}`}
            type="number"
            step="0.01"
            value={item.tax}
            onChange={(e) => onChange(index, "tax", e.target.value)}
          />
        </div>

        {stockError && (
          <div className="flex items-start gap-2 p-2 bg-rose-50 rounded-lg border border-rose-200">
            <AlertTriangle
              size={14}
              className="text-rose-500 mt-0.5 shrink-0"
            />
            <p className="text-xs text-rose-600">
              Only {stockError.available} units available (requested:{" "}
              {stockError.requested})
            </p>
          </div>
        )}
      </div>
    );
  },
);
SaleItemRow.displayName = "SaleItemRow";

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const SaleModal = ({ isOpen, onClose, saleData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(saleData);

  const creating = useSelector((s) => s.sales?.creating ?? false);
  const medicines = useSelector(
    (s) => s.medicine?.medicines || s.medicine?.data || [],
  );

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchAllMedicines());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    if (saleData) {
      dispatchAction({
        type: "SET_ITEMS",
        items: saleData.items?.map((item) => ({
          item_id: item.item_id || item.medicine?.id || "",
          quantity: Number(item.quantity || 1),
          price: Number(item.price || 0),
          discount: Number(item.discount || 0),
          tax: Number(item.tax || 0),
        })) || [emptyItem()],
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, saleData]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const handleItemChange = useCallback(
    (index, field, value) => {
      const items = [...state.form.items];

      if (field === "item_id") {
        const med = medicines.find((m) => String(m.id) === String(value));
        items[index] = {
          ...items[index],
          item_id: value,
          price: med ? Number(med.price || med.selling_price || 0) : 0,
        };
      } else {
        items[index] = { ...items[index], [field]: value };
      }

      dispatchAction({ type: "SET_ITEMS", items });

      if (field === "quantity" || field === "item_id") {
        const stockErrors = checkStockAvailability(medicines, items);
        dispatchAction({ type: "SET_STOCK_ERRORS", stockErrors });
      }
    },
    [state.form.items, medicines],
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
      const items = state.form.items.filter((_, i) => i !== index);
      dispatchAction({ type: "SET_ITEMS", items });
      dispatchAction({
        type: "SET_STOCK_ERRORS",
        stockErrors: checkStockAvailability(medicines, items),
      });
    },
    [state.form.items, medicines],
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

  const hasStockIssues = Object.keys(state.stockErrors).length > 0;

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

      const insufficient = checkStockAvailability(medicines, state.form.items);
      if (Object.keys(insufficient).length) {
        const messages = Object.values(insufficient)
          .map(
            (s) =>
              `${s.name}: Available ${s.available}, Requested ${s.requested}`,
          )
          .join("\n");
        toast.error(`Insufficient stock!\n${messages}`, { duration: 5000 });
        dispatchAction({ type: "SET_STOCK_ERRORS", stockErrors: insufficient });
        return;
      }

      const payload = {
        patient_name: state.form.patient_name,
        payment_method: state.form.payment_method,
        payment_status: "Pending",
        date: state.form.date,
        bank: state.form.payment_method === "Online" ? state.form.bank : "",
        discount: Number(state.form.discount),
        items: state.form.items.map((it) => ({
          item_id: Number(it.item_id),
          quantity: Number(it.quantity),
          price: Number(it.price),
          discount: Number(it.discount),
          tax: Number(it.tax),
        })),
      };

      try {
        const res = await dispatch(createSale(payload)).unwrap();
        toast.success(res?.message || "Sale created successfully!");
        dispatch(fetchAllSales());
        close();
      } catch (err) {
        toast.error(err?.message || "Operation failed.");
      }
    },
    [state.form, medicines, dispatch, close],
  );

  /* -------------------------------- Render ------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={creating}
      title={
        <>
          {isEditMode ? "Edit Sale Order" : "Create Sale Order"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle="Fill in the details below to process a new sale"
      icon={<Wallet size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <FormField
          label="Full Name"
          icon={User}
          name="patient_name"
          value={state.form.patient_name}
          onChange={handleChange}
          disabled={creating}
          placeholder="e.g., Ali Khan"
          error={state.errors.patient_name}
          required
        />

        {/* Items */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CreditCard size={16} className="text-[#00A3AD]" />
              Sale Items
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={creating}
              className="text-xs font-semibold text-[#00A3AD] hover:text-[#008C94]"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {state.form.items.map((item, index) => (
              <SaleItemRow
                key={index}
                index={index}
                item={item}
                medicines={medicines}
                error={state.errors[`item_${index}_item_id`]}
                stockError={state.stockErrors[index]}
                onChange={handleItemChange}
                onRemove={handleRemoveItem}
                canRemove={state.form.items.length > 1}
              />
            ))}
          </div>
        </div>

        <FormField
          label="Discount"
          name="discount"
          type="number"
          value={state.form.discount}
          onChange={handleChange}
          disabled={creating}
          placeholder="0"
        />

        <FormField
          label="Date"
          name="date"
          type="date"
          value={state.form.date}
          onChange={handleChange}
          disabled={creating}
          error={state.errors.date}
          required
        />

        {/* Payment method */}
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
            disabled={creating}
            options={BANKS}
          />
        )}

        {/* Payment status - read only */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Payment Status
          </label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">
              Pending
            </span>
          </div>
        </div>

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
            disabled={creating}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating || hasStockIssues}
            title={
              hasStockIssues
                ? "Cannot proceed - some items have insufficient stock"
                : ""
            }
            className={`rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50 ${
              hasStockIssues
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-[#034A52] hover:bg-[#02373d] shadow-[#034A52]/20"
            }`}
          >
            {creating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet size={16} />
                Confirm Order
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default SaleModal;
