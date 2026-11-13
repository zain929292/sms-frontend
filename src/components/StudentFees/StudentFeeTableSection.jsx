
import Table from "../../utils/table/Table.util";
import StudentFeeTableColumns from "./StudentFeeTableColumns";

export default function StudentFeeTableSection({ fees, loading, pagination, currentPage, totalPages, itemsPerPage, setCurrentPage, setItemsPerPage, getRowActions }) {
  return (
    <Table
      title="Student Fee Records"
      columns={StudentFeeTableColumns()}
      data={fees}
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
