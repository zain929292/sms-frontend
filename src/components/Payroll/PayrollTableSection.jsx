
import Table from "../../utils/table/Table.util";
import PayrollTableColumns from "./PayrollTableColumns";

export default function PayrollTableSection({
  payrolls,
  loading,
  pagination,
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  getRowActions,
}) {
  return (
    <Table
      title="Payroll Records"
      columns={PayrollTableColumns()}
      data={payrolls}
      keyField="id"
      loading={loading}
      getRowActions={getRowActions}
      pagination={{
        page: currentPage,
        limit: itemsPerPage,
        total: pagination.total,
        last_page: totalPages,
      }}
      onPageChange={setCurrentPage}
      onLimitChange={(limit) => {
        setItemsPerPage(Number(limit));
        setCurrentPage(1);
      }}
      limitOptions={[5, 10, 20, 50, 100]}
    />
  );
}
