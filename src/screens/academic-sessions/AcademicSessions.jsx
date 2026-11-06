import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import useAcademicSessions from "../../hook/useAcademicSessions";
import AcademicSessionModal from "../../utils/modals/academic-session/AcademicSessionModal";
import AcademicSessionsHeader from "../../components/AcademicSessions/AcademicSessionsHeader";
import AcademicSessionsStats from "../../components/AcademicSessions/AcademicSessionsStats";
import AcademicSessionsFilters from "../../components/AcademicSessions/AcademicSessionsFilters";
import AcademicSessionsTable from "../../components/AcademicSessions/AcademicSessionsTable";

const LIMIT_OPTIONS = [5, 10, 20, 50];

const AcademicSessions = () => {
  const {
    sessions = [],
    loading,
    saving,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  } = useAcademicSessions();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const filteredSessions = sessions.filter((session) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      String(session.id).includes(term) ||
      session.name?.toLowerCase().includes(term) ||
      session.status?.toLowerCase().includes(term)
    );
  });

  const displayedSessions = selectedSessionId
    ? sessions.filter((session) => String(session.id) === String(selectedSessionId))
    : filteredSessions;

  const totalPages = Math.max(1, Math.ceil(displayedSessions.length / itemsPerPage));
  const paginatedSessions = displayedSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const activeCount = sessions.filter(
    (session) => session.status?.toLowerCase() === "active",
  ).length;
  const currentSession = sessions.find(
    (session) => session.status?.toLowerCase() === "active",
  );

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setSelectedSessionId(null);
    setCurrentPage(1);
    setIsDropdownOpen(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedSessionId(null);
    setCurrentPage(1);
  }, []);

  const handleSelectSession = useCallback((session) => {
    setSelectedSessionId(session.id);
    setSearchTerm(session.name || "");
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSessionId(null);
    setCurrentPage(1);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelectedSession(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((session) => {
    setSelectedSession(session);
    setModalOpen(true);
  }, []);

  const handleSubmit = async (payload) => {
    const success = selectedSession
      ? await updateSession(selectedSession.id, payload)
      : await createSession(payload);

    if (success) {
      setModalOpen(false);
      setSelectedSession(null);
    }
  };

  const handleDelete = async (session) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${session.name}"?`,
    );
    if (!confirmed) return;

    const success = await deleteSession(session.id);
    if (success) {
      if (String(selectedSessionId) === String(session.id)) {
        handleClearAllFilters();
      }
      toast.success("Academic session deleted successfully.");
    }
  };

  return (
    <div className="space-y-6">
      <AcademicSessionsHeader
        sessionsCount={sessions.length}
        activeCount={activeCount}
        onAddSession={openCreateModal}
      />

      <AcademicSessionsStats
        sessions={sessions}
        activeCount={activeCount}
        currentSession={currentSession}
      />

      <AcademicSessionsFilters
        searchTerm={searchTerm}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        filteredSessions={filteredSessions}
        selectedSessionId={selectedSessionId}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onSelectSession={handleSelectSession}
        onClearAll={handleClearAllFilters}
      />

      <AcademicSessionsTable
        sessions={paginatedSessions}
        total={displayedSessions.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        loading={loading}
        searchTerm={searchTerm}
        onRefresh={fetchSessions}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        onEdit={openEditModal}
        onDelete={handleDelete}
        limitOptions={LIMIT_OPTIONS}
      />

      <AcademicSessionModal
        open={modalOpen}
        session={selectedSession}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setSelectedSession(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AcademicSessions;
