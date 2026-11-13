
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import studentAttendanceApi from "../../redux/api_data/studentAttendanceApi/studentAttendanceApi";
import { getStudentEnrollments } from "../../redux/api_data/studentEnrollmentApi/studentEnrollmentApi";

const getCurrentMonth = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export default function useStudentAttendance() {
  const [enrollments, setEnrollments] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Default: All Dates
  const [attendanceDate, setAttendanceDate] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingCell, setSavingCell] = useState("");

  // Fetch active enrolled students
  const fetchEnrollments = useCallback(async () => {
    try {
      const response = await getStudentEnrollments({
        page: 1,
        limit: 100,
        status: "active",
      });

      const records = response.data?.data || [];

      const activeEnrollments = records.filter(
        (item) => item.status === "active"
      );

      setEnrollments(activeEnrollments);

      return activeEnrollments;
    } catch (error) {
      console.error("Failed to fetch enrolled students:", error);

      toast.error(
        getErrorMessage(error, "Failed to fetch enrolled students.")
      );

      setEnrollments([]);
      return [];
    }
  }, []);

  // Generate unique active classes
  const classes = useMemo(() => {
    const uniqueClasses = new Map();

    enrollments.forEach((item) => {
      if (item.class_id) {
        uniqueClasses.set(String(item.class_id), {
          id: item.class_id,
          name: item.class_name || `Class ${item.class_id}`,
          status: "active",
        });
      }
    });

    return Array.from(uniqueClasses.values());
  }, [enrollments]);

  // Reset selected class if it no longer exists
  useEffect(() => {
    if (
      selectedClassId !== "all" &&
      !classes.some(
        (item) => String(item.id) === String(selectedClassId)
      )
    ) {
      setSelectedClassId("all");
    }
  }, [classes, selectedClassId]);

  // Fetch attendance for selected month or date
  const fetchAttendance = useCallback(async () => {
    setLoading(true);

    try {
      const [year, month] = selectedMonth.split("-").map(Number);

      const params = {
        page: 1,
        limit: 100,
        month,
        year,
      };

      // Specific date selected
      if (attendanceDate !== "all") {
        params.attendance_date = attendanceDate;
      }

      const response =
        await studentAttendanceApi.getStudentAttendance(params);

      setAttendance(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);

      toast.error(
        getErrorMessage(error, "Failed to load attendance.")
      );
    } finally {
      setLoading(false);
    }
  }, [attendanceDate, selectedMonth]);

  // Initial data loading
  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Fetch attendance whenever month/date changes
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Generate month dates
  const dates = useMemo(() => {
    if (!selectedMonth) return [];

    const [year, month] = selectedMonth.split("-").map(Number);

    const totalDays = new Date(year, month, 0).getDate();
    const today = new Date();

    const isCurrentMonth =
      year === today.getFullYear() &&
      month === today.getMonth() + 1;

    const lastDay = isCurrentMonth
      ? today.getDate()
      : totalDays;

    const allDates = Array.from(
      { length: lastDay },
      (_, index) => {
        const day = index + 1;

        const date = `${year}-${String(month).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;

        const dateObject = new Date(year, month - 1, day);

        return {
          day,
          date,
          weekday: dateObject.toLocaleDateString("en-US", {
            weekday: "short",
          }),
        };
      }
    );

    // All Dates selected
    if (attendanceDate === "all") {
      return allDates;
    }

    // Specific date selected
    return allDates.filter(
      (item) => item.date === attendanceDate
    );
  }, [selectedMonth, attendanceDate]);

  // Class-wise active student list
  const students = useMemo(() => {
    return enrollments
      .filter((item) =>
        selectedClassId === "all"
          ? true
          : String(item.class_id) === String(selectedClassId)
      )
      .filter((item) =>
        String(item.student_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .map((item) => ({
        id: item.student_id,
        name: item.student_name || "Unknown Student",
        admission_number: item.admission_number || "-",
        class_id: item.class_id,
        class_name: item.class_name,
        enrollment_id: item.id,
      }));
  }, [enrollments, selectedClassId, searchTerm]);

  // Attendance lookup: student ID + date
  const attendanceMap = useMemo(() => {
    const map = new Map();

    attendance.forEach((record) => {
      map.set(
        `${record.student_id}_${record.attendance_date}`,
        record
      );
    });

    return map;
  }, [attendance]);

  // Create or update attendance after user interaction
  const handleStatusChange = useCallback(
    async (studentId, date, status) => {
      const key = `${studentId}_${date}`;

      // Prevent Sunday attendance
      if (new Date(`${date}T00:00:00`).getDay() === 0) {
        toast.error("Sunday attendance cannot be marked.");
        return;
      }

      if (savingCell) return;

      const existingRecord = attendanceMap.get(key);

      // Do not create unnecessary absent records
      if (!existingRecord && status === "absent") return;

      // Do not update if status is unchanged
      if (existingRecord?.status === status) return;

      setSavingCell(key);

      try {
        const payload = {
          student_id: Number(studentId),
          attendance_date: date,
          status,
          remarks: existingRecord?.remarks ?? null,
        };

        let response;

        if (existingRecord?.id) {
          response = await studentAttendanceApi.updateStudentAttendance(
            existingRecord.id,
            payload
          );
        } else {
          response = await studentAttendanceApi.createStudentAttendance(
            payload
          );
        }

        const savedRecord = response.data?.data;

        if (!savedRecord?.id) {
          throw new Error(
            "Attendance saved, but record ID was not returned."
          );
        }

        setAttendance((previous) => {
          const updatedRecord = {
            ...existingRecord,
            ...savedRecord,
            ...payload,
          };

          if (existingRecord) {
            return previous.map((item) =>
              item.id === existingRecord.id
                ? updatedRecord
                : item
            );
          }

          return [...previous, updatedRecord];
        });

        toast.success("Attendance updated successfully.");
      } catch (error) {
        console.error("Failed to update attendance:", error);

        const errors = error?.response?.data?.errors;

        if (errors) {
          Object.values(errors)
            .flat()
            .filter(Boolean)
            .forEach((message) => toast.error(message));
        } else {
          toast.error(
            getErrorMessage(error, "Failed to update attendance.")
          );
        }
      } finally {
        setSavingCell("");
      }
    },
    [attendanceMap, savingCell]
  );

  // Class tab change
  const handleClassChange = useCallback((value) => {
    setSelectedClassId(String(value));
  }, []);

  const handleClassTabChange = handleClassChange;

  // Month change: reset to All Dates
  const handleMonthChange = useCallback((value) => {
    if (!value) return;

    setSelectedMonth(value);
    setAttendanceDate("all");
  }, []);

  // Date tab change
  const handleDateChange = useCallback(
    (value) => {
      if (!value) return;

      // All Dates selected
      if (value === "all") {
        setAttendanceDate("all");
        return;
      }

      // Prevent selecting a date outside selected month
      if (!value.startsWith(`${selectedMonth}-`)) return;

      // Prevent selecting future dates in current month
      const today = new Date();
      const [year, month] = selectedMonth.split("-").map(Number);

      const isCurrentMonth =
        year === today.getFullYear() &&
        month === today.getMonth() + 1;

      if (isCurrentMonth && value > today.toISOString().slice(0, 10)) {
        return;
      }

      setAttendanceDate(value);
    },
    [selectedMonth]
  );

  // Student search
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(
      typeof event === "string" ? event : event.target.value
    );
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Filtered students for search dropdown
  const filteredStudents = useMemo(() => {
    return enrollments
      .filter((item) =>
        String(item.student_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .map((item) => ({
        value: item.student_id,
        id: item.student_id,
        label: item.student_name || "Unknown Student",
        admission_number: item.admission_number || "-",
        class_id: item.class_id,
        class_name: item.class_name,
        enrollment_id: item.id,
        details: item,
      }));
  }, [enrollments, searchTerm]);

  // Selected class details
  const selectedClass = classes.find(
    (item) => String(item.id) === String(selectedClassId)
  );

  // Total active enrolled students
  const activeCount = enrollments.length;

  // Class-wise student counts
  const classTabCounts = useMemo(() => {
    const counts = {};

    enrollments.forEach((item) => {
      const classId = String(item.class_id);

      counts[classId] = (counts[classId] || 0) + 1;
    });

    return counts;
  }, [enrollments]);

  // Attendance statistics
  const stats = useMemo(() => {
    const studentIds = new Set(
      students.map((student) => student.id)
    );

    const classAttendance = attendance.filter((record) =>
      studentIds.has(record.student_id)
    );

    return {
      total: students.length,
      total_students: students.length,
      present: classAttendance.filter(
        (item) => item.status === "present"
      ).length,
      absent: classAttendance.filter(
        (item) => item.status === "absent"
      ).length,
      leave: classAttendance.filter(
        (item) => item.status === "leave"
      ).length,
      late: classAttendance.filter(
        (item) => item.status === "late"
      ).length,
    };
  }, [attendance, students]);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedClassId("all");
  }, []);

  // Displayed attendance
  const displayedAttendance = useMemo(() => {
    return attendance.filter((record) =>
      students.some(
        (student) => student.id === record.student_id
      )
    );
  }, [attendance, students]);

  // Export attendance CSV
  const handleExport = useCallback(() => {
    if (!displayedAttendance.length) {
      toast.error("No attendance records available to export.");
      return;
    }

    const headers = [
      "Student ID",
      "Attendance Date",
      "Status",
      "Remarks",
    ];

    const rows = displayedAttendance.map((record) => [
      record.student_id,
      record.attendance_date,
      record.status,
      record.remarks || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download = `student-attendance-${selectedMonth}-${
      attendanceDate === "all" ? "all-dates" : attendanceDate
    }.csv`;

    link.click();

    URL.revokeObjectURL(url);
  }, [displayedAttendance, attendanceDate, selectedMonth]);

  const hasFilters = Boolean(
    searchTerm || selectedClassId !== "all"
  );

  return {
    enrollments,
    classes,
    students,
    dates,
    attendance,
    attendanceMap,
    stats,

    selectedClassId,
    selectedClassTab: selectedClassId,
    selectedClass,
    selectedMonth,
    attendanceDate,
    searchTerm,

    activeCount,
    classTabCounts,

    filteredStudents,
    displayedAttendance,
    hasFilters,

    loading,
    savingCell,

    handleClassChange,
    handleClassTabChange,
    handleMonthChange,
    handleDateChange,
    handleSearchChange,
    handleClearSearch,
    handleClearAllFilters,
    handleStatusChange,
    handleExport,

    fetchAttendance,
    fetchEnrollments,
  };
}
