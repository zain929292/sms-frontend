/**
 * @file Role.modal.util.jsx
 * @module RoleModal
 * @description Role create / update modal (name + description).
 */

import { useReducer, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { Shield, FileText, Edit, Sparkles } from "lucide-react";
import {
  createRole,
  updateRole,
  fetchRoles,
} from "../../../redux/slices/Roles.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_FORM = { name: "", description: "" };
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
  if (!form.name.trim()) errors.name = "Role name is required";
  else if (form.name.trim().length < 3)
    errors.name = "Role name must be at least 3 characters";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const RoleModal = ({ isOpen, onClose, roleData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(roleData);

  const creating = useSelector((s) => s.roles?.creating ?? false);
  const updating = useSelector((s) => s.roles?.updating ?? false);
  const loading = useSelector((s) => s.roles?.loading ?? false);
  const isLoading = creating || updating || loading;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!isOpen) return;
    if (roleData) {
      dispatchAction({
        type: "INIT",
        form: {
          name: roleData.name || "",
          description: roleData.description || "",
        },
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, roleData]);

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

      const payload = {
        name: state.form.name.trim(),
        description: state.form.description.trim(),
      };

      try {
        if (isEditMode) {
          const id = roleData.id || roleData._id;
          const res = await dispatch(
            updateRole({ id, data: payload }),
          ).unwrap();
          toast.success(res?.message || "Role updated successfully!");
        } else {
          const res = await dispatch(createRole(payload)).unwrap();
          toast.success(res?.message || "Role created successfully!");
        }
        dispatch(fetchRoles());
        close();
      } catch (err) {
        const errorMessage =
          typeof err === "string"
            ? err
            : err?.message || err?.error || "Failed to process role request.";
        toast.error(errorMessage);
      }
    },
    [state.form, isEditMode, roleData, dispatch, close],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Update Role" : "Create New Role"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Modify role details"
          : "Define a new role for the system"
      }
      icon={isEditMode ? <Edit size={22} /> : <Shield size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <FormField
          label="Role Name"
          icon={Shield}
          name="name"
          value={state.form.name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g. admin, doctor, nurse"
          error={state.errors.name}
          required
        />

        <FormField
          label="Description"
          icon={FileText}
          name="description"
          multiline
          rows={3}
          value={state.form.description}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="Short description about this role..."
        />

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
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:shadow-teal-900/30 hover:opacity-95 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {isEditMode ? <Edit size={16} /> : <Shield size={16} />}
                {isEditMode ? "Update Role" : "Create Role"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default RoleModal;