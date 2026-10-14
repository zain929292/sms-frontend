export const MOCK_CURRENT_USER = {
  id: 101,
  name: "Dr. Sarah Jenkins",
  role: "admin", // Options: "admin", "teacher", "student", "parent"
};

export const MOCK_STUDENTS = [
  { id: 1, name: "Alexander Wright", grade: "Grade 10-A" },
  { id: 2, name: "Emily Watson", grade: "Grade 9-B" },
  { id: 3, name: "Michael Chang", grade: "Grade 11-A" },
  { id: 4, name: "Sophia Martinez", grade: "Grade 10-B" },
  { id: 5, name: "Liam Johnson", grade: "Grade 12-C" },
];

export const MOCK_CLASSES = [
  { id: 101, name: "Mathematics 101", teacher: "Mr. Davis", room: "Room 302" },
  { id: 102, name: "Physics Fundamentals", teacher: "Dr. Aris", room: "Lab 2" },
  { id: 103, name: "English Literature", teacher: "Mrs. Gable", room: "Room 105" },
];

export const MOCK_ASSIGNMENTS = [
  { id: 1, title: "Algebra Chapter 4 Quiz", subject: "Mathematics", due: "2026-10-15", status: "Pending" },
  { id: 2, title: "Physics Lab Report #3", subject: "Physics", due: "2026-10-18", status: "Submitted" },
  { id: 3, title: "Essay on Hamlet", subject: "English", due: "2026-10-20", status: "Graded" },
];

export const MOCK_EXAMS = [
  { id: 1, title: "Mid-Term Mathematics", class: "Grade 10-A", date: "2026-10-25" },
  { id: 2, title: "Physics Practical", class: "Grade 11-B", date: "2026-10-28" },
];

export const MOCK_ATTENDANCE = {
  presentPercentage: 94.2,
  totalStudentsPresent: 471,
  totalStudents: 500,
};