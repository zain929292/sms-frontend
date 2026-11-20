
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
} from "lucide-react";

import FilterBar from "../../utils/filter/FilterBar.util";

import useExamSchedules from "../../hook/Exam/useExamSchedules";
import useExamDates from "../../hook/Exam/useExamDates";

import ExamDetailsStats from "../../components/ExamDetails/ExamDetailsStats";
import ExamDetailsTable from "../../components/ExamDetails/ExamDetailsTable";
import ExamDatesTable from "../../components/ExamDetails/ExamDateTable";

import ExamScheduleModal from "../../utils/modals/exam/ExamScheduleModal";
import ExamDateModal from "../../utils/modals/exam/ExamDateModal";

import { getClasses } from "../../redux/api_data/classApi/classApi";
import { getExams } from "../../redux/api_data/examApi/examApi";
import { getSubjects } from "../../redux/api_data/subjectApi/subjectApi";

const getList = (response) => {
  const result = response?.data?.data;

  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.data)) return result.data;

  return [];
};

export default function ExamDetails() {
  const { examId } = useParams();
  const navigate = useNavigate();

  // Exam Schedule Hook
  const s = useExamSchedules();

  // Exam Dates Hook
  const {
    examDates,
    loadingExamDates,
    savingExamDate,
    createExamDate,
    updateExamDate,
    deleteExamDate,
  } = useExamDates(examId);

  // Dropdown Data
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [classesLoading, setClassesLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [examLoading, setExamLoading] = useState(false);

  // Exam Date Modal
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedExamDate, setSelectedExamDate] = useState(null);

  // Set Exam ID from URL
  useEffect(() => {
    if (examId) {
      s.handleExamChange(String(examId));
    }
  }, [examId, s.handleExamChange]);

  // Fetch Dropdown Data
  useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      setClassesLoading(true);
      setSubjectsLoading(true);
      setExamLoading(true);

      try {
        const [
          classResponse,
          examResponse,
          subjectResponse,
        ] = await Promise.all([
          getClasses(1, 100),
          getExams({ limit: 100 }),
          getSubjects({ limit: 100 }),
        ]);

        if (!isMounted) return;

        setClasses(getList(classResponse));
        setExams(getList(examResponse));
        setSubjects(getList(subjectResponse));
      } catch (error) {
        console.error(
          "Failed to fetch exam details options:",
          error
        );
      } finally {
        if (isMounted) {
          setClassesLoading(false);
          setSubjectsLoading(false);
          setExamLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Selected Examination
  const selectedExam = exams.find(
    (exam) => String(exam.id) === String(examId)
  );

  // Filter dates for current examination only
  const filteredExamDates = (examDates || []).filter(
    (date) => String(date.exam_id) === String(examId)
  );

  // Create Exam Date
  const openCreateDateModal = () => {
    setSelectedExamDate(null);
    setIsDateModalOpen(true);
  };

  // Edit Exam Date
  const openEditDateModal = (examDate) => {
    setSelectedExamDate(examDate);
    setIsDateModalOpen(true);
  };

  // Close Exam Date Modal
  const closeDateModal = () => {
    if (savingExamDate) return;

    setIsDateModalOpen(false);
    setSelectedExamDate(null);
  };

  // Save Exam Date
  const handleSaveExamDate = async (payload) => {
    let success = false;

    if (selectedExamDate?.id) {
      success = await updateExamDate(
        selectedExamDate.id,
        {
          ...payload,
          exam_id: Number(examId),
        }
      );
    } else {
      success = await createExamDate({
        ...payload,
        exam_id: Number(examId),
      });
    }

    if (success) {
      setIsDateModalOpen(false);
      setSelectedExamDate(null);
    }
  };

  // Delete Exam Date
  const handleDeleteExamDate = async (examDate) => {
    if (!examDate?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this exam date?"
    );

    if (!confirmed) return;

    await deleteExamDate(examDate.id);
  };

  // Filter Configuration
  const filterConfig = {
    searches: [],

    customFilters: [
      <div key="class" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Class
        </label>

        <select
          value={s.classId}
          onChange={(e) =>
            s.handleClassChange(e.target.value)
          }
          className="h-9 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        >
          <option value="">All Classes</option>

          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>,

      <div key="subject" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Subject
        </label>

        <select
          value={s.subjectId}
          onChange={(e) =>
            s.handleSubjectChange(e.target.value)
          }
          className="h-9 min-w-[130px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        >
          <option value="">All Subjects</option>

          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>,

      <div key="date" className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">
          Exam Date
        </label>

        <select
          value={s.examDate}
          onChange={(e) =>
            s.handleExamDateChange(e.target.value)
          }
          className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-teal-500"
        >
          <option value="">All Dates</option>

          {filteredExamDates.map((date) => (
            <option key={date.id} value={date.id}>
              {date.exam_date}
            </option>
          ))}
        </select>
      </div>,
    ],

    hasFilters: s.hasFilters,
    onClearAll: s.handleClearAllFilters,
    layout: "compact",
  };

  return (
    <div className="space-y-4">

      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-teal-700"
      >
        <ArrowLeft size={15} />
        Back to Examinations
      </button>

      {/* Selected Examination */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <BookOpen size={21} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              Selected Examination
            </p>

            <h2 className="truncate text-base font-semibold text-slate-800">
              {examLoading
                ? "Loading examination..."
                : selectedExam?.name || `Examination #${examId}`}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CalendarDays size={13} />

                {selectedExam?.exam_type?.replaceAll("_", " ") ||
                  "Examination"}
              </span>

              <span className="text-slate-300">|</span>

              <span>ID: {examId}</span>
            </div>
          </div>
        </div>

        {selectedExam?.status && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              selectedExam.status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {selectedExam.status}
          </span>
        )}
      </div>

      {/* Exam Dates - Current Exam Only */}
      <ExamDatesTable
        examId={examId}
        examDates={filteredExamDates}
        loading={loadingExamDates}
        onAdd={openCreateDateModal}
        onEdit={openEditDateModal}
        onDelete={handleDeleteExamDate}
      />

      {/* Schedule Statistics */}
      <ExamDetailsStats stats={s.stats} />

      {/* Schedule Filters */}
      <FilterBar {...filterConfig} />

      {/* Examination Timetable - Current Exam Dates Only */}
      <ExamDetailsTable
        schedules={s.schedules}
        examDates={filteredExamDates}
        classes={classes}
        loading={s.loading}
        onAdd={s.openCreateModal}
        onEdit={s.openEditModal}
        onDelete={s.handleDelete}
      />

      {/* Exam Date Modal */}
      <ExamDateModal
        isOpen={isDateModalOpen}
        onClose={closeDateModal}
        onSubmit={handleSaveExamDate}
        selectedExamDate={selectedExamDate}
        saving={savingExamDate}
        exams={exams}
        examId={examId}
      />

      {/* Exam Schedule Modal */}
      <ExamScheduleModal
        isOpen={s.isModalOpen}
        onClose={s.closeModal}
        selectedSchedule={s.selectedSchedule}
        defaultValues={s.selectedSchedule}
        onSubmit={s.handleSaveSchedule}
        classes={classes}
        subjects={subjects}
        examDates={filteredExamDates}
        classesLoading={classesLoading}
        subjectsLoading={subjectsLoading}
        saving={s.saving}
      />

    </div>
  );
}
