import { useState, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EMPTY,
  TOTAL_BEDS,
  LOW_STOCK_THRESHOLD,
  REFRESH_TTL_MS,
  ROUTES,
  FETCHERS,
  ROLE_DATA,
  ROLE_MESSAGE,
  QUICK_ACTIONS,
  DEFAULT_ACTIONS,
  APPOINTMENT_BADGE,
  ADMISSION_ACTIVE_BADGE,
  DEFAULT_BADGE,
} from "../constants/dashboard/constants";
import {
  selectPatients,
  patientNameOf,
  staffNameOf,
  buildNameMap,
  resolveName,
  latestN,
  isActiveAdmission,
} from "../constants/dashboard/helpers";

const lastFetched = {};
const inflight = {};

const loadDataset = (dispatch, key) => {
  if (!inflight[key]) {
    inflight[key] = FETCHERS[key]()
      .then((fetcher) => dispatch(fetcher()).unwrap())
      .then(() => {
        lastFetched[key] = Date.now();
        return true;
      })
      .catch(() => false)
      .finally(() => {
        delete inflight[key];
      });
  }
  return inflight[key];
};

export const useDashboardData = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth?.user);
  const admissions = useSelector((state) => state.admissions?.admissions) ?? EMPTY;
  const appointments = useSelector((state) => state.appointment?.appointments) ?? EMPTY;
  const staffList = useSelector((state) => state.staff?.staffList) ?? EMPTY;
  const medicines = useSelector((state) => state.medicine?.medicines) ?? EMPTY;
  const labTests = useSelector((state) => state.lab?.labTests) ?? EMPTY;
  const patients = useSelector(selectPatients);

const roleKey = "admin";

  const isDoctor = roleKey === "doctor";
  const myId = Number(currentUser?.id);

  const needs = ROLE_DATA[roleKey] || Object.keys(FETCHERS);
  const showAppointments = needs.includes("appointments");
  const showAdmissions = needs.includes("admissions");

  const show = useMemo(
    () => Object.fromEntries(needs.map((key) => [key, true])),
    [needs]
  );

  const [loaded, setLoaded] = useState(() =>
    Object.fromEntries(
      needs.filter((key) => lastFetched[key]).map((key) => [key, true])
    )
  );
  const [failed, setFailed] = useState(EMPTY);

  const markLoaded = useCallback((key) => {
    setLoaded((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const load = useCallback(
    (force = false) => {
      if (force) setFailed(EMPTY);
      const now = Date.now();

      needs.forEach((key) => {
        if (!force && now - (lastFetched[key] || 0) < REFRESH_TTL_MS) {
          markLoaded(key);
          return;
        }
        loadDataset(dispatch, key).then((ok) => {
          markLoaded(key);
          if (!ok) {
            setFailed((prev) => (prev.includes(key) ? prev : [...prev, key]));
          }
        });
      });
    },
    [dispatch, needs, markLoaded]
  );

  useEffect(() => {
    load();
  }, [load]);

  const { greeting, today } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    return {
      greeting:
        hour < 12
          ? "Good Morning"
          : hour < 17
          ? "Good Afternoon"
          : "Good Evening",
      today: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }, []);

  const patientNameById = useMemo(
    () =>
      buildNameMap(
        patients,
        (p) => p.id ?? p._id ?? p.patient_id,
        patientNameOf
      ),
    [patients]
  );

  const doctorNameById = useMemo(
    () => buildNameMap(staffList, (s) => s.id ?? s._id, staffNameOf),
    [staffList]
  );

  const appointmentSummary = useMemo(() => {
    let pending = 0;
    let minePending = 0;
    let mineCompleted = 0;
    const mine = isDoctor ? [] : null;

    for (const a of appointments) {
      if (a.status === "Pending") pending++;
      if (isDoctor && Number(a.doctor_id) === myId) {
        mine.push(a);
        if (a.status === "Pending") minePending++;
        else if (a.status === "Completed") mineCompleted++;
      }
    }

    return {
      total: appointments.length,
      pending,
      mineCount: mine ? mine.length : 0,
      minePending,
      mineCompleted,
      recent: latestN(isDoctor ? mine : appointments, "appointment_date"),
    };
  }, [appointments, isDoctor, myId]);

  const admissionSummary = useMemo(() => {
    let active = 0;
    let myActive = 0;
    const mine = isDoctor ? [] : null;

    for (const a of admissions) {
      const act = isActiveAdmission(a);
      if (act) active++;
      if (isDoctor && Number(a.doctor_id) === myId) {
        mine.push(a);
        if (act) myActive++;
      }
    }

    return {
      active,
      myActive,
      recent: latestN(isDoctor ? mine : admissions, "admission_date"),
    };
  }, [admissions, isDoctor, myId]);

  const lowStock = useMemo(() => {
    let count = 0;
    for (const m of medicines) {
      if ((Number(m.stock) || 0) < LOW_STOCK_THRESHOLD) count++;
    }
    return count;
  }, [medicines]);

  const recentAppointments = useMemo(
    () =>
      appointmentSummary.recent.map((app) => {
        const status = app.status || "Pending";
        return {
          id: app.id,
          name: resolveName(app, "patient", patientNameById),
          sub: `${resolveName(app, "doctor", doctorNameById)}\n${app.appointment_date || ""}`,
          status,
          badge: APPOINTMENT_BADGE[status] || DEFAULT_BADGE,
        };
      }),
    [appointmentSummary.recent, patientNameById, doctorNameById]
  );

  const recentAdmissions = useMemo(
    () =>
      admissionSummary.recent.map((adm) => ({
        id: adm.id,
        name: resolveName(adm, "patient", patientNameById),
        sub: `${resolveName(adm, "doctor", doctorNameById)}\n${adm.admission_date || ""}`,
        status: adm.status || "Discharged",
        badge: isActiveAdmission(adm) ? ADMISSION_ACTIVE_BADGE : DEFAULT_BADGE,
      })),
    [admissionSummary.recent, patientNameById, doctorNameById]
  );

  const bedOccupancy = Math.min(
    100,
    Math.round((admissionSummary.active / TOTAL_BEDS) * 100)
  );

  return {
    currentUser,
    roleKey,
    isDoctor,
    show,
    loaded,
    failed,
    greeting,
    today,
    showAppointments,
    showAdmissions,
    appointmentSummary,
    admissionSummary,
    recentAppointments,
    recentAdmissions,
    bedOccupancy,
    lowStock,
    patients,
    medicines,
    labTests,
    appointments,
    admissions,
    staffList,
    retryLoad: () => load(true),
  };
};