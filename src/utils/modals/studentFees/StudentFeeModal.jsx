
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

import {
  getStudentEnrollments,
} from "../../../redux/api_data/studentEnrollmentApi/studentEnrollmentApi";

import {
  getFeeStructures,
} from "../../../redux/api_data/feeStructureApi/feeStructureApi";

const EMPTY_FORM = {
  student_id: "",
  fee_month: new Date().toISOString().slice(0, 7),
  payment_date: new Date().toISOString().slice(0, 10),
  discount: "0",
  paid_amount: "0",
  remarks: "",
};

const StudentFeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedFee,
  saving = false,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(isOpen, 300);

  const [students, setStudents] = useState([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [studentSearch, setStudentSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [feeStructures, setFeeStructures] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);

  const isEdit = Boolean(selectedFee?.id);

  // Fetch all students
  useEffect(() => {
    if (!isOpen) return;

    const fetchStudents = async () => {
      setEnrollmentLoading(true);

      try {
        const firstResponse = await getStudentEnrollments({
          page: 1,
          limit: 100,
        });

        const payload = firstResponse?.data;

        const allStudents = Array.isArray(payload?.data?.data)
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
              getStudentEnrollments({
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

            allStudents.push(...list);
          });
        }

        setStudents(allStudents);

        console.log("All Students:", allStudents);
      } catch (error) {
        console.error("Student Fetch Error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load students."
        );
      } finally {
        setEnrollmentLoading(false);
      }
    };

    fetchStudents();
  }, [isOpen]);

  // Fetch fee structures
  useEffect(() => {
    if (!isOpen) return;

    const fetchFeeStructures = async () => {
      setFeeLoading(true);

      try {
        const response = await getFeeStructures({
          page: 1,
          limit: 100,
        });

        const payload = response?.data;

        const list = Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        setFeeStructures(list);
      } catch (error) {
        console.error("Fee Structure Error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load fee structures."
        );
      } finally {
        setFeeLoading(false);
      }
    };

    fetchFeeStructures();
  }, [isOpen]);

  // Initialize form
  useEffect(() => {
    if (!isOpen) return;

    const source = selectedFee || {};

    setForm({
      ...EMPTY_FORM,
      student_id: String(source.student_id ?? ""),
      fee_month: source.fee_month ?? EMPTY_FORM.fee_month,
      payment_date:
        source.payment_date ?? EMPTY_FORM.payment_date,
      discount: String(source.discount ?? 0),
      paid_amount: String(source.paid_amount ?? 0),
      remarks: source.remarks ?? "",
    });

    setStudentSearch(source.student_name ?? "");
    setOpenDropdown(null);
  }, [isOpen, selectedFee]);

  // Find selected enrollment
  const selectedEnrollment = students.find(
    (item) =>
      String(item.student_id) === String(form.student_id)
  );

  // Find monthly tuition fee for selected class
  const selectedFeeStructure = feeStructures.find(
    (item) =>
      Number(item.class_id) ===
        Number(selectedEnrollment?.class_id) &&
      item.name === "tuition_fee" &&
      item.frequency === "monthly" &&
      item.status === "active"
  );

  const feeAmount = Number(
    selectedFeeStructure?.amount ??
      (isEdit ? selectedFee?.amount : 0) ??
      0
  );

  const discount = Number(form.discount || 0);
  const paidAmount = Number(form.paid_amount || 0);

  const totalAmount = Math.max(feeAmount - discount, 0);

  const remainingAmount = Math.max(
    totalAmount - paidAmount,
    0
  );

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

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.student_id) {
      toast.error("Please select a student.");
      return;
    }

    if (!selectedEnrollment && !isEdit) {
      toast.error("Selected student enrollment not found.");
      return;
    }

    if (!form.fee_month || !form.payment_date) {
      toast.error(
        "Please complete fee month and payment date."
      );
      return;
    }

    if (!selectedFeeStructure && !isEdit) {
      toast.error(
        "Monthly tuition fee not found for this class."
      );
      return;
    }

    if (discount < 0 || paidAmount < 0) {
      toast.error("Amount cannot be negative.");
      return;
    }

    if (discount > feeAmount) {
      toast.error("Discount cannot exceed fee amount.");
      return;
    }

    if (paidAmount > totalAmount) {
      toast.error("Paid amount cannot exceed total amount.");
      return;
    }

    onSubmit({
      student_id: Number(form.student_id),
      fee_month: form.fee_month,
      payment_date: form.payment_date,
      discount,
      paid_amount: paidAmount,
      remarks: form.remarks.trim() || null,
    });
  };

  // Student search filter
  const studentFilter = (item, search) =>
    `${item.student_name ?? ""} ${item.student_id ?? ""} ${
      item.class_name ?? ""
    }`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Select student
  const selectStudent = (item) => {
    setForm((prev) => ({
      ...prev,
      student_id: String(item.student_id),
      discount: "0",
      paid_amount: "0",
    }));

    setStudentSearch(item.student_name);
    setOpenDropdown(null);
  };

  // Format currency
  const formatAmount = (value) =>
    Number(value || 0).toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    });

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? "Update Student Fee" : "Add Student Fee"}
      subtitle="Manage student monthly fee and payment details."
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

            {/* Student */}
            <SearchableSelect
              label="Student"
              icon={UserRound}
              placeholder={
                enrollmentLoading
                  ? "Loading students..."
                  : "Search student..."
              }
              searchTerm={studentSearch}
              onSearchChange={setStudentSearch}
              items={students}
              isOpen={!isEdit && openDropdown === "student"}
              onOpenChange={(open) => {
                if (isEdit) return;
                setOpenDropdown(open ? "student" : null);
              }}
              filterFn={studentFilter}
              onSelect={(item) => {
                if (isEdit) return;
                selectStudent(item);
              }}
              disabled={isEdit || enrollmentLoading}
              itemRenderer={(item) => (
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {item.student_name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.class_name} · Student ID: {item.student_id}
                  </p>
                </div>
              )}
              emptyMessage="No students found."
            />

            {/* Class */}
            <FormField
              label="Class"
              name="class_name"
              value={
                selectedEnrollment?.class_name ??
                selectedFee?.class_name ??
                ""
              }
              onChange={() => {}}
              placeholder="Automatically selected"
              disabled
            />

            {/* Monthly Fee */}
            <FormField
              label="Monthly Tuition Fee"
              name="amount"
              value={
                selectedFee?.id
                  ? formatAmount(selectedFee.amount)
                  : feeLoading
                    ? "Loading..."
                    : formatAmount(feeAmount)
              }
              onChange={() => {}}
              disabled
            />

            {/* Fee Month */}
            <FormField
              label="Fee Month"
              name="fee_month"
              type="month"
              value={form.fee_month}
              onChange={handleChange}
              required
              disabled={saving}
            />

            {/* Payment Date */}
            <FormField
              label="Payment Date"
              name="payment_date"
              type="date"
              value={form.payment_date}
              onChange={handleChange}
              required
              disabled={saving}
            />

            {/* Discount */}
            <FormField
              label="Discount"
              name="discount"
              type="number"
              value={form.discount}
              onChange={handleChange}
              placeholder="Enter discount"
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
          </div>

          {/* Fee Summary */}
          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Receipt size={16} className="text-teal-700" />

              <h3 className="text-xs font-semibold text-slate-800">
                Fee Summary
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-slate-500">
                  Fee Amount
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatAmount(feeAmount)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Discount
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatAmount(discount)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Total Amount
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatAmount(totalAmount)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Paid Amount
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatAmount(paidAmount)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500">
                  Remaining Amount
                </p>

                <p className="mt-1 text-sm font-bold text-teal-700">
                  {formatAmount(remainingAmount)}
                </p>
              </div>
            </div>
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
                enrollmentLoading ||
                feeLoading ||
                !form.student_id ||
                (!selectedFeeStructure && !isEdit) ||
                discount > feeAmount ||
                paidAmount > totalAmount
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Fee"
                  : "Save Fee"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default StudentFeeModal;
