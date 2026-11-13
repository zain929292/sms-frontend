
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import useAnnouncements from "../../hook/Announcements/useAnnouncements";
import AnnouncementModal from "../../utils/modals/announcements/AnnouncementModal";
import AnnouncementsHeader from "../../components/Announcements/AnnouncementsHeader";
import AnnouncementsStats from "../../components/Announcements/AnnouncementsStats";
import AnnouncementsFilters from "../../components/Announcements/AnnouncementsFilters";
import AnnouncementsTable from "../../components/Announcements/AnnouncementsTable";

const LIMIT_OPTIONS = [5, 10, 20, 50];

const Announcements = () => {
  const {
    announcements = [],
    loading,
    saving,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useAnnouncements();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return true;

    return (
      String(announcement.id).includes(term) ||
      announcement.notice?.toLowerCase().includes(term) ||
      announcement.audience?.toLowerCase().includes(term) ||
      announcement.status?.toLowerCase().includes(term)
    );
  });

  const displayedAnnouncements = selectedAnnouncementId
    ? announcements.filter(
        (announcement) =>
          String(announcement.id) === String(selectedAnnouncementId),
      )
    : filteredAnnouncements;

  const totalPages = Math.max(
    1,
    Math.ceil(displayedAnnouncements.length / itemsPerPage),
  );

  const paginatedAnnouncements = displayedAnnouncements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const publishedCount = announcements.filter(
    (announcement) => announcement.status?.toLowerCase() === "published",
  ).length;

  const draftCount = announcements.filter(
    (announcement) => announcement.status?.toLowerCase() === "draft",
  ).length;

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setSelectedAnnouncementId(null);
    setCurrentPage(1);
    setIsDropdownOpen(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setSelectedAnnouncementId(null);
    setCurrentPage(1);
  }, []);

  const handleSelectAnnouncement = useCallback((announcement) => {
    setSelectedAnnouncementId(announcement.id);
    setSearchTerm(announcement.notice || "");
    setIsDropdownOpen(false);
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedAnnouncementId(null);
    setCurrentPage(1);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelectedAnnouncement(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    setModalOpen(true);
  }, []);

  const handleSubmit = async (payload) => {
    const success = selectedAnnouncement
      ? await updateAnnouncement(selectedAnnouncement.id, payload)
      : await createAnnouncement(payload);

    if (success) {
      setModalOpen(false);
      setSelectedAnnouncement(null);
    }
  };

  const handleDelete = async (announcement) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this announcement?`,
    );

    if (!confirmed) return;

    const success = await deleteAnnouncement(announcement.id);

    if (success) {
      if (
        String(selectedAnnouncementId) === String(announcement.id)
      ) {
        handleClearAllFilters();
      }

      toast.success("Announcement deleted successfully.");
    }
  };

  return (
    <div className="space-y-6">
      <AnnouncementsHeader
        announcementsCount={announcements.length}
        publishedCount={publishedCount}
        onAddAnnouncement={openCreateModal}
      />

      <AnnouncementsStats
        announcements={announcements}
        publishedCount={publishedCount}
        draftCount={draftCount}
      />

      <AnnouncementsFilters
        searchTerm={searchTerm}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        filteredAnnouncements={filteredAnnouncements}
        selectedAnnouncementId={selectedAnnouncementId}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onSelectAnnouncement={handleSelectAnnouncement}
        onClearAll={handleClearAllFilters}
      />

      <AnnouncementsTable
        announcements={paginatedAnnouncements}
        total={displayedAnnouncements.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        loading={loading}
        searchTerm={searchTerm}
        onRefresh={fetchAnnouncements}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setItemsPerPage(limit);
          setCurrentPage(1);
        }}
        onEdit={openEditModal}
        onDelete={handleDelete}
        limitOptions={LIMIT_OPTIONS}
      />

      <AnnouncementModal
        open={modalOpen}
        announcement={selectedAnnouncement}
        saving={saving}
        onClose={() => {
          setModalOpen(false);
          setSelectedAnnouncement(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Announcements;
