/**
 * @file SupplierModal.jsx
 * @module Modals/SupplierModal
 * @description Supplier create / update modal.
 */

import { useReducer, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  Sparkles,
  Edit,
} from "lucide-react";
import {
  createSupplier,
  updateSupplier,
  fetchAllSuppliers,
} from "../../../redux/slices/Supplier.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_FORM = {
  company_name: "",
  contact_person: "",
  phone: "",
  email: "",
  address: "",
};

const initialState = { form: DEFAULT_FORM, errors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { form: DEFAULT_FORM, errors: {} };
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
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

const validate = (form) => {
  const errors = {};
  if (!form.company_name.trim())
    errors.company_name = "Company name is required";
  if (!form.contact_person.trim())
    errors.contact_person = "Contact person is required";
  if (!form.phone.trim()) errors.phone = "Phone number is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const SupplierModal = ({ isOpen, onClose, supplierData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(supplierData);

  const creating = useSelector((s) => s.suppliers?.creating ?? false);
  const updating = useSelector((s) => s.suppliers?.updating ?? false);
  const isSubmitting = creating || updating;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!isOpen) return;
    if (supplierData) {
      dispatchAction({
        type: "INIT",
        form: {
          company_name: supplierData.company_name || "",
          contact_person: supplierData.contact_person || "",
          phone: supplierData.phone || "",
          email: supplierData.email || "",
          address: supplierData.address || "",
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, supplierData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors in the form.");
        return;
      }

      try {
        if (isEditMode) {
          const id = supplierData.id || supplierData._id;
          await dispatch(updateSupplier({ id, ...state.form })).unwrap();
          toast.success("Supplier updated successfully!");
        } else {
          await dispatch(createSupplier(state.form)).unwrap();
          toast.success("Supplier created successfully!");
        }
        dispatch(fetchAllSuppliers());
        close();
      } catch (err) {
        toast.error(err?.message || "Operation failed.");
      }
    },
    [state.form, isEditMode, supplierData, dispatch, close],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isSubmitting}
      title={
        <>
          {isEditMode ? "Update Supplier" : "Add New Supplier"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update supplier details"
          : "Add a new supplier to inventory"
      }
      icon={isEditMode ? <Edit size={22} /> : <Truck size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <FormField
          label="Company Name"
          icon={Building2}
          name="company_name"
          value={state.form.company_name}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g., GSK Pharmaceuticals"
          error={state.errors.company_name}
          required
        />

        <FormField
          label="Contact Person"
          icon={User}
          name="contact_person"
          value={state.form.contact_person}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g., Ali Khan"
          error={state.errors.contact_person}
          required
        />

        <FormField
          label="Phone"
          icon={Phone}
          name="phone"
          type="tel"
          value={state.form.phone}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="0300-1234567"
          error={state.errors.phone}
          required
        />

        <FormField
          label="Email"
          hint="Optional"
          icon={Mail}
          name="email"
          type="email"
          value={state.form.email}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="supplier@email.com"
        />

        <FormField
          label="Address"
          hint="Optional"
          icon={MapPin}
          name="address"
          multiline
          rows={2}
          value={state.form.address}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="Supplier address..."
        />

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
            disabled={isSubmitting}
            className="rounded-xl bg-[#034A52] hover:bg-[#02373d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#034A52]/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : isEditMode ? (
              "Update Supplier"
            ) : (
              "Save Supplier"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default SupplierModal;