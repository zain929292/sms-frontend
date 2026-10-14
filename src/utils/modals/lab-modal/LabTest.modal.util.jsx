/**
 * @file LabTestModal.jsx
 * @module LabTestModal
 * @description Lab test create / update modal with category dropdown support.
 */

import { useReducer, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { FlaskConical, Folder, Edit, Sparkles, FileText } from "lucide-react";
import {
  createLabTest,
  updateLabTest,
  fetchAllLabTests,
} from "../../../redux/slices/Lab.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_FORM = {
  test_name: "",
  category: "",
  price: "",
  sample_type: "blood",
  description: "",
  status: "active",
};

const CATEGORY_OPTIONS = [
  { value: "Hematology", label: "Hematology" },
  { value: "Biochemistry", label: "Biochemistry" },
  { value: "Microbiology", label: "Microbiology" },
  { value: "Pathology", label: "Pathology" },
  { value: "Immunology", label: "Immunology" },
  { value: "Radiology", label: "Radiology" },
];

const SAMPLE_TYPES = ["blood", "urine", "stool", "saliva", "other"].map(
  (t) => ({ value: t, label: t.toUpperCase() }),
);

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

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

const validate = (form) => {
  const errors = {};
  if (!form.test_name.trim()) errors.test_name = "Test name is required";
  if (!form.category) errors.category = "Category is required";
  if (!form.price) errors.price = "Price is required";
  else if (parseFloat(form.price) < 0)
    errors.price = "Price cannot be negative";
  if (!form.sample_type) errors.sample_type = "Sample type is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const LabTestModal = ({ isOpen, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(initialData);

  const loading = useSelector((s) => s.lab?.loading ?? false);
  const [state, dispatchAction] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      dispatchAction({
        type: "INIT",
        form: {
          test_name: initialData.test_name || "",
          category: initialData.category || "",
          price: initialData.price || "",
          sample_type: initialData.sample_type || "blood",
          description: initialData.description || "",
          status: initialData.status || "active",
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, initialData]);

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
        toast.error("Please fix the errors before submitting.");
        return;
      }

      try {
        if (isEditMode) {
          const id = initialData.id || initialData._id;
          await dispatch(updateLabTest({ id, ...state.form })).unwrap();
          toast.success("Lab test updated successfully!");
        } else {
          await dispatch(createLabTest(state.form)).unwrap();
          toast.success("Lab test created successfully!");
        }
        dispatch(fetchAllLabTests());
        close();
      } catch (err) {
        toast.error(err?.message || "Operation failed.");
      }
    },
    [state.form, isEditMode, initialData, dispatch, close],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={loading}
      title={
        <>
          {isEditMode ? "Update Lab Test" : "Add New Lab Test"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update details for selected lab test"
          : "Enter lab test details to add to catalog"
      }
      icon={isEditMode ? <Edit size={22} /> : <FlaskConical size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              label="Test Name"
              icon={FlaskConical}
              name="test_name"
              value={state.form.test_name}
              onChange={handleChange}
              disabled={loading}
              placeholder="Complete Blood Count (CBC)"
              error={state.errors.test_name}
              required
            />
          </div>

          <FormField
            label="Category"
            icon={Folder}
            name="category"
            value={state.form.category}
            onChange={handleChange}
            disabled={loading}
            error={state.errors.category}
            options={CATEGORY_OPTIONS}
            required
          />

          <FormField
            label="Price (PKR)"
            icon={FileText}
            name="price"
            type="number"
            min="0"
            value={state.form.price}
            onChange={handleChange}
            disabled={loading}
            placeholder="1500"
            error={state.errors.price}
            required
          />

          <FormField
            label="Sample Type"
            icon={FlaskConical}
            name="sample_type"
            value={state.form.sample_type}
            onChange={handleChange}
            disabled={loading}
            error={state.errors.sample_type}
            options={SAMPLE_TYPES}
            required
          />

          <FormField
            label="Status"
            icon={Sparkles}
            name="status"
            value={state.form.status}
            onChange={handleChange}
            disabled={loading}
            options={STATUS_OPTIONS}
          />

          <div className="sm:col-span-2">
            <FormField
              label="Description"
              icon={FileText}
              name="description"
              multiline
              rows={2}
              value={state.form.description}
              onChange={handleChange}
              disabled={loading}
              placeholder="Additional details about this test..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#034A52] hover:bg-[#02373d] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#034A52]/20 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : isEditMode ? (
              <>
                <Edit size={16} />
                Update Test
              </>
            ) : (
              <>
                <FlaskConical size={16} />
                Create Test
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default LabTestModal;
