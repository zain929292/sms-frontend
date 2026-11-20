
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import useExpenses from "../../hook/Expense/useExpenses";
import ExpenseModal from "../../utils/modals/expense/ExpenseModal";

import ExpenseHeader from "../../components/Expense/ExpenseHeader";
import ExpenseStats from "../../components/Expense/ExpenseStats";
import ExpenseFilters from "../../components/Expense/ExpenseFilters";
import ExpenseTable from "../../components/Expense/ExpenseTable";

const LIMIT_OPTIONS = [5, 10, 20, 50];

const Expenses = () => {
  const {
    expenses = [],
    stats = {},
    pagination,
    loading,
    saving,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const totalPages = pagination?.last_page || 1;
  const total = pagination?.total || 0;

  // Backend filtering and pagination
  const loadExpenses = useCallback(
    (page = currentPage, limit = itemsPerPage) => {
      fetchExpenses({
        page,
        limit,
        search: searchTerm,
        category,
        status,
        payment_method: paymentMethod,
        month,
        year,
      });
    },
    [
      fetchExpenses,
      currentPage,
      itemsPerPage,
      searchTerm,
      category,
      status,
      paymentMethod,
      month,
      year,
    ],
  );

  useEffect(() => {
    loadExpenses(currentPage, itemsPerPage);
  }, [loadExpenses, currentPage, itemsPerPage]);

  // Title search
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setSelectedExpenseId(null);
    setCurrentPage(1);
    setIsDropdownOpen(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedExpenseId(null);
    setCurrentPage(1);
  }, []);

  // Select expense from quick lookup
  const handleSelectExpense = useCallback((expense) => {
    setSelectedExpenseId(expense.id);
    setSearchTerm(expense.title);
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  // Individual filter handlers
  const handleCategoryChange = useCallback((value) => {
    setCategory(value);
    setSelectedExpenseId(null);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value) => {
    setStatus(value);
    setSelectedExpenseId(null);
    setCurrentPage(1);
  }, []);

  const handlePaymentMethodChange = useCallback((value) => {
    setPaymentMethod(value);
    setSelectedExpenseId(null);
    setCurrentPage(1);
  }, []);

  const handleMonthChange = useCallback((value) => {
    setMonth(value);
    setSelectedExpenseId(null);
    setCurrentPage(1);
  }, []);

  const handleYearChange = useCallback((value) => {
    setYear(value);
    setSelectedExpenseId(null);
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedExpenseId(null);
    setCategory("");
    setStatus("");
    setPaymentMethod("");
    setMonth("");
    setYear("");
    setCurrentPage(1);
  }, []);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setSelectedExpense(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((expense) => {
    setSelectedExpense(expense);
    setModalOpen(true);
  }, []);

  // Create / Update expense
  const handleSubmit = async (payload) => {
    const success = selectedExpense
      ? await updateExpense(selectedExpense.id, payload)
      : await createExpense(payload);

    if (success) {
      setModalOpen(false);
      setSelectedExpense(null);
      loadExpenses(currentPage, itemsPerPage);
    }
  };

  // Delete expense
  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (!confirmed) return;

    const success = await deleteExpense(expense.id);

    if (success) {
      toast.success("Expense deleted successfully.");

      if (String(selectedExpenseId) === String(expense.id)) {
        setSelectedExpenseId(null);
        setSearchTerm("");
      }

      if (expenses.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        loadExpenses(currentPage, itemsPerPage);
      }
    }
  };

  return (
    <div className="space-y-6">
      <ExpenseHeader
        expensesCount={total}
        monthlyExpenses={stats.monthly}
        onAddExpense={openCreateModal}
      />

      <ExpenseStats stats={stats} />

      <ExpenseFilters
        searchTerm={searchTerm}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        filteredExpenses={expenses}
        selectedExpenseId={selectedExpenseId}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onSelectExpense={handleSelectExpense}
        category={category}
        status={status}
        paymentMethod={paymentMethod}
        month={month}
        year={year}
        onCategoryChange={handleCategoryChange}
        onStatusChange={handleStatusChange}
        onPaymentMethodChange={handlePaymentMethodChange}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        onClearAll={handleClearAllFilters}
      />

      <ExpenseTable
        expenses={expenses}
        total={total}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        loading={loading}
        searchTerm={searchTerm}
        onRefresh={() => loadExpenses(currentPage, itemsPerPage)}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        onEdit={openEditModal}
        onDelete={handleDelete}
        limitOptions={LIMIT_OPTIONS}
      />

      <ExpenseModal
        open={modalOpen}
        expense={selectedExpense}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setSelectedExpense(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Expenses;
