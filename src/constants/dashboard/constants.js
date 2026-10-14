import {
  Users,
  Calendar,
  BookOpen,
  CalendarCheck,
  Wallet,
  GraduationCap,
  HeartPulse,
  BedDouble,
  Pill,
  Microscope,
  Activity,
  Stethoscope,
  UserPlus,
  FileText,
  AlertCircle,
  Syringe,
  TestTube,
} from "lucide-react";

export const EMPTY = [];
export const TOTAL_BEDS = 50;
export const LOW_STOCK_THRESHOLD = 50;
export const REFRESH_TTL_MS = 60 * 1000;

export const ROUTES = {
  patients: "/clinical/patients",
  appointments: "/clinical/appointments",
  admissions: "/clinical/ipd-admissions",
  beds: "/clinical/wards-and-beds",
  labTests: "/laboratory/lab-tests",
  labBookings: "/laboratory/test-booking",
  medicines: "/pharmacy-and-inventory/medicines",
  staff: "/administration/staff",
  dashboard: "/dashboard",
  prescriptions: "/clinical/prescriptions",
  labSamples: "/laboratory/lab-samples",
  labResults: "/laboratory/test-results",
};

export const FETCHERS = {

};

export const ALL_DATA = Object.keys(FETCHERS);

export const ROLE_DATA = {
  admin: ALL_DATA,
  receptionist: ALL_DATA,
  doctor: ["appointments", "admissions", "patients", "staff"],
  nurse: ["admissions", "appointments", "patients"],
  pharmacist: ["medicines", "patients"],
  labtechnician: ["labTests", "patients"],
};

export const ROLE_MESSAGE = {
  admin: "Here's what's happening at your school today.",
  teacher: "Here is your class overview and upcoming schedule for today.",
  student: "Welcome back! Check your classes, assignments, and announcements.",
  parent: "Here is an overview of your child's academic progress and attendance.",
};

export const TONES = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", link: "text-blue-600 hover:text-blue-700" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", link: "text-emerald-600 hover:text-emerald-700" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", link: "text-amber-600 hover:text-amber-700" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600", link: "text-purple-600 hover:text-purple-700" },
  teal: { bg: "bg-teal-50", icon: "text-teal-600", link: "text-teal-600 hover:text-teal-700" },
  rose: { bg: "bg-rose-50", icon: "text-rose-600", link: "text-rose-600 hover:text-rose-700" },
};

const ADMIN_ACTIONS = [
  { label: "Add Student", Icon: UserPlus, color: "bg-blue-500" },
  { label: "Add Teacher", Icon: Users, color: "bg-teal-500" },
  { label: "Manage Classes", Icon: BookOpen, color: "bg-emerald-500" },
  { label: "Mark Attendance", Icon: CalendarCheck, color: "bg-purple-500" },
  { label: "Manage Exams", Icon: GraduationCap, color: "bg-amber-500" },
  { label: "Collect Fees", Icon: Wallet, color: "bg-rose-500" },
];

export const QUICK_ACTIONS = {
  admin: ADMIN_ACTIONS,
  receptionist: ADMIN_ACTIONS,
  doctor: [
    { label: "My Appointments", Icon: Calendar, color: "bg-blue-500", to: ROUTES.appointments },
    { label: "My Patients", Icon: Users, color: "bg-teal-500", to: ROUTES.patients },
    { label: "My Admissions", Icon: HeartPulse, color: "bg-emerald-500", to: ROUTES.admissions },
    { label: "Write Prescription", Icon: FileText, color: "bg-purple-500", to: ROUTES.prescriptions },
    { label: "Lab Results", Icon: Microscope, color: "bg-amber-500", to: ROUTES.labResults },
    { label: "View Staff", Icon: Stethoscope, color: "bg-rose-500", to: ROUTES.staff },
  ],
  nurse: [
    { label: "Admissions", Icon: HeartPulse, color: "bg-teal-500", to: ROUTES.admissions },
    { label: "Appointments", Icon: Calendar, color: "bg-blue-500", to: ROUTES.appointments },
    { label: "Patients", Icon: Users, color: "bg-emerald-500", to: ROUTES.patients },
    { label: "View Beds", Icon: BedDouble, color: "bg-purple-500", to: ROUTES.beds },
  ],
  pharmacist: [
    { label: "Medicines", Icon: Pill, color: "bg-purple-500", to: ROUTES.medicines },
    { label: "Add Medicine", Icon: UserPlus, color: "bg-teal-500", to: ROUTES.medicines },
    { label: "View Prescriptions", Icon: FileText, color: "bg-blue-500", to: ROUTES.prescriptions },
    { label: "Low Stock Alerts", Icon: AlertCircle, color: "bg-amber-500", to: ROUTES.medicines },
  ],
  labtechnician: [
    { label: "Lab Tests", Icon: Microscope, color: "bg-amber-500", to: ROUTES.labTests },
    { label: "Test Bookings", Icon: Calendar, color: "bg-blue-500", to: ROUTES.labBookings },
    { label: "Lab Samples", Icon: Syringe, color: "bg-teal-500", to: ROUTES.labSamples },
    { label: "Lab Results", Icon: TestTube, color: "bg-purple-500", to: ROUTES.labResults },
  ],
};

export const DEFAULT_ACTIONS = [
  { label: "Dashboard", Icon: Activity, color: "bg-blue-500", to: ROUTES.dashboard },
];

export const APPOINTMENT_BADGE = {
  Completed: "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
};

export const ADMISSION_ACTIVE_BADGE = "bg-emerald-100 text-emerald-800";
export const DEFAULT_BADGE = "bg-slate-200 text-slate-700";