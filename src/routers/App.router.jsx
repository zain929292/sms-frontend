import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./Protected.router";
import DashboardLayout from "../layout/Layout.layout";
import Signin from "../screens/auth/Signin.auth";

// ==================== LAZY SCREENS ====================
const Main = lazy(() => import("../screens/dashboard/Main.dashboard"));



// Administration
const Users = lazy(() => import("../screens/user-screens/User"));

const Students = lazy(()=> import("../screens/student/Students"));
const StudentEnrollments = lazy (()=> import("../screens/student/StudentEnrollment"));


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


  // Administration
  { path: "administration/users", element: page(Users) },

  {path: "students" , element: page(Students)},
  {path: "student-promotion" , element: page(StudentEnrollments)}

];

const AppRouter = () => (
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
);

export default AppRouter;
