
import { useEffect } from "react";
import { Plus } from "lucide-react";

import Table from "../../utils/table/Table.util";
import FilterBar from "../../utils/filter/FilterBar.util";
import FeeStructureModal from "../../utils/modals/feeStructure/FeeStructureModal";

import FeeStructureHeader from "../../components/FeeStructure/FeeStructureHeader";
import FeeStructureTableColumns from "../../components/FeeStructure/FeeStructureTableColumns";

import useFeeStructures from "../../hook/FeeStructure/useFeeStructures";
import useClasses from "../../hook/ClassList/useClasses";
import FeeStructureStats from "../../components/FeeStructure/FeeStructureStats";

const FEE_LIMIT_OPTIONS = [5, 10, 20, 50, 100];

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "one_time", label: "One Time" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function FeeStructure() {
  const s = useFeeStructures();
  const c = useClasses();

  // Load classes for dropdown and class-name mapping.
  useEffect(() => {
    c.fetchClasses(1, 100);
  }, []);

  const filterConfig = {
    searches: [
      {
        key: "fee-search",
        label: "Search Fee Structure",
        value: s.searchTerm,
        onChange: (e) => {
          s.setSearchTerm(e.target.value);
          s.setCurrentPage(1);
        },
        onClear: () => {
          s.setSearchTerm("");
          s.setCurrentPage(1);
        },
        placeholder: "Search fee name or description...",
      },
    ],

    customFilters: [
      <div key="class-filter">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Class
        </label>
        <select
          value={s.selectedClass}
          onChange={(e) => {
            s.setSelectedClass(e.target.value);
            s.setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-teal-500"
        >
          <option value="">All Classes</option>
          {c.classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>,

      <div key="frequency-filter">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Frequency
        </label>
        <select
          value={s.selectedFrequency}
          onChange={(e) => {
            s.setSelectedFrequency(e.target.value);
            s.setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-teal-500"
        >
          <option value="">All Frequencies</option>
          {FREQUENCY_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>,

      <div key="status-filter">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Status
        </label>
        <select
          value={s.selectedStatus}
          onChange={(e) => {
            s.setSelectedStatus(e.target.value);
            s.setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-teal-500"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>,
    ],

    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
  };

  // Add class name to each fee structure for table display.
  const tableData = s.feeStructures.map((fee) => {
    const selectedClass = c.classes.find(
      (item) => Number(item.id) === Number(fee.class_id)
    );

    return {
      ...fee,
      class_name: selectedClass?.name || `Class ID: ${fee.class_id}`,
    };
  });

return (
  <div className="space-y-4">

    <FeeStructureHeader
      onAddFeeStructure={s.openCreateModal}
    />

    <FeeStructureStats stats={s.stats} />

    <FilterBar {...filterConfig} />

    <Table
      title="Fee Structure Management"
      columns={FeeStructureTableColumns()}
      data={tableData}
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
      limitOptions={FEE_LIMIT_OPTIONS}
    />

    <FeeStructureModal
      isOpen={s.isModalOpen}
      onClose={s.closeModal}
      selectedFeeStructure={s.selectedFeeStructure}
      onSubmit={s.handleSaveFeeStructure}
      classes={c.classes}
      saving={s.saving}
    />
  </div>
);
}
