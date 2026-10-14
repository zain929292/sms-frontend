/**
 * @file User.modal.util.jsx
 * @module UserModal
 * @description User registration modal with dynamic role selection (role name/string based).
 */

import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { User, Mail, ShieldCheck, Lock, Sparkles } from "lucide-react";
import {
  registerUser,
  getAllUsers,
} from "../../../redux/slices/Auth.slice.redux";
import { fetchRoles } from "../../../redux/slices/Roles.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_FORM = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "", // ✅ Changed from role_id to role
};

const EMAIL_RE = /\S+@\S+\.\S+/;

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "User name is required";

  if (!form.email.trim()) errors.email = "Email address is required";
  else if (!EMAIL_RE.test(form.email.trim()))
    errors.email = "Invalid email format";

  if (!form.password.trim()) errors.password = "Password is required";
  else if (form.password.trim().length < 6)
    errors.password = "Password must be at least 6 characters";

  if (!form.password_confirmation.trim())
    errors.password_confirmation = "Please confirm your password";
  else if (form.password.trim() !== form.password_confirmation.trim())
    errors.password_confirmation = "Passwords do not match";

  if (!form.role) errors.role = "The role field is required."; // ✅ Updated error check
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                                   Reducer                                  */
/* -------------------------------------------------------------------------- */

const initialState = { form: DEFAULT_FORM, errors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { form: DEFAULT_FORM, errors: {} };
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
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

const UserModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const creating = useSelector((s) => s.auth?.creating ?? false);
  const loading = useSelector((s) => s.auth?.loading ?? false);

  // ✅ Flexible selector to support both "role" and "roles" store state names
  const rolesState = useSelector((s) => s.role ?? s.roles ?? {});
  const roles = rolesState?.roles ?? (Array.isArray(rolesState) ? rolesState : []);
  const rolesLoading = rolesState?.loading ?? false;

  const isLoading = creating || loading;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchRoles());
    dispatchAction({ type: "RESET" });
  }, [isOpen, dispatch]);

  // Auto-select first role name once fetched (only if none selected)
  useEffect(() => {
    if (roles.length > 0 && !state.form.role) {
      dispatchAction({
        type: "SET_FIELD",
        field: "role",
        value: roles[0].name, // ✅ using role name/string instead of id
      });
    }
  }, [roles, state.form.role]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors in the form before submitting.");
        return;
      }

      const payload = {
        name: state.form.name.trim(),
        email: state.form.email.trim(),
        password: state.form.password.trim(),
        password_confirmation: state.form.password_confirmation.trim(),
        role: state.form.role.trim(), // ✅ Sending 'role' field in payload
      };

      try {
        const res = await dispatch(registerUser(payload)).unwrap();
        toast.success(res?.message || "User added successfully!");
        dispatch(getAllUsers());
        close();
      } catch (err) {
        toast.error(
          typeof err === "string"
            ? err
            : err?.message || "Failed to create user record.",
        );
      }
    },
    [state.form, dispatch, close],
  );

  /* --------------------------- Role dropdown ---------------------------- */

  const roleOptions = useMemo(() => {
    if (rolesLoading) return [{ value: "", label: "Loading roles..." }];
    if (!roles.length) return [{ value: "", label: "No roles available" }];

    // Map fetched roles (using role name as value)
    const options = roles.map((r) => ({
      value: r.name, // ✅ role name as value
      label: r.name, // display name
    }));

    // Include default prompt option
    return [{ value: "", label: "Select Role Assignment" }, ...options];
  }, [roles, rolesLoading]);

  /* ------------------------------- Render -------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          Register New User
          <Sparkles size={16} className="text-cyan-500 inline ml-1" />
        </>
      }
      subtitle="Enter account credentials and role assignment"
      icon={<User size={22} />}
      iconClass="from-[#00A3AD] to-cyan-500"
      accentShadow="shadow-cyan-900/20"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <FormField
          label="Full Name"
          icon={User}
          name="name"
          value={state.form.name}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g. John Doe"
          error={state.errors.name}
          required
        />

        <FormField
          label="Email Address"
          icon={Mail}
          name="email"
          type="email"
          value={state.form.email}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="e.g. user@gmail.com"
          error={state.errors.email}
          required
        />

        <FormField
          label="Password"
          icon={Lock}
          name="password"
          type="password"
          value={state.form.password}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="••••••••"
          error={state.errors.password}
          required
        />

        <FormField
          label="Confirm Password"
          icon={Lock}
          name="password_confirmation"
          type="password"
          value={state.form.password_confirmation}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="••••••••"
          error={state.errors.password_confirmation}
          required
        />

        <FormField
          label="Role Assignment"
          icon={ShieldCheck}
          name="role"
          value={state.form.role}
          onChange={handleChange}
          disabled={isLoading || rolesLoading}
          error={state.errors.role}
          options={roleOptions}
          required
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
            className="rounded-xl bg-gradient-to-r from-[#00A3AD] to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all duration-200 hover:shadow-cyan-900/30 hover:opacity-95 active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <User size={16} />
                Save Record
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default UserModal;