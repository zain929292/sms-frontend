import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./Protected.router";
import DashboardLayout from "../layout/Layout.layout";
import Signin from "../screens/auth/Signin.auth";
import {AuthListener} from "../routers/AuthListener.router";
import { Eclipse } from "lucide-react";

// ==================== LAZY SCREENS ====================
const Main = lazy(() => import("../screens/dashboard/Main.dashboard"));
const Announcements = lazy(() => import("../screens/announcements/Announcements"));


// Administration
const Users = lazy(() => import("../screens/user-screens/User"));

const Students = lazy(()=> import("../screens/student/Students"));
const StudentEnrollments = lazy (()=> import("../screens/student/StudentEnrollment"));
const StudentAttendance = lazy (()=> import("../screens/studentAttendance/StudentAttendance"));
const StudentResults = lazy(()=> import("../screens/examResults/ExamResults"));

const AcademicSessions = lazy (()=> import("../screens/academic-sessions/AcademicSessions"));
const Classes = lazy (()=> import("../screens/classes/Classes"));
const Subjects = lazy (()=> import("../screens/subjects/subjects"));
const Timetable = lazy (()=> import("../screens/timetable/timetable"));

const Exams = lazy(()=> import("../screens/exam/Exams"));
const ExamDetails = lazy(()=> import("../screens/examDetails/ExamDetails"));

const User = lazy (()=> import("../screens/Users/Users"));
const Staff = lazy (()=> import("../screens/staff/Staff"));
const StaffAttendance = lazy(()=> import("../screens/staffAttendance/StaffAttendance"));
const StaffLeaveRequests = lazy(()=> import("../screens/leaveRequest/LeaveRequest"));
const SalaryStructure = lazy(()=> import("../screens/salaryStructure/SalaryStructure"));
const Payroll = lazy(()=> import("../screens/payroll/Payroll"));
const Expense = lazy(()=> import("../screens/expense/Expenses"));

const FeeStructure = lazy(()=> import("../screens/feeStructure/FeeStructure"));
const StudentFees = lazy(()=> import("../screens/studentFees/StudentFees"));
const StudentFeeHistory = lazy(()=> import("../screens/studentFees/StudentFeeHistory"));

const Roles = lazy(() => import("../screens/role-screens/Roles"));
const Permissions = lazy(
  () => import("../screens/permission-screens/Permissions"),
);
/** Small spinner shown ONLY in the content area. */
const PageLoader = () => (
  <div className="flex min-h-[50vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
  </div>
);

const page = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const PROTECTED_ROUTES = [
  // Overview
  { path: "dashboard", element: page(Main) },
  { path: "overview/dashboard", element: page(Main) },
  { path: "overview/announcements", element: page(Announcements)},


  // Administration
  { path: "administration/users", element: page(Users) },
  { path: "administration/roles", element: page(Roles) },
  { path: "administration/permissions", element: page(Permissions) },
  {path: "users" , element: page(User)},
  {path:"staff/employees", element: page(Staff)},
  {path:"staff/attendance", element: page(StaffAttendance)},
  {path: "/staff/leave-requests", element: page(StaffLeaveRequests)},
  {path: "/staff/salary-structure", element: page(SalaryStructure)},
  {path: "/finance/payroll", element: page(Payroll)},
  {path: "finance/expenses", element: page(Expense)},

  {path: "students/admission" , element: page(Students)},
  {path: "students" , element: page(StudentEnrollments)},
  {path: "operations/student-attendance" , element: page(StudentAttendance)},  
  {path: "student/result" , element: page(StudentResults)},

  {path: "academic/session" , element: page(AcademicSessions)},
  {path: "academics/classes" , element: page(Classes)},
  {path: "academics/subjects" , element: page(Subjects)},
  {path: "academics/timetable" , element: page(Timetable)},

  // Exams
  {path: "academics/exams", element: page(Exams)},
  {path: "academics/exam-details/:examId", element: page(ExamDetails)},

  // Finance
  {path: "finance/fee-structure" , element: page(FeeStructure)},
  {path: "finance/fees" , element: page(StudentFees)},
  {path: "finance/student-fee-history/:studentId" , element: page(StudentFeeHistory)},

];

const AppRouter = () => (
  <>
      <AuthListener />
  <Routes>
    <Route path="/" element={<Signin />} />

    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      {PROTECTED_ROUTES.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
  </>

);

export default AppRouter;
