import { useCallback, useState } from "react";
import useSubjects from "../../hook/useSubjects";

import SubjectsHeader from "../../components/Subjects/SubjectsHeader";
import SubjectsStats from "../../components/Subjects/SubjectsStats";
import SubjectsFilters from "../../components/Subjects/SubjectsFilters";
import SubjectsTable from "../../components/Subjects/SubjectTableColumns";
import SubjectModal from "../../utils/modals/subjects/SubjectModal";

const LIMIT_OPTIONS = [5, 10, 20, 50, 100];

const Subjects = () => {
  const {
    subjects = [],
    pagination = {},
    loading,
    saving,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const currentPage = Number(pagination.current_page || 1);
  const itemsPerPage = Number(pagination.per_page || 10);
  const totalPages = Number(pagination.last_page || 1);
  const totalCount = Number(pagination.total ?? subjects.length);

  const matches = subjects.filter((item) => {
    const term = searchTerm.trim().toLowerCase();

    return [item.id, item.name, item.description, item.type, item.status]
      .some((value) => String(value ?? "").toLowerCase().includes(term));
  });

  const displayedSubjects = selectedSubjectId
    ? subjects.filter((item) => String(item.id) === String(selectedSubjectId))
    : matches;

  const activeCount = subjects.filter(
    (item) => item.status?.toLowerCase() === "active"
  ).length;

  const inactiveCount = subjects.filter(
    (item) => item.status?.toLowerCase() === "inactive"
  ).length;

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSubjectId(null);
    setIsDropdownOpen(false);

    if (currentPage !== 1) fetchSubjects(1, itemsPerPage);
  }, [currentPage, fetchSubjects, itemsPerPage]);

  const handleSearchChange = useCallback((event) => {
    const value = typeof event === "string"
      ? event
      : event.target.value;

    setSearchTerm(value);
    setSelectedSubjectId(null);
    setIsDropdownOpen(true);
  }, []);

  const handleSelectSubject = useCallback((item) => {
    setSelectedSubjectId(item.id);
    setSearchTerm(item.name || "");
    setIsDropdownOpen(false);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedSubject(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setSelectedSubject(item);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedSubject(null);
  }, []);

  const submit = async (payload) => {
    const success = selectedSubject
      ? await updateSubject(selectedSubject.id, payload)
      : await createSubject(payload);

    if (!success) return false;

    closeModal();
    await fetchSubjects(selectedSubject ? currentPage : 1, itemsPerPage);
    return true;
  };

  const remove = useCallback(async (item) => {
    if (!window.confirm(`Delete subject "${item.name}"?`)) return;

    const success = await deleteSubject(item.id);

    if (success) {
      if (String(selectedSubjectId) === String(item.id)) {
        setSelectedSubjectId(null);
        setSearchTerm("");
      }

      const nextPage =
        subjects.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      await fetchSubjects(nextPage, itemsPerPage);
    }
  }, [
    currentPage,
    deleteSubject,
    fetchSubjects,
    itemsPerPage,
    selectedSubjectId,
    subjects.length,
  ]);

  return (
    <div className="space-y-4">
      <SubjectsHeader
        onAddSubject={openCreate}
        subjectsCount={totalCount}
      />

      <SubjectsStats
        totalCount={totalCount}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
      />

      <SubjectsFilters
        searchTerm={searchTerm}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        matches={matches}
        onSearchChange={handleSearchChange}
        onClearSearch={clearFilters}
        onSelectSubject={handleSelectSubject}
        onClearAll={clearFilters}
        hasFilters={Boolean(searchTerm) || Boolean(selectedSubjectId)}
      />

      <SubjectsTable
        subjects={displayedSubjects}
        total={
          selectedSubjectId
            ? displayedSubjects.length
            : searchTerm
              ? displayedSubjects.length
              : totalCount
        }
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        loading={loading}
        searchTerm={searchTerm}
        onRefresh={() => fetchSubjects(currentPage, itemsPerPage)}
        onPageChange={(page) => fetchSubjects(Number(page), itemsPerPage)}
        onLimitChange={(limit) => fetchSubjects(1, Number(limit))}
        onEdit={openEdit}
        onDelete={remove}
        limitOptions={LIMIT_OPTIONS}
      />

      <SubjectModal
        open={modalOpen}
        subject={selectedSubject}
        saving={saving}
        onClose={closeModal}
        onSubmit={submit}
      />
    </div>
  );
};

export default Subjects;
