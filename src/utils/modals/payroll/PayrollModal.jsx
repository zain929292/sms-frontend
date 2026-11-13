
import { useEffect, useState } from "react";
import {
  Wallet,
  UserRound,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

import { getUsers } from "../../../redux/api_data/userApi/userApi";
import {
  getSalaryStructures,
} from "../../../redux/api_data/salaryStructureApi/salaryStructureApi";

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentMonth = () => getLocalDate().slice(0, 7);

const EMPTY_FORM = {
  user_id: "",
  salary_month: getCurrentMonth(),
  deductions: "0",
  paid_amount: "0",
  payment_date: getLocalDate(),
  remarks: "",
};

const getUserName = (user) =>
  user?.name || user?.full_name || user?.username || "Unknown User";

const getUserRoles = (user) => {
  if (!Array.isArray(user?.roles)) return [];

  return user.roles.map((role) =>
    String(role?.role_name || role?.name || "")
      .toLowerCase()
      .replace(/[\s-]+/g, "_")
  );
};

const isStaffUser = (user) => {
  const roles = getUserRoles(user);

  return (
    Boolean(user?.staff) ||
    roles.some((role) =>
      ["teacher", "staff", "other_staff"].includes(role)
    )
  );
};

const formatAmount = (value) =>
  Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getSalaryStructureList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const PayrollModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedPayroll,
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [salaryStructure, setSalaryStructure] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [staffSearch, setStaffSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const isEdit = Boolean(selectedPayroll?.id);

  // Fetch staff users
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const fetchStaff = async () => {
      setStaffLoading(true);

      try {
        const firstResponse = await getUsers({
          page: 1,
          limit: 100,
        });

        const payload = firstResponse?.data;

        const allUsers = Array.isArray(payload?.data?.data)
          ? [...payload.data.data]
          : Array.isArray(payload?.data)
            ? [...payload.data]
            : [];

        const lastPage = Number(
          payload?.pagination?.last_page ?? 1
        );

        if (lastPage > 1) {
          const requests = [];

          for (let page = 2; page <= lastPage; page++) {
            requests.push(
              getUsers({
                page,
                limit: 100,
              })
            );
          }

          const responses = await Promise.all(requests);

          responses.forEach((response) => {
            const responseData = response?.data;

            const list = Array.isArray(responseData?.data?.data)
              ? responseData.data.data
              : Array.isArray(responseData?.data)
                ? responseData.data
                : [];

            allUsers.push(...list);
          });
        }

        const hasStaffInformation = allUsers.some(
          (user) => user?.staff || Array.isArray(user?.roles)
        );

        const staffUsers = hasStaffInformation
          ? allUsers.filter(isStaffUser)
          : allUsers;

        if (isMounted) {
          setStaff(staffUsers);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Staff Fetch Error:", error);

          toast.error(
            error.response?.data?.message ||
              "Failed to load staff."
          );
        }
      } finally {
        if (isMounted) {
          setStaffLoading(false);
        }
      }
    };

    fetchStaff();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    const source = selectedPayroll || {};

    setForm({
      ...EMPTY_FORM,
      user_id: String(source.user_id ?? ""),
      salary_month:
        source.salary_month ?? EMPTY_FORM.salary_month,
      deductions: String(source.deductions ?? 0),
      paid_amount: String(source.paid_amount ?? 0),
      payment_date: source.payment_date ?? EMPTY_FORM.payment_date,
      remarks: source.remarks ?? "",
    });

    setStaffSearch(source.staff_name ?? "");
    setOpenDropdown(null);
    setSalaryStructure(null);
  }, [isOpen, selectedPayroll]);

  // Find selected staff
  const selectedStaff = staff.find(
    (item) => String(item.id) === String(form.user_id)
  );

  // Fetch selected staff salary structure
  useEffect(() => {
    if (!isOpen || !form.user_id) {
      setSalaryStructure(null);
      setSalaryLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSalaryStructure = async () => {
      setSalaryLoading(true);
      setSalaryStructure(null);

      try {
        const response = await getSalaryStructures({
          user_id: form.user_id,
          page: 1,
          limit: 1,
        });

        const records = getSalaryStructureList(response);

        const structure = records.find(
          (item) =>
            String(item.user_id) === String(form.user_id) &&
            item.status === "active"
        );

        if (isMounted) {
          setSalaryStructure(structure || null);
        }
      } catch (error) {
        if (isMounted) {
          setSalaryStructure(null);

          toast.error(
            error.response?.data?.message ||
              "Failed to fetch salary structure."
          );
        }
      } finally {
        if (isMounted) {
          setSalaryLoading(false);
        }
      }
    };

    fetchSalaryStructure();

    return () => {
      isMounted = false;
    };
  }, [isOpen, form.user_id]);

  // Update form fields
  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  // Close modal
  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    onClose();
  };

  // Select staff
  const selectStaff = (item) => {
    setForm((prev) => ({
      ...prev,
      user_id: String(item.id),
    }));

    setStaffSearch(getUserName(item));
    setOpenDropdown(null);
  };

  // Staff search filter
  const staffFilter = (item, search) =>
    `${getUserName(item)} ${item.email ?? ""} ${item.id ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Salary calculations for preview only
  const basicSalary = Number(salaryStructure?.basic_salary || 0);
  const allowances = Number(salaryStructure?.allowances || 0);

  const deductions = Number(form.deductions || 0);
  const paidAmount = Number(form.paid_amount || 0);

  const estimatedNetSalary =
    basicSalary + allowances - deductions;

  const remainingAmount =
    estimatedNetSalary - paidAmount;

  const invalidAmounts =
    !Number.isFinite(deductions) ||
    !Number.isFinite(paidAmount) ||
    deductions < 0 ||
    paidAmount < 0;

  const invalidNetSalary =
    estimatedNetSalary < 0;

  const invalidPaidAmount =
    paidAmount > estimatedNetSalary;

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.user_id) {
      toast.error("Please select a staff member.");
      return;
    }

    if (!form.salary_month) {
      toast.error("Please select salary month.");
      return;
    }

    if (!salaryStructure) {
      toast.error("No active salary structure found.");
      return;
    }

    if (invalidAmounts || invalidNetSalary) {
      toast.error("Please enter valid salary amounts.");
      return;
    }

    if (invalidPaidAmount) {
      toast.error("Paid amount cannot be greater than net salary.");
      return;
    }

    onSubmit({
      user_id: Number(form.user_id),
      salary_month: form.salary_month,
      deductions,
      paid_amount: paidAmount,
      payment_date: form.payment_date || null,
      remarks: form.remarks.trim() || null,
    });
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Update Payroll" : "Generate Payroll"}
      subtitle="Manage staff monthly salary and payment details."
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
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5 sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Staff */}
            <SearchableSelect
              label="Staff Member"
              icon={UserRound}
              placeholder={
                staffLoading
                  ? "Loading staff..."
                  : "Search staff member..."
              }
              searchTerm={staffSearch}
              onSearchChange={setStaffSearch}
              items={staff}
              isOpen={openDropdown === "staff"}
              onOpenChange={(open) =>
                setOpenDropdown(open ? "staff" : null)
              }
              filterFn={staffFilter}
              onSelect={selectStaff}
              disabled={isEdit || staffLoading}
              itemRenderer={(item) => (
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {getUserName(item)}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    {item.email || `User ID: ${item.id}`}
                  </p>
                </div>
              )}
              emptyMessage="No staff members found."
            />

            {/* Salary Month */}
            <FormField
              label="Salary Month"
              name="salary_month"
              type="month"
              value={form.salary_month}
              onChange={handleChange}
              required
              disabled={saving || isEdit}
            />

            {/* Deductions */}
            <FormField
              label="Deductions"
              name="deductions"
              type="number"
              value={form.deductions}
              onChange={handleChange}
              placeholder="Enter deductions"
              disabled={saving}
            />

            {/* Paid Amount */}
            <FormField
              label="Paid Amount"
              name="paid_amount"
              type="number"
              value={form.paid_amount}
              onChange={handleChange}
              placeholder="Enter paid amount"
              disabled={saving}
            />

            {/* Payment Date */}
            <FormField
              label="Payment Date"
              name="payment_date"
              type="date"
              value={form.payment_date}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          {/* Payroll Information */}
          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Receipt size={16} className="text-teal-700" />

              <h3 className="text-xs font-semibold text-slate-800">
                Payroll Information
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

              <div>
                <p className="text-[11px] text-slate-500">
                  Selected Staff
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                  {selectedStaff
                    ? getUserName(selectedStaff)
                    : selectedPayroll?.staff_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Basic Salary
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {salaryLoading
                    ? "Loading..."
                    : `Rs. ${formatAmount(basicSalary)}`}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Allowances
                </p>

                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {salaryLoading
                    ? "Loading..."
                    : `Rs. ${formatAmount(allowances)}`}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Deductions
                </p>

                <p className="mt-1 text-sm font-semibold text-rose-600">
                  Rs. {formatAmount(deductions)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Estimated Net Salary
                </p>

                <p className="mt-1 text-sm font-bold text-teal-700">
                  {salaryLoading
                    ? "Loading..."
                    : `Rs. ${formatAmount(estimatedNetSalary)}`}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Remaining Amount
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Rs. {formatAmount(remainingAmount)}
                </p>
              </div>
            </div>

            {!salaryLoading && form.user_id && !salaryStructure && (
              <p className="mt-3 border-t border-rose-100 pt-3 text-xs text-rose-600">
                No active salary structure found for this staff member.
              </p>
            )}

            <p className="mt-3 border-t border-teal-100 pt-3 text-[11px] leading-5 text-slate-500">
              Basic salary, allowances, net salary and remaining
              amount are calculated by the backend. The net salary
              shown above is only an estimate.
            </p>
          </div>

          {/* Remarks */}
          <FormField
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Enter remarks..."
            disabled={saving}
          />

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
              disabled={
                saving ||
                staffLoading ||
                salaryLoading ||
                !salaryStructure ||
                !form.user_id ||
                !form.salary_month ||
                invalidAmounts ||
                invalidNetSalary ||
                invalidPaidAmount
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Payroll"
                  : "Generate Payroll"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default PayrollModal;
