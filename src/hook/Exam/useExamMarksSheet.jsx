
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import {
  getExamSubjectResults,
  createExamSubjectResults,
} from "../../redux/api_data/examApi/examSubjectResultApi";

import { getExamSchedules } from "../../redux/api_data/examApi/examScheduleApi";

import { getStudentEnrollments } from "../../redux/api_data/studentEnrollmentApi/studentEnrollmentApi";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function useExamMarksSheet({
  selectedExamId,
  selectedClassTab,
}) {
  // Data
  const [students, setStudents] = useState([]);
  const [marksSheetStudents, setMarksSheetStudents] = useState([]);
  const [marksSheetSubjects, setMarksSheetSubjects] = useState([]);
  const [savedSubjectMarks, setSavedSubjectMarks] = useState([]);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Loading
  const [marksSheetLoading, setMarksSheetLoading] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState(null);

  // --------------------------------------------------
  // Fetch Active Students
  // --------------------------------------------------

  const fetchStudents = useCallback(async () => {
    try {
      const response = await getStudentEnrollments({
        page: 1,
        limit: 100,
        status: "active",
      });

      const records = response.data?.data || [];

      setStudents(
        records.filter((item) => item.status === "active")
      );
    } catch (error) {
      console.error("Failed to fetch students:", error);

      toast.error(
        getErrorMessage(error, "Failed to fetch students.")
      );

      setStudents([]);
    }
  }, []);

  // --------------------------------------------------
  // Fetch Marks Sheet
  // --------------------------------------------------

  const fetchMarksSheet = useCallback(async () => {
    if (
      selectedExamId === "all" ||
      selectedClassTab === "all"
    ) {
      setMarksSheetStudents([]);
      setMarksSheetSubjects([]);
      setSavedSubjectMarks([]);
      return;
    }

    setMarksSheetLoading(true);

    try {
      const examId = Number(selectedExamId);
      const classId = Number(selectedClassTab);

      const [scheduleResponse, marksResponse] = await Promise.all([
        getExamSchedules({
          exam_id: examId,
          class_id: classId,
          page: 1,
          limit: 100,
        }),

        getExamSubjectResults({
          exam_id: examId,
          class_id: classId,
          page: 1,
          limit: 100,
        }),
      ]);

      const scheduleRecords = Array.isArray(
        scheduleResponse.data?.data
      )
        ? scheduleResponse.data.data
        : [];

      const marksRecords = Array.isArray(
        marksResponse.data?.data
      )
        ? marksResponse.data.data
        : [];

      setSavedSubjectMarks(marksRecords);

      const uniqueSubjects = [
        ...new Map(
          scheduleRecords.map((item) => [
            Number(item.subject_id),
            {
              subject_id: Number(item.subject_id),
              subject_name:
                item.subject?.name || "Unknown Subject",
              total_marks: Number(item.total_marks || 0),
              passing_marks: Number(item.passing_marks || 0),
            },
          ])
        ).values(),
      ];

      setMarksSheetSubjects(uniqueSubjects);

      const classStudents = students
        .filter(
          (student) =>
            student.status === "active" &&
            Number(student.class_id) === classId
        )
        .map((student) => ({
          id: Number(student.id),
          student_name:
            student.student_name ||
            student.name ||
            "Unknown Student",
          class_name:
            student.class_name ||
            student.classes?.name ||
            "Class",
          roll_number: student.roll_number || "-",
        }));

      setMarksSheetStudents(classStudents);
    } catch (error) {
      console.error("Failed to fetch marks sheet:", error);

      toast.error(
        getErrorMessage(error, "Failed to fetch marks sheet.")
      );

      setMarksSheetStudents([]);
      setMarksSheetSubjects([]);
      setSavedSubjectMarks([]);
    } finally {
      setMarksSheetLoading(false);
    }
  }, [selectedExamId, selectedClassTab, students]);

  // --------------------------------------------------
  // Initial Data
  // --------------------------------------------------

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --------------------------------------------------
  // Fetch on Exam / Class Change
  // --------------------------------------------------

  useEffect(() => {
    fetchMarksSheet();
  }, [fetchMarksSheet]);

  // --------------------------------------------------
  // Save Student Marks
  // --------------------------------------------------

  const handleSaveSubjectMarks = useCallback(
    async (payload) => {
      const studentId = payload?.students?.[0]?.student_id;

      if (!studentId) {
        toast.error("Student information is missing.");
        return false;
      }

      if (!payload?.exam_id || !payload?.class_id) {
        toast.error("Please select an exam and class.");
        return false;
      }

      setSavingStudentId(studentId);

      try {
        await createExamSubjectResults(payload);

        toast.success("Student marks saved successfully.");

        await fetchMarksSheet();

        return true;
      } catch (error) {
        console.error("Failed to save student marks:", error);

        const errors = error?.response?.data?.errors;

        if (errors) {
          Object.values(errors)
            .flat()
            .filter(Boolean)
            .forEach((message) => toast.error(message));
        } else {
          toast.error(
            getErrorMessage(error, "Failed to save student marks.")
          );
        }

        return false;
      } finally {
        setSavingStudentId(null);
      }
    },
    [fetchMarksSheet]
  );

  // --------------------------------------------------
  // Search Students
  // --------------------------------------------------

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(
      typeof value === "string" ? value : value.target.value
    );
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const filteredMarksSheetStudents = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return marksSheetStudents;

    return marksSheetStudents.filter((student) => {
      const name = String(
        student.student_name || ""
      ).toLowerCase();

      const rollNumber = String(
        student.roll_number || ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        rollNumber.includes(search)
      );
    });
  }, [marksSheetStudents, searchTerm]);

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const marksSheetStats = useMemo(() => {
    const totalStudents = marksSheetStudents.length;
    const totalSubjects = marksSheetSubjects.length;

    const marksEntered = savedSubjectMarks.filter(
      (item) =>
        item.obtained_marks !== null &&
        item.obtained_marks !== undefined &&
        item.obtained_marks !== ""
    ).length;

    const totalEntries = totalStudents * totalSubjects;

    return {
      total_students: totalStudents,
      total_subjects: totalSubjects,
      marks_entered: marksEntered,
      pending_marks: Math.max(
        totalEntries - marksEntered,
        0
      ),
    };
  }, [
    marksSheetStudents,
    marksSheetSubjects,
    savedSubjectMarks,
  ]);

  // --------------------------------------------------
  // Class Tab Counts
  // --------------------------------------------------

  const marksSheetClassTabCounts = useMemo(() => {
    return students.reduce((counts, student) => {
      if (student.status !== "active" || !student.class_id) {
        return counts;
      }

      const classId = String(student.class_id);

      counts[classId] = (counts[classId] || 0) + 1;

      return counts;
    }, {});
  }, [students]);

  return {
    // Data
    marksSheetStudents: filteredMarksSheetStudents,
    marksSheetSubjects,
    savedSubjectMarks,

    // Statistics
    marksSheetStats,
    marksSheetClassTabCounts,
    marksSheetActiveCount: marksSheetStudents.length,

    // Search
    searchTerm,
    handleSearchChange,
    handleClearSearch,

    // Loading
    marksSheetLoading,
    savingStudentId,

    // Handlers
    handleSaveSubjectMarks,

    // Fetch
    fetchStudents,
    fetchMarksSheet,
  };
}
