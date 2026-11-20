
import Table from "../../utils/table/Table.util";
import ExamTableColumns from "./ExamTableColumns";

export default function ExamTableSection({
  exams = [],
  loading,
  pagination = {},
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  getRowActions,
}) {
  return (
    <Table
      title="Examination Records"
      columns={ExamTableColumns()}
      data={exams}
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
