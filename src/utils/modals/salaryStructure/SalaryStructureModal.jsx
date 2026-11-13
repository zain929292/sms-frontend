
import { useEffect, useState } from "react";
import {
  Wallet,
  UserRound,
  Banknote,
  ClipboardList,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

import { getUsers } from "../../../redux/api_data/userApi/userApi";

const EMPTY_FORM = {
  user_id: "",
  basic_salary: "",
  allowances: "0",
  status: "active",
  remarks: "",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const SalaryStructureModal = ({
  isOpen,
  onClose,
  selectedSalaryStructure,
  onSubmit,
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [users, setUsers] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isEdit = Boolean(selectedSalaryStructure?.id);

  // Fetch users
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const response = await getUsers({ page: 1, limit: 100 });

        const payload = response?.data?.data;

        const userList = Array.isArray(payload)
          ? payload
          : payload?.data || [];

        setUsers(userList);

        const options = userList.map((user) => ({
          value: String(user.id),
          label: user.name,
          ...user,
        }));

        setStaffOptions(options);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setStaffOptions([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    const source = selectedSalaryStructure || {};

    const nextForm = {
      ...EMPTY_FORM,
      user_id: String(source.user_id ?? ""),
      basic_salary: source.basic_salary ?? "",
      allowances: source.allowances ?? "0",
      status: source.status || "active",
      remarks: source.remarks || "",
    };

    setForm(nextForm);

    setStaffSearch(
      source.user_name || source.user?.name || ""
    );

    setOpenDropdown(null);
    setErrors({});
  }, [isOpen, selectedSalaryStructure]);

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Staff search filter
  const staffFilter = (item, search) =>
    `${item.label ?? ""} ${item.value ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Select staff
  const handleSelectStaff = (item) => {
    setForm((prev) => ({
      ...prev,
      user_id: String(item.value),
    }));

    setStaffSearch(item.label);
    setOpenDropdown(null);

    setErrors((prev) => ({
      ...prev,
      user_id: "",
    }));
  };

  // Close modal
  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    onClose();
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.user_id) {
      newErrors.user_id = "Please select a staff member.";
    }

    if (
      form.basic_salary === "" ||
      Number(form.basic_salary) < 0 ||
      !Number.isFinite(Number(form.basic_salary))
    ) {
      newErrors.basic_salary = "Please enter a valid basic salary.";
    }

    if (
      form.allowances !== "" &&
      (Number(form.allowances) < 0 ||
        !Number.isFinite(Number(form.allowances)))
    ) {
      newErrors.allowances = "Please enter valid allowances.";
    }

    if (!form.status) {
      newErrors.status = "Please select a status.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      user_id: Number(form.user_id),
      basic_salary: Number(form.basic_salary),
      allowances:
        form.allowances === "" ? 0 : Number(form.allowances),
      status: form.status,
      remarks: form.remarks.trim() || null,
    });
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEdit
          ? "Update Salary Structure"
          : "Create Salary Structure"
      }
      subtitle="Manage staff basic salary and allowances."
      icon={<Wallet size={22} />}
      maxWidth="max-w-3xl"
      disabled={saving}
    >
      <div
        className={`origin-center transform transition-all duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Staff Member */}
            <div className="sm:col-span-2">
              <SearchableSelect
                label="Staff Member"
                icon={UserRound}
                placeholder={
                  loadingUsers
                    ? "Loading staff..."
                    : "Search staff member..."
                }
                searchTerm={staffSearch}
                onSearchChange={(value) => {
                  setStaffSearch(value);

                  setForm((prev) => ({
                    ...prev,
                    user_id: "",
                  }));

                  setErrors((prev) => ({
                    ...prev,
                    user_id: "",
                  }));
                }}
                items={staffOptions}
                isOpen={openDropdown === "staff"}
                onOpenChange={(open) =>
                  setOpenDropdown(open ? "staff" : null)
                }
                filterFn={staffFilter}
                onSelect={handleSelectStaff}
                disabled={isEdit || loadingUsers || saving}
                itemRenderer={(item) => (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-800">
                      {item.label}
                    </p>

                    <span className="text-[11px] text-slate-400">
                      ID: {item.value}
                    </span>
                  </div>
                )}
                emptyMessage="No staff members found."
              />

              {errors.user_id && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.user_id}
                </p>
              )}
            </div>

            {/* Basic Salary */}
            <div>
              <FormField
                label="Basic Salary"
                name="basic_salary"
                type="number"
                value={form.basic_salary}
                onChange={handleChange}
                placeholder="Enter basic salary"
                required
                disabled={saving}
              />

              {errors.basic_salary && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.basic_salary}
                </p>
              )}
            </div>

            {/* Allowances */}
            <div>
              <FormField
                label="Allowances"
                name="allowances"
                type="number"
                value={form.allowances}
                onChange={handleChange}
                placeholder="Enter allowances"
                disabled={saving}
              />

              {errors.allowances && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.allowances}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <FormField
                label="Status"
                name="status"
                value={form.status}
                onChange={handleChange}
                options={STATUS_OPTIONS}
                required
                disabled={saving}
              />

              {errors.status && (
                <p className="mt-1 text-xs font-medium text-red-500">
                  {errors.status}
                </p>
              )}
            </div>

            {/* Remarks */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Remarks
              </label>

              <textarea
                name="remarks"
                rows={3}
                maxLength={255}
                value={form.remarks}
                onChange={handleChange}
                disabled={saving}
                placeholder="Enter salary structure remarks..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:opacity-50"
              />

              <p className="mt-1 text-right text-[11px] text-slate-400">
                {form.remarks.length}/255
              </p>
            </div>
          </div>

          {/* Footer */}
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
              disabled={saving || loadingUsers}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Salary Structure"
                  : "Save Salary Structure"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default SalaryStructureModal;
