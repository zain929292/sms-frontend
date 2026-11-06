import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Lock,
  Sparkles,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

const initialForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role: "",
};

const UserModal = ({
  open,
  user,
  roles = [],
  saving = false,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const isEdit = Boolean(user?.id);

  useEffect(() => {
    if (!open) return;

    const userRole =
      user?.role_id ??
      user?.role?.id ??
      (Array.isArray(user?.roles) ? user.roles[0]?.id : null) ??
      (typeof user?.role === "string" ? user.role : null) ??
      "";

    setForm({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      password_confirmation: "",
      role: userRole !== "" ? String(userRole) : "",
    });

    setErrors({});
  }, [open, user]);

  const handleClose = () => {
    if (saving) return;

    setForm({ ...initialForm });
    setErrors({});
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "password"
        ? { password_confirmation: "" }
        : {}),
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!isEdit && !form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password && form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!isEdit || form.password) {
      if (!form.password_confirmation) {
        nextErrors.password_confirmation =
          "Please confirm your password.";
      } else if (form.password !== form.password_confirmation) {
        nextErrors.password_confirmation =
          "Passwords do not match.";
      }
    }

    if (!form.role) {
      nextErrors.role = "Please select a role.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: Number(form.role),
    };

    if (!isEdit || form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }

    await onSubmit?.(payload);
  };

  const roleOptions = [
    { value: "", label: "Select a role" },
    ...roles.map((role) => ({
      value: String(role.id),
      label: role.name,
    })),
  ];

  if (!open) return null;

  return (
    <ModalShell
      isOpen={open}
      onClose={handleClose}
      disabled={saving}
      title={
        <>
          {isEdit ? "Update User" : "Register New User"}
          <Sparkles
            size={16}
            className="ml-1 inline text-cyan-500"
          />
        </>
      }
      subtitle="Enter account credentials and role assignment"
      icon={<User size={22} />}
      iconClass="from-[#00A3AD] to-cyan-500"
      accentShadow="shadow-cyan-900/20"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Full Name"
            icon={User}
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={saving}
            placeholder="Enter user name"
            error={errors.name}
            required
          />

          <FormField
            label="Email Address"
            icon={Mail}
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            disabled={saving}
            placeholder="user@example.com"
            error={errors.email}
            required
          />

          <FormField
            label={isEdit ? "New Password (Optional)" : "Password"}
            icon={Lock}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            disabled={saving}
            placeholder={
              isEdit
                ? "Leave blank to keep current password"
                : "Minimum 8 characters"
            }
            error={errors.password}
            required={!isEdit}
          />

          <FormField
            label="Confirm Password"
            icon={Lock}
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            disabled={saving}
            placeholder="Confirm password"
            error={errors.password_confirmation}
            required={!isEdit || Boolean(form.password)}
          />

          <div className="sm:col-span-2">
            <FormField
              label="Role Assignment"
              icon={ShieldCheck}
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={saving || roles.length === 0}
              error={errors.role}
              options={roleOptions}
              required
            />
          </div>
        </div>

        {roles.length === 0 && (
          <p className="mt-3 text-xs text-amber-600">
            No roles available. Please load roles from the API first.
          </p>
        )}

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
            disabled={saving || roles.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00A3AD] to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all duration-200 hover:opacity-95 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <User size={16} />
                {isEdit ? "Update User" : "Create User"}
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default UserModal;
