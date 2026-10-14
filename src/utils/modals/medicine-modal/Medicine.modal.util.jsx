/**
 * @file Medicine.modal.util.jsx
 * @module MedicineModal
 * @description Medicine create / update modal with supplier selection.
 *              Expiry date is auto-calculated (today + 1 year) and read-only.
 *              Save/Update button shows a spinner while submitting.
 *              Note: `purchase_price` removed (not in backend schema).
 *              Supplier is matched by `company` name because backend does
 *              not return `supplier_id` in the medicines list.
 */

import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Pill,
  Building2,
  Package,
  Banknote,
  Calendar,
  Sparkles,
  Edit,
  Loader2,
} from "lucide-react";
import {
  createMedicine,
  updateMedicine,
  fetchAllMedicines,
} from "../../../redux/slices/Medicine.slice.redux";
import { fetchAllSuppliers } from "../../../redux/slices/Supplier.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns today + 1 year as YYYY-MM-DD (local time).
 * e.g. today 2026-10-07 → "2027-10-07"
 */
const getOneYearFromToday = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Resolve the supplier for edit mode.
 * Priority: supplier_id → company name (case-insensitive) → null
 */
const resolveSupplier = (suppliers, initialData) => {
  if (!initialData) return null;
  if (initialData.supplier_id) {
    const byId = suppliers.find(
      (s) => String(s.id) === String(initialData.supplier_id),
    );
    if (byId) return byId;
  }
  if (initialData.company) {
    const lc = String(initialData.company).toLowerCase();
    return (
      suppliers.find((s) => String(s.company_name || "").toLowerCase() === lc) ||
      null
    );
  }
  return null;
};

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_FORM = {
  name: "",
  company: "",
  supplier_id: "",
  stock: "",
  price: "",
  expiry_date: getOneYearFromToday(),
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const initialState = {
  form: DEFAULT_FORM,
  errors: {},
  supplierSearchTerm: "",
  supplierDropdownOpen: false,
  submitting: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {
        ...initialState,
        form: {
          ...DEFAULT_FORM,
          expiry_date: getOneYearFromToday(),
        },
      };
    case "INIT":
      return {
        ...initialState,
        form: action.form,
        supplierSearchTerm: action.supplierSearchTerm || "",
      };
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };
    case "SET_SEARCH":
      return { ...state, [action.field]: action.value };
    case "SELECT_SUPPLIER":
      return {
        ...state,
        form: {
          ...state.form,
          supplier_id: action.supplier.id,
          company: action.supplier.company_name || "",
        },
        supplierSearchTerm: action.supplier.company_name || "",
        supplierDropdownOpen: false,
        errors: { ...state.errors, supplier_id: "" },
      };
    case "CLEAR_SUPPLIER":
      return {
        ...state,
        form: { ...state.form, supplier_id: "", company: "" },
        supplierSearchTerm: "",
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.value };
    default:
      return state;
  }
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Medicine name is required";
  if (!form.company.trim()) errors.company = "Company name is required";
  if (!form.supplier_id) errors.supplier_id = "Please select a supplier";
  if (!form.price) errors.price = "Selling price is required";
  else if (parseFloat(form.price) < 0)
    errors.price = "Price cannot be negative";
  if (!form.stock) errors.stock = "Stock quantity is required";
  else if (parseInt(form.stock, 10) < 0)
    errors.stock = "Stock cannot be negative";
  if (!form.expiry_date) errors.expiry_date = "Expiry date is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const MedicineModal = ({ isOpen, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(initialData);

  const reduxLoading = useSelector(
    (s) => (s.pharmacy || s.medicine)?.loading ?? false,
  );
  const suppliers = useSelector(
    (s) => s.suppliers?.suppliers || s.suppliers?.data || [],
  );
  const suppliersLoading = useSelector((s) => s.suppliers?.loading ?? false);

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchAllSuppliers());
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      // ✅ Resolve supplier by id OR by company name
      const supplier = resolveSupplier(suppliers, initialData);

      dispatchAction({
        type: "INIT",
        form: {
          name: initialData.name || "",
          company: supplier?.company_name || initialData.company || "",
          // Take supplier.id if resolved, else keep whatever backend sent
          supplier_id: supplier?.id ?? initialData.supplier_id ?? "",
          stock: initialData.stock || "",
          price: initialData.price || "",
          expiry_date: initialData.expiry_date
            ? initialData.expiry_date.split("T")[0]
            : getOneYearFromToday(),
        },
        supplierSearchTerm: supplier?.company_name || initialData.company || "",
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, initialData, suppliers]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    if (state.submitting) return;
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose, state.submitting]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const handleSupplierSearch = useCallback((value) => {
    dispatchAction({ type: "SET_SEARCH", field: "supplierSearchTerm", value });
    if (value === "") dispatchAction({ type: "CLEAR_SUPPLIER" });
  }, []);

  const filterSupplier = useCallback((s, term) => {
    if (!term) return true;
    const l = term.toLowerCase();
    return (
      s.company_name?.toLowerCase().includes(l) ||
      s.contact_person?.toLowerCase().includes(l) ||
      s.phone?.includes(term)
    );
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (state.submitting) return;

      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors before submitting.");
        return;
      }

      dispatchAction({ type: "SET_SUBMITTING", value: true });

      const payload = {
        name: state.form.name,
        company: state.form.company,
        supplier_id: Number(state.form.supplier_id),
        stock: Number(state.form.stock),
        price: Number(state.form.price),
        expiry_date: state.form.expiry_date,
      };

      try {
        if (isEditMode) {
          const id = initialData.id || initialData._id;
          const res = await dispatch(
            updateMedicine({ id, ...payload }),
          ).unwrap();
          toast.success(res?.message || "Medicine updated successfully!");
        } else {
          const res = await dispatch(createMedicine(payload)).unwrap();
          toast.success(res?.message || "Medicine added successfully!");
        }
        dispatch(fetchAllMedicines());
        dispatchAction({ type: "RESET" });
        onClose();
      } catch (err) {
        toast.error(
          err?.message ||
            `Failed to ${isEditMode ? "update" : "create"} medicine.`,
        );
        if (err?.errors) {
          const fieldErrors = {};
          Object.keys(err.errors).forEach((k) => {
            fieldErrors[k] = err.errors[k][0];
          });
          dispatchAction({ type: "SET_ERRORS", errors: fieldErrors });
        }
      } finally {
        dispatchAction({ type: "SET_SUBMITTING", value: false });
      }
    },
    [state.form, state.submitting, isEditMode, initialData, dispatch, onClose],
  );

  const isLoading = reduxLoading || suppliersLoading;
  const isSubmitting = state.submitting;
  const hasSuppliers = suppliers.length > 0;

  // Human-readable display of expiry (e.g. "07 Oct 2027")
  const expiryDisplay = useMemo(() => {
    if (!state.form.expiry_date) return "";
    try {
      return new Date(state.form.expiry_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return state.form.expiry_date;
    }
  }, [state.form.expiry_date]);

  /* -------------------------------- Render ------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading || isSubmitting}
      title={
        <>
          {isEditMode ? "Update Medicine" : "Add New Medicine"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update details for selected medicine"
          : "Enter medicine details to add to inventory"
      }
      icon={isEditMode ? <Edit size={22} /> : <Pill size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              label="Medicine Name"
              icon={Pill}
              name="name"
              value={state.form.name}
              onChange={handleChange}
              disabled={isLoading || isSubmitting}
              placeholder="Paracetamol 500mg"
              error={state.errors.name}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <SearchableSelect
              label="Supplier"
              icon={Building2}
              placeholder="Search supplier by name, contact person, or phone..."
              searchTerm={state.supplierSearchTerm}
              onSearchChange={handleSupplierSearch}
              items={suppliers}
              filterFn={filterSupplier}
              isOpen={state.supplierDropdownOpen}
              onOpenChange={(open) =>
                dispatchAction({
                  type: "SET_SEARCH",
                  field: "supplierDropdownOpen",
                  value: open,
                })
              }
              onSelect={(s) =>
                dispatchAction({ type: "SELECT_SUPPLIER", supplier: s })
              }
              error={state.errors.supplier_id}
              avatarClass="bg-teal-50 text-[#034A52]"
              emptyMessage={
                suppliersLoading
                  ? "Loading suppliers..."
                  : "No suppliers found. Please add a supplier first."
              }
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              label="Company"
              icon={Building2}
              name="company"
              value={state.form.company}
              disabled
              placeholder="Select a supplier to auto-fill"
              error={state.errors.company}
              hint="Auto-filled from selected supplier"
            />
          </div>

          <div className="sm:col-span-2">
            <FormField
              label="Selling Price (PKR)"
              icon={Banknote}
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={state.form.price}
              onChange={handleChange}
              disabled={isLoading || isSubmitting}
              placeholder="250"
              error={state.errors.price}
              required
            />
          </div>

          <FormField
            label="Stock Quantity"
            icon={Package}
            name="stock"
            type="number"
            min="0"
            value={state.form.stock}
            onChange={handleChange}
            disabled={isLoading || isSubmitting}
            placeholder="100"
            error={state.errors.stock}
            required
          />

          <div className="relative">
            <FormField
              label="Expiry Date"
              icon={Calendar}
              name="expiry_date"
              type="text"
              value={expiryDisplay}
              disabled
              readOnly
              error={state.errors.expiry_date}
            />
            <input
              type="hidden"
              name="expiry_date"
              value={state.form.expiry_date}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isLoading || isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || isSubmitting || !hasSuppliers}
            title={!hasSuppliers ? "No suppliers available" : ""}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
              !hasSuppliers
                ? "bg-slate-400"
                : "bg-[#034A52] hover:bg-[#02373d] shadow-[#034A52]/20"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                {isEditMode ? <Edit size={16} /> : <Pill size={16} />}
                {isEditMode ? "Update Medicine" : "Save Medicine"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default MedicineModal;