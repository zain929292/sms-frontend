
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function MarksSheetTable({
  students = [],
  subjects = [],
  savedMarks = [],
  examId,
  classId,
  loading = false,
  savingStudentId = null,
  onSave,
}) {
  const [marks, setMarks] = useState({});

  // --------------------------------------------------
  // Load Existing Marks
  // --------------------------------------------------

  useEffect(() => {
    const initialMarks = {};

    savedMarks.forEach((item) => {
      const key = `${item.student_id}-${item.subject_id}`;

      initialMarks[key] = item.obtained_marks ?? "";
    });

    setMarks(initialMarks);
  }, [savedMarks, examId, classId]);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getMarkKey = (studentId, subjectId) =>
    `${studentId}-${subjectId}`;

  // --------------------------------------------------
  // Handle Marks Change
  // --------------------------------------------------

  const handleMarksChange = (
    studentId,
    subjectId,
    value,
    totalMarks
  ) => {
    if (value !== "") {
      const numericValue = Number(value);

      if (
        !Number.isFinite(numericValue) ||
        numericValue < 0 ||
        numericValue > Number(totalMarks)
      ) {
        return;
      }
    }

    setMarks((prev) => ({
      ...prev,
      [getMarkKey(studentId, subjectId)]: value,
    }));
  };

  // --------------------------------------------------
  // Student Total
  // --------------------------------------------------

  const getStudentTotal = (studentId) => {
    let obtained = 0;
    let total = 0;
    let enteredCount = 0;

    subjects.forEach((subject) => {
      const value =
        marks[getMarkKey(studentId, subject.subject_id)];

      if (value !== undefined && value !== "") {
        obtained += Number(value);
        total += Number(subject.total_marks || 0);
        enteredCount += 1;
      }
    });

    return {
      obtained,
      total,
      enteredCount,
    };
  };

  // --------------------------------------------------
  // Save Student Marks
  // --------------------------------------------------

  const handleSave = async (student) => {
    const studentSubjects = subjects
      .filter((subject) => {
        const value = marks[
          getMarkKey(student.id, subject.subject_id)
        ];

        return value !== undefined && value !== "";
      })
      .map((subject) => ({
        subject_id: Number(subject.subject_id),
        obtained_marks: Number(
          marks[getMarkKey(student.id, subject.subject_id)]
        ),
      }));

    if (!studentSubjects.length || !onSave) {
      return;
    }

    await onSave({
      exam_id: Number(examId),
      class_id: Number(classId),
      students: [
        {
          student_id: Number(student.id),
          subjects: studentSubjects,
        },
      ],
    });
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading marks sheet...
      </div>
    );
  }

  // --------------------------------------------------
  // Empty States
  // --------------------------------------------------

  if (!examId || !classId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
        <p className="text-sm font-semibold text-slate-700">
          Select an exam and class
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Choose an exam and class to load the marks sheet.
        </p>
      </div>
    );
  }

  if (!subjects.length || !students.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No marks sheet data available
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {subjects.length === 0
            ? "No subjects are scheduled for this exam and class."
            : "No active students found in this class."}
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // Table
  // --------------------------------------------------

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left">

          {/* Header */}
          <thead className="bg-slate-50">
            <tr>
              <th className="sticky left-0 z-20 min-w-[190px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Student
              </th>

              <th className="min-w-[100px] border-b border-r border-slate-200 px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Roll No.
              </th>

              {subjects.map((subject) => (
                <th
                  key={subject.subject_id}
                  className="min-w-[125px] border-b border-r border-slate-200 px-3 py-3 text-center"
                >
                  <p className="text-xs font-bold text-slate-700">
                    {subject.subject_name || subject.name || "Subject"}
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-slate-500">
                    Out of {Number(subject.total_marks || 0)}
                  </p>
                </th>
              ))}

              <th className="min-w-[125px] border-b border-r border-slate-200 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Total
              </th>

              <th className="sticky right-0 z-20 min-w-[100px] border-b border-slate-200 bg-slate-50 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-600">
                Action
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => {
              const studentTotal = getStudentTotal(student.id);

              const isSaving =
                Number(savingStudentId) === Number(student.id);

              return (
                <tr
                  key={student.id}
                  className="transition hover:bg-slate-50/70"
                >
                  {/* Student */}
                  <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-3">
                    <p className="text-xs font-bold text-slate-800">
                      {student.student_name ||
                        student.student?.name ||
                        student.name ||
                        "-"}
                    </p>
                  </td>

                  {/* Roll Number */}
                  <td className="border-r border-slate-100 px-3 py-3">
                    <span className="text-xs font-medium text-slate-600">
                      {student.roll_number || "-"}
                    </span>
                  </td>

                  {/* Subject Marks */}
                  {subjects.map((subject) => {
                    const value =
                      marks[
                        getMarkKey(student.id, subject.subject_id)
                      ] ?? "";

                    return (
                      <td
                        key={subject.subject_id}
                        className="border-r border-slate-100 px-3 py-2"
                      >
                        <input
                          type="number"
                          min="0"
                          max={subject.total_marks}
                          step="0"
                          value={value}
                          placeholder="—"
                          onChange={(e) =>
                            handleMarksChange(
                              student.id,
                              subject.subject_id,
                              e.target.value,
                              subject.total_marks
                            )
                          }
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                        />
                      </td>
                    );
                  })}

                  {/* Total */}
                  <td className="border-r border-slate-100 px-3 py-3 text-center">
                    <p className="text-xs font-bold text-slate-800">
                      {studentTotal.enteredCount > 0
                        ? `${studentTotal.obtained.toFixed(2)} / ${studentTotal.total.toFixed(2)}`
                        : "—"}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {studentTotal.enteredCount}/{subjects.length} subjects
                    </p>
                  </td>

                  {/* Save */}
                  <td className="sticky right-0 z-10 bg-white px-3 py-3 text-center">
                    <button
                      type="button"
                      disabled={
                        studentTotal.enteredCount === 0 ||
                        isSaving ||
                        !onSave
                      }
                      onClick={() => handleSave(student)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-2 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save size={13} />
                      )}

                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}
