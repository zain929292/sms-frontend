import Table from "../../utils/table/Table.util";
import UsersTableColumns from "./UsersTableColumns";

export default function UsersTableSection({ user, limitOptions }) {
  return (
    <Table
      title="User Management"
      columns={UsersTableColumns()}
      data={user.users}
      keyField="id"
      loading={user.loading}
      getRowActions={user.getRowActions}
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
  );
}