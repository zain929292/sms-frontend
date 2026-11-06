
import Table from "../../utils/table/Table.util";
import FilterBar from "../../utils/filter/FilterBar.util";
import UsersTableColumns from "./UsersTableColumns";

export default function UsersTableSection({
  user,
  limitOptions,
}) {
  const filterConfig = {
    picker: {
      label: "Quick User Lookup",
      searchTerm: user.searchTerm,
      onSearchChange: user.handleSearchChange,
      onClearSearch: () => user.handleSearchChange(""),
      placeholder: "Search user name or email...",
      isOpen: user.isDropdownOpen,
      setIsOpen: user.setIsDropdownOpen,
      items: user.users,
      onSelectItem: user.openViewModal,
      emptyMessage: "No users found.",

      itemRenderer: (item) => (
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
              {item.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                {item.name || "Unknown User"}
              </p>

              <p className="text-[11px] text-slate-500">
                {item.email || "—"}
              </p>

              <p className="text-[11px] text-slate-500">
                Role: {item.role_name || "—"}
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400">
            ID: {item.id}
          </span>
        </>
      ),
    },

    hasFilters: Boolean(user.searchTerm),
    onClearAll: user.handleClearFilters,
  };

  return (
    <>
      <FilterBar {...filterConfig} />

      <Table
        title="Users"
        columns={UsersTableColumns({
          onView: user.openViewModal,
          onEdit: user.openEditModal,
          onDelete: user.handleDeleteUser,
        })}
        data={user.users}
        keyField="id"
        loading={user.loading}
        pagination={{
          page: user.pagination.current_page,
          limit: user.pagination.per_page,
          total: user.pagination.total,
          last_page: user.pagination.last_page,
        }}
        onPageChange={user.handlePageChange}
        onLimitChange={user.handleLimitChange}
        limitOptions={limitOptions}
      />
    </>
  );
}
