
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "../../redux/slices/Auth.slice.redux";

import useTimetable from "../../hook/useTimetable";
import useClasses from "../../hook/useClasses";
import useSubjects from "../../hook/useSubjects";
import usePeriods from "../../hook/Period/usePeriods";

import TimetableHeader from "../../components/Timetable/TimetableHeader";
import TimetableStats from "../../components/Timetable/TimetableStats";
import TimetableFilters from "../../components/Timetable/TimetableFilters";
import TimetableTable from "../../components/Timetable/TimetableTable";
import TimetableModal from "../../utils/modals/timetable/TimetableModal";

const Timetable = () => {
  const dispatch = useDispatch();

  // Users / Teachers
  const { users = [] } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllUsers(1));
  }, [dispatch]);

  const teachers = users.filter(
    (user) => user.role_name === "teacher"
  );

  // Periods
  const {
    periods = [],
    loadingPeriods,
    fetchPeriods,
  } = usePeriods();

  // Timetable
  const {
    timetables = [],
    pagination = {},
    classTabCounts = {},
    selectedDay,
    setSelectedDay,
    loading,
    saving,
    fetchTimetable,
    createTimetable,
    updateTimetable,
    deleteTimetable,
  } = useTimetable();

  // Classes and Subjects
  const { classes = [] } = useClasses();
  const { subjects = [] } = useSubjects();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [initialData, setInitialData] = useState(null);

  // Filters
  const [selectedClassTab, setSelectedClassTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Active classes
  const activeClasses = classes.filter(
    (item) => item.status === "active"
  );

  // Pagination
  const currentPage = pagination.current_page || 1;
  const perPage = pagination.per_page || 10;

  // Total records
  const totalCount = timetables.length;

  // Search
  const displayedTimetables = timetables.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    const searchable = [
      item.id,
      item.classes?.name,
      item.class?.name,
      item.class_name,
      item.subject?.name,
      item.subjects?.name,
      item.subject_name,
      item.teachers?.name,
      item.teacher?.name,
      item.teacher_name,
      item.day,
      item.room_number,
    ];

    return (
      !search ||
      searchable.some((value) =>
        String(value ?? "").toLowerCase().includes(search)
      )
    );
  });

  // Stats
  const activeCount = timetables.filter(
    (item) => item.status === "active"
  ).length;

  const daysCount = new Set(
    timetables.map((item) => item.day).filter(Boolean)
  ).size;

  // Class tab change
  const handleClassTabChange = (classId) => {
    setSelectedClassTab(classId);
    fetchTimetable(1, perPage, classId);
  };

  // Add timetable
  // Table Add button sends class_id, period_id and day.
  // Header Add button sends no data.
  const handleAdd = (data = null) => {
    setSelectedTimetable(null);
    setInitialData(data);
    setIsModalOpen(true);
  };

  // Edit timetable
  const handleEdit = (item) => {
    setInitialData(null);
    setSelectedTimetable(item);
    setIsModalOpen(true);
  };

  // Create or update timetable
  const handleSubmit = async (payload) => {
    const isEdit = Boolean(selectedTimetable?.id);

    const success = isEdit
      ? await updateTimetable(selectedTimetable.id, payload)
      : await createTimetable(payload);

    if (success) {
      setIsModalOpen(false);
      setSelectedTimetable(null);
      setInitialData(null);
    }
  };

  // Delete timetable
  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timetable?"
    );

    if (!confirmed) return;

    const success = await deleteTimetable(item.id);

    if (success) {
      const page =
        timetables.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      fetchTimetable(page, perPage, selectedClassTab);
    }
  };

  // Refresh timetable and periods
  const handleRefresh = () => {
    fetchTimetable();
    fetchPeriods();
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTimetable(null);
    setInitialData(null);
  };

  return (
    <div className="space-y-4 p-3 sm:p-4">

      {/* Header */}
      <TimetableHeader
        totalCount={totalCount}
        onAddTimetable={() => handleAdd()}
      />

      {/* Stats */}
      <TimetableStats
        totalCount={totalCount}
        activeCount={activeCount}
        daysCount={daysCount}
      />

      {/* Filters */}
      <TimetableFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm("")}
        hasFilters={Boolean(searchTerm)}
      />

      {/* Timetable Table */}
      <TimetableTable
        timetables={displayedTimetables}
        periods={periods}
        classes={activeClasses}
        loading={loading || loadingPeriods}
        onRefresh={handleRefresh}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        selectedDay={selectedDay}
        onDayChange={setSelectedDay}
      />

      {/* Add / Edit Modal */}
      <TimetableModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        selectedTimetable={selectedTimetable}
        initialData={initialData}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        periods={periods}
        saving={saving}
      />

    </div>
  );
};

export default Timetable;
