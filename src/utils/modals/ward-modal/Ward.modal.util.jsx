/**
 * @file Ward.modal.util.jsx
 * @module WardModal
 * @description Ward creation / update modal.
 */

import { useReducer, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Building,
  ClipboardList,
  FileText,
  Edit,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  createWard,
  updateWard,
  fetchWards,
} from "../../../redux/slices/Ward.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const WARD_TYPES = [
  { value: "general", label: "General" },
  { value: "icu", label: "ICU" },
  { value: "emergency", label: "Emergency" },
  { value: "pediatric", label: "Pediatric" },
  { value: "maternity", label: "Maternity" },
  { value: "surgical", label: "Surgical" },
  { value: "recovery", label: "Recovery" },
  { value: "private", label: "Private" },
];

const DEFAULT_FORM = {
  id: "",
  name: "",
  type: "",
  floor: "",
  description: "",
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              Validation                                    */
/* -------------------------------------------------------------------------- */

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Ward name is required";
  if (!form.type) errors.type = "Ward type is required";
  if (!form.floor.trim()) errors.floor = "Floor location is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const WardModal = ({ isOpen, onClose, wardData = null, onUpdate }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(wardData);

  const { creating, updating, loading } = useSelector(
    (s) => s.ward ?? { creating: false, updating: false, loading: false },
  );
  const isLoading = creating || updating || loading;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!isOpen) return;
    if (wardData) {
      dispatchAction({
        type: "INIT",
        form: {
          id: wardData.id || wardData._id || "",
          name: wardData.name || "",
          type: (wardData.type || "").toLowerCase(),
          floor: wardData.floor || "",
          description: wardData.description || "",
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, wardData]);

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
        toast.error("Please fix the errors in the form before submitting.");
        return;
      }

      try {
        if (isEditMode) {
          const res = await dispatch(
            updateWard({ id: state.form.id, data: state.form }),
          ).unwrap();
          toast.success(res?.message || "Ward updated successfully!");
          onUpdate?.(state.form);
        } else {
          const { id, ...createData } = state.form;
          const res = await dispatch(createWard(createData)).unwrap();
          toast.success(res?.message || "Ward created successfully!");
          dispatch(fetchWards());
        }
        close();
      } catch (err) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message ||
              `Failed to ${isEditMode ? "update" : "create"} ward record.`;
        toast.error(msg);
      }
    },
    [state.form, isEditMode, dispatch, close, onUpdate],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Update Ward Details" : "Add New Ward"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update existing ward configuration details"
          : "Create and configure a new hospital ward"
      }
      icon={isEditMode ? <Edit size={22} /> : <Building size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              label="Ward Name"
              icon={Building}
              name="name"
              value={state.form.name}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g., General Surgical Ward A"
              error={state.errors.name}
              required
            />
          </div>

          <FormField
            label="Ward Type"
            icon={Layers}
            name="type"
            value={state.form.type}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.type}
            required
            options={WARD_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
          />

          <FormField
            label="Floor / Location"
            icon={ClipboardList}
            name="floor"
            value={state.form.floor}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="e.g. Ground Floor, 2nd Floor"
            error={state.errors.floor}
            required
          />

          <div className="sm:col-span-2">
            <FormField
              label="Description"
              icon={FileText}
              name="description"
              multiline
              rows={3}
              value={state.form.description}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter optional description or notes..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:shadow-teal-900/30 hover:opacity-95 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : isEditMode ? (
              "Update Ward"
            ) : (
              "Create Ward"
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default WardModal;
