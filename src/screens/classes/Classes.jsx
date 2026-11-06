import { useCallback, useMemo, useState } from "react";
// import useClasses from "../../hook/useClasses";
import useClasses from "../../hook/ClassList/useClasses";
import ClassModal from "../../utils/modals/classes/ClassModal";
import ClassesHeader from "../../components/classes/ClassesHeader";
import ClassesStats from "../../components/classes/ClassesStats";
import ClassesFilters from "../../components/classes/ClassesFilters";
import ClassesTable from "../../components/classes/ClassesTable";

const LIMIT_OPTIONS = [5, 10, 20, 50, 100];

const Classes = () => {
  const {
    classes = [],
    pagination = {},
    loading,
    saving,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
  } = useClasses();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const currentPage = Number(pagination.current_page || 1);
  const itemsPerPage = Number(pagination.per_page || 10);
  const totalPages = Number(pagination.last_page || 1);

  const matches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return classes;
    return classes.filter((item) =>
      [item.id, item.name, item.section, item.status].some((value) =>
        String(value ?? "").toLowerCase().includes(term),
      ),
    );
  }, [classes, searchTerm]);

  const displayedClasses = selectedClassId
    ? classes.filter((item) => String(item.id) === String(selectedClassId))
    : matches;

  const activeCount = classes.filter(
    (item) => item.status?.toLowerCase() === "active",
  ).length;

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedClassId(null);
    setIsDropdownOpen(false);
    if (currentPage !== 1) fetchClasses(1, itemsPerPage);
  }, [currentPage, fetchClasses, itemsPerPage]);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setSelectedClassId(null);
    setIsDropdownOpen(true);
  }, []);

  const handleSelectClass = useCallback((item) => {
    setSelectedClassId(item.id);
    setSearchTerm(item.name || "");
    setIsDropdownOpen(false);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedClass(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setSelectedClass(item);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedClass(null);
  }, []);

  const submit = async (payload) => {
    const success = selectedClass
      ? await updateClass(selectedClass.id, payload)
      : await createClass(payload);

    if (success) {
      closeModal();
      await fetchClasses(currentPage, itemsPerPage);
    }
  };

  const remove = useCallback(async (item) => {
    if (!window.confirm(
      `Delete class "${item.name}${item.section ? ` - ${item.section}` : ""}"?`,
    )) return;

    const success = await deleteClass(item.id);
    if (success) {
      if (String(selectedClassId) === String(item.id)) {
        setSelectedClassId(null);
        setSearchTerm("");
      }
      await fetchClasses(currentPage, itemsPerPage);
    }
  }, [currentPage, deleteClass, fetchClasses, itemsPerPage, selectedClassId]);

  return (
    <div className="space-y-4">
      <ClassesHeader
        onAddClass={openCreate}
        classesCount={pagination.total ?? classes.length}
        activeCount={activeCount}
      />

      <ClassesStats
        totalCount={pagination.total ?? classes.length}
        activeCount={activeCount}
      />

      <ClassesFilters
        searchTerm={searchTerm}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        matches={matches}
        onSearchChange={handleSearchChange}
        onClearSearch={clearFilters}
        onSelectClass={handleSelectClass}
        onClearAll={clearFilters}
        hasFilters={Boolean(searchTerm) || Boolean(selectedClassId)}
      />

      <ClassesTable
        classes={displayedClasses}
        total={selectedClassId ? displayedClasses.length : (pagination.total ?? displayedClasses.length)}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        loading={loading}
        searchTerm={searchTerm}
        onRefresh={() => fetchClasses(currentPage, itemsPerPage)}
        onPageChange={(page) => fetchClasses(Number(page), itemsPerPage)}
        onLimitChange={(limit) => fetchClasses(1, Number(limit))}
        onEdit={openEdit}
        onDelete={remove}
        limitOptions={LIMIT_OPTIONS}
      />

      <ClassModal
        open={modalOpen}
        classData={selectedClass}
        saving={saving}
        onClose={closeModal}
        onSubmit={submit}
      />
    </div>
  );
};

export default Classes;
