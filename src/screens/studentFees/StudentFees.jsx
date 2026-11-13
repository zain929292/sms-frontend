import { Plus } from "lucide-react";

import Table from "../../utils/table/Table.util";
import FilterBar from "../../utils/filter/FilterBar.util";

import useStudentFees from "../../hook/StudentFees/useStudentFees";

import StudentFeeHeader from "../../components/StudentFees/StudentFeeHeader";
import StudentFeeTableColumns from "../../components/StudentFees/StudentFeeTableColumns";

import StudentFeeModal from "../../utils/modals/studentFees/StudentFeeModal";
import StudentFeeViewModal from "../../utils/modals/studentFees/StudentFeeViewModal";
import StudentFeeStats from "../../components/StudentFees/StudentFeeStats";

export default function StudentFees() {
  const s = useStudentFees();

  const filterConfig = {
    searches: [
      {
        key: "student",
        label: "Student",
        value: s.studentName,
        onChange: s.handleStudentNameChange,
        placeholder: "Search student name...",
      },
      {
        key: "class",
        label: "Class",
        value: s.className,
        onChange: s.handleClassNameChange,
        placeholder: "Search class name...",
      },
    ],

    customFilters: [
      <div key="fee-month" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Fee Month
        </label>

        <input
          type="month"
          value={s.feeMonth}
          onChange={s.handleFeeMonthChange}
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
      <StudentFeeHeader onAddFee={s.openCreateModal} feeCount={s.stats.feecount} />

      <StudentFeeStats stats={s.stats} />

      <FilterBar {...filterConfig} />

      <Table
        title="Student Fee Management"

        columns={StudentFeeTableColumns()}
        data={s.studentFees}
        keyField="id"
        loading={s.loading}
        getRowActions={s.getRowActions}
        pagination={{
          page: s.currentPage,
          limit: s.itemsPerPage,
          total: s.pagination.total,
          last_page: s.totalPages,
        }}
        onPageChange={s.setCurrentPage}
        onLimitChange={(limit) => {
          s.setItemsPerPage(Number(limit));
          s.setCurrentPage(1);
        }}
        limitOptions={[5, 10, 20, 50, 100]}
      />

      <StudentFeeModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        selectedFee={s.selectedFee}
        onSubmit={s.handleSaveStudentFee}
        saving={s.saving}
      />

      <StudentFeeViewModal
        isOpen={s.isViewModalOpen}
        onClose={s.closeViewModal}
        fee={s.viewFee}
      />
    </div>
  );
}
