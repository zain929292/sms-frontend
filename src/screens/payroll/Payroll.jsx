import FilterBar from "../../utils/filter/FilterBar.util";

import usePayroll from "../../hook/Payroll/usePayroll";

import PayrollHeader from "../../components/Payroll/PayrollHeader";
import PayrollStats from "../../components/Payroll/PayrollStats";
import PayrollTableSection from "../../components/Payroll/PayrollTableSection";

import PayrollModal from "../../utils/modals/payroll/PayrollModal";
// import PayrollViewModal from "../../utils/modals/payroll/PayrollViewModal";

export default function Payroll() {
  const s = usePayroll();

  const filterConfig = {
    searches: [
      {
        key: "staff",
        label: "Staff",
        value: s.staffName,
        onChange: s.handleStaffNameChange,
        placeholder: "Search staff name...",
      },
    ],

    customFilters: [
      <div key="salary-month" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Salary Month
        </label>

        <input
          type="month"
          value={s.salaryMonth}
          onChange={s.handleSalaryMonthChange}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        />
      </div>,

      <div key="status" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Payment Status
        </label>

        <select
          value={s.status}
          onChange={s.handleStatusChange}
          className="h-9 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        >
          <option value="">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>,
    ],

    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
    layout: "compact",
  };

  return (
    <div className="space-y-4">
      <PayrollHeader
        onAddPayroll={s.openCreateModal}
        payrollCount={s.stats.payrollcount ?? 0}
      />

      <PayrollStats stats={s.stats} />

      <FilterBar {...filterConfig} />

      <PayrollTableSection
        payrolls={s.payrolls}
        loading={s.loading}
        pagination={s.pagination}
        currentPage={s.currentPage}
        totalPages={s.totalPages}
        itemsPerPage={s.itemsPerPage}
        setCurrentPage={s.setCurrentPage}
        setItemsPerPage={s.setItemsPerPage}
        getRowActions={s.getRowActions}
      />

      <PayrollModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        selectedPayroll={s.selectedPayroll}
        onSubmit={s.handleSavePayroll}
        saving={s.saving}
      />

      {/* <PayrollViewModal
        isOpen={s.isViewModalOpen}
        onClose={s.closeViewModal}
        payroll={s.viewPayroll}
      /> */}
    </div>
  );
}