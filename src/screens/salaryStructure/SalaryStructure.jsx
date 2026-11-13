import FilterBar from "../../utils/filter/FilterBar.util";

import useSalaryStructure from "../../hook/SalaryStructure/useSalaryStructure";

import SalaryStructureHeader from "../../components/SalaryStructure/SalaryStructureHeader";
import SalaryStructureStats from "../../components/SalaryStructure/SalaryStructureStats";
import SalaryStructureTableSection from "../../components/SalaryStructure/SalaryStructureTableSection";

import SalaryStructureModal from "../../utils/modals/salaryStructure/SalaryStructureModal";
// import SalaryStructureViewModal from "../../utils/modals/salaryStructure/SalaryStructureViewModal";

export default function SalaryStructure() {
  const s = useSalaryStructure();

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
      <div key="status" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Status
        </label>

        <select
          value={s.status}
          onChange={s.handleStatusChange}
          className="h-9 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>,
    ],

    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
    layout: "compact",
  };

  return (
    <div className="space-y-4">
      <SalaryStructureHeader
        onAddSalaryStructure={s.openCreateModal}
      />

      <SalaryStructureStats
        totalCount={s.stats.total ?? 0}
        activeCount={s.stats.active ?? 0}
        inactiveCount={s.stats.inactive ?? 0}
      />

      <FilterBar {...filterConfig} />

      <SalaryStructureTableSection
        salaryStructures={s.salaryStructures}
        loading={s.loading}
        pagination={s.pagination}
        currentPage={s.currentPage}
        totalPages={s.totalPages}
        itemsPerPage={s.itemsPerPage}
        setCurrentPage={s.setCurrentPage}
        setItemsPerPage={s.setItemsPerPage}
        getRowActions={s.getRowActions}
      />

      <SalaryStructureModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        selectedSalaryStructure={s.selectedSalaryStructure}
        onSubmit={s.handleSaveSalaryStructure}
        saving={s.saving}
      />

      {/* <SalaryStructureViewModal
        isOpen={s.isViewModalOpen}
        onClose={s.closeViewModal}
        salaryStructure={s.viewSalaryStructure}
      /> */}
    </div>
  );
}