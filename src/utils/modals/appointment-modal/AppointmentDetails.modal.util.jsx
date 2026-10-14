/**
 * @file AppointmentDetails.modal.util.jsx
 * @module AppointmentDetailsModal
 * @description Patient-scoped appointment details modal.
 * Shows the current appointment + everything about THAT patient only:
 *   - Patient demographics
 *   - Current appointment
 *   - All prescriptions for this patient
 *   - All admissions/IPD history for this patient
 *   - Other appointments for this patient
 *
 * Every section is filtered strictly by `patient_id` so no cross-patient
 * data can ever appear here.
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
    Calendar,
    Clock,
    User,
    Stethoscope,
    Phone,
    Home,
    Droplet,
    ShieldAlert,
    FileText,
    Pill,
    Bed,
    Building,
    Hash,
    CheckCircle2,
    XCircle,
    Activity,
    Sparkles,
    ClipboardList,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";

/* ------------------------------- Helpers --------------------------------- */

const fmtDate = (d) => {
    if (!d) return "-";
    try {
        return new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return d;
    }
};

const fmtTime = (t) => {
    if (!t) return "-";
    const [h, m] = String(t).split(":");
    const hour = parseInt(h, 10);
    if (isNaN(hour)) return t;
    return `${hour % 12 || 12}:${m ?? "00"} ${hour >= 12 ? "PM" : "AM"}`;
};

const STATUS_STYLES = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rescheduled: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    admitted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    discharged: "bg-slate-100 text-slate-600 border-slate-200",
};

const statusStyle = (s) =>
    STATUS_STYLES[String(s || "").toLowerCase()] ||
    "bg-slate-100 text-slate-700 border-slate-200";

/* ---------------------------- Sub-components ----------------------------- */

const Section = ({ icon: Icon, title, count, children, emptyText }) => (
    <div className="border-t border-slate-100 pt-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
            <Icon size={16} className="text-[#00A3AD]" />
            {title}
            {typeof count === "number" && (
                <span className="ml-1 text-xs font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </h3>
        {count === 0 ? (
            <p className="text-xs text-slate-400 italic">{emptyText}</p>
        ) : (
            children
        )}
    </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2">
        {Icon && <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />}
        <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {label}
            </p>
            <p className="text-xs text-slate-800 font-medium truncate">
                {value || "—"}
            </p>
        </div>
    </div>
);

/* ------------------------------- Component ------------------------------- */

const AppointmentDetailsModal = ({ isOpen, onClose, appointment }) => {
    // Patients (for enriched lookup if appointment doesn't already have them)
    const patients = useSelector((s) => s.patient?.patients ?? []);
    const prescriptions = useSelector((s) => s.prescription?.prescriptions ?? []);
    const admissions = useSelector((s) => s.admissions?.admissions ?? []);

    // The current appointment (may come enriched or raw)
    const current = appointment || {};

    // Patient id — the single source of truth for scoping
    const patientId = current.patient_id != null ? Number(current.patient_id) : null;

    // Resolve full patient record (prefer enriched, fallback to lookup)
    const patient = useMemo(() => {
        if (!patientId) return current.patient || null;
        if (current.patient?.id) return current.patient;
        return patients.find((p) => Number(p.id || p._id) === patientId) || null;
    }, [current.patient, patients, patientId]);

    /* ---------------- PATIENT-SCOPED DATA (nothing leaks) ---------------- */

    // Only prescriptions for THIS patient
    const patientPrescriptions = useMemo(() => {
        if (!patientId) return [];
        return prescriptions
            .filter((p) => Number(p.patient_id) === patientId)
            .sort((a, b) => {
                const da = new Date(a.created_at || a.prescription_date || 0);
                const db = new Date(b.created_at || b.prescription_date || 0);
                return db - da; // newest first
            });
    }, [prescriptions, patientId]);

    // Only admissions for THIS patient
    const patientAdmissions = useMemo(() => {
        if (!patientId) return [];
        return admissions
            .filter((a) => Number(a.patient_id) === patientId)
            .sort((a, b) => {
                const da = new Date(a.admission_date || a.created_at || 0);
                const db = new Date(b.admission_date || b.created_at || 0);
                return db - da;
            });
    }, [admissions, patientId]);

    // Whether patient is currently admitted
    const isCurrentlyAdmitted = useMemo(
        () =>
            patientAdmissions.some(
                (a) => a.status === "Admitted" || a.status === "Active",
            ),
        [patientAdmissions],
    );

    // Other appointments for the same patient (excluding current)
    const otherAppointments = useMemo(() => {
        if (!patientId) return [];
        // appointments list isn't passed in; rely on current appointment only.
        // If you want history, pass an `allAppointments` prop from parent.
        return [];
    }, [patientId]);

    if (!isOpen) return null;

    const patientName =
        patient?.name ||
        current.patient?.name ||
        current.patient_name ||
        `Patient #${patientId ?? "?"}`;

    return (
        <ModalShell
            isOpen={isOpen}
            onClose={onClose}
            title={
                <>
                    Patient &amp; Appointment Details
                    <Sparkles size={16} className="text-teal-500 inline ml-1" />
                </>
            }
            subtitle={`${patientName} • Appointment #${current.id || current._id || "?"}`}
            icon={<ClipboardList size={22} />}
            iconClass="from-[#034A52] to-teal-500"
            accentShadow="shadow-teal-900/20"
            maxWidth="max-w-4xl"
        >
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* ---------------- Patient header card ---------------- */}
                <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50/60 to-cyan-50/60 p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white text-[#00A3AD] flex items-center justify-center text-xl font-extrabold shadow-sm">
                            {patientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-base truncate">
                                {patientName}
                            </p>
                            <p className="text-xs text-slate-500">
                                Patient ID: #{patientId ?? "—"}
                                {patient?.cnic ? ` • CNIC: ${patient.cnic}` : ""}
                            </p>
                        </div>
                        {isCurrentlyAdmitted && (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                <Bed size={11} /> Currently Admitted
                            </span>
                        )}
                    </div>
                </div>

                {/* ---------------- Patient demographics ---------------- */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <InfoRow
                        icon={User}
                        label="Father Name"
                        value={patient?.father_name}
                    />
                    <InfoRow icon={Phone} label="Phone" value={patient?.phone} />
                    <InfoRow
                        icon={Droplet}
                        label="Blood Group"
                        value={patient?.blood_group}
                    />
                    <InfoRow
                        icon={Calendar}
                        label="Age / Gender"
                        value={
                            [patient?.age, patient?.gender].filter(Boolean).join(" / ") || "—"
                        }
                    />
                    <InfoRow
                        icon={ShieldAlert}
                        label="Emergency Contact"
                        value={patient?.emergency_contact}
                    />
                    <div className="col-span-2 sm:col-span-3">
                        <InfoRow icon={Home} label="Address" value={patient?.address} />
                    </div>
                </div>

                {/* ---------------- Current Appointment ---------------- */}
                <Section
                    icon={Calendar}
                    title="Current Appointment"
                    count={1}
                    emptyText=""
                >
                    <div className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <InfoRow
                            icon={Hash}
                            label="Token"
                            value={current.token_no ?? "—"}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Date"
                            value={fmtDate(current.appointment_date)}
                        />
                        <InfoRow
                            icon={Clock}
                            label="Time"
                            value={fmtTime(current.appointment_time)}
                        />
                        <InfoRow
                            icon={Stethoscope}
                            label="Doctor"
                            value={
                                current.doctor?.name ||
                                current.doctor_name ||
                                `Doctor #${current.doctor_id ?? "—"}`
                            }
                        />
                        <div className="col-span-2 sm:col-span-4 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Status
                            </span>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusStyle(
                                    current.status || "Pending",
                                )}`}
                            >
                                {current.status || "Pending"}
                            </span>
                        </div>
                    </div>
                </Section>

                {/* ---------------- Prescriptions (patient-scoped) ---------------- */}
                <Section
                    icon={Pill}
                    title="Prescriptions"
                    count={patientPrescriptions.length}
                    emptyText="No prescriptions recorded for this patient."
                >
                    <div className="space-y-2">
                        {patientPrescriptions.map((p) => {
                            const meds = p.prescribe_medicines || p.medicines || [];
                            return (
                                <div
                                    key={p.id || p._id}
                                    className="rounded-xl border border-slate-200 bg-white p-3"
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <Pill size={14} className="text-teal-600" />
                                            <span className="font-semibold text-xs text-slate-800">
                                                Prescription #{p.id || p._id || "—"}
                                            </span>
                                            {p.prescription_date && (
                                                <span className="text-[10px] text-slate-400">
                                                    • {fmtDate(p.prescription_date)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                            {meds.length} medicine{meds.length === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                    {(p.diagnosis || p.symptoms) && (
                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                                            {p.diagnosis && (
                                                <p>
                                                    <span className="font-bold">Diagnosis:</span>{" "}
                                                    {p.diagnosis}
                                                </p>
                                            )}
                                            {p.symptoms && (
                                                <p>
                                                    <span className="font-bold">Symptoms:</span>{" "}
                                                    {p.symptoms}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {meds.length > 0 && (
                                        <ul className="mt-2 flex flex-wrap gap-1.5">
                                            {meds.slice(0, 8).map((m, i) => (
                                                <li
                                                    key={i}
                                                    className="text-[10px] font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100"
                                                >
                                                    {m.medicine_name || m.name || "Medicine"}
                                                    {m.dosage ? ` • ${m.dosage}` : ""}
                                                </li>
                                            ))}
                                            {meds.length > 8 && (
                                                <li className="text-[10px] text-slate-400 self-center">
                                                    +{meds.length - 8} more
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                    {p.notes && (
                                        <p className="mt-2 text-[11px] text-slate-500 italic">
                                            {p.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Section>

                {/* ---------------- Admissions (patient-scoped) ---------------- */}
                <Section
                    icon={Bed}
                    title="Admission History"
                    count={patientAdmissions.length}
                    emptyText="This patient has never been admitted."
                >
                    <div className="space-y-2">
                        {patientAdmissions.map((a) => (
                            <div
                                key={a.id || a._id}
                                className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <Building size={14} className="text-teal-600" />
                                        <span className="font-semibold text-xs text-slate-800">
                                            Admission #{a.id || a._id || "—"}
                                        </span>
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusStyle(
                                                a.status,
                                            )}`}
                                        >
                                            {a.status === "Admitted" ? (
                                                <CheckCircle2 size={10} />
                                            ) : a.status === "Discharged" ? (
                                                <XCircle size={10} />
                                            ) : (
                                                <Activity size={10} />
                                            )}
                                            {a.status || "—"}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {fmtDate(a.admission_date)}
                                        {a.discharge_date ? ` → ${fmtDate(a.discharge_date)}` : ""}
                                    </span>
                                </div>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
                                    {a.reason && (
                                        <p className="sm:col-span-3">
                                            <span className="font-bold">Reason:</span> {a.reason}
                                        </p>
                                    )}
                                    {a.notes && (
                                        <p className="sm:col-span-3">
                                            <span className="font-bold">Notes:</span> {a.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ---------------- Other appointments ---------------- */}
                {otherAppointments.length > 0 && (
                    <Section
                        icon={Calendar}
                        title="Other Appointments"
                        count={otherAppointments.length}
                        emptyText=""
                    >
                        <div className="space-y-2">
                            {otherAppointments.map((a) => (
                                <div
                                    key={a.id || a._id}
                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs"
                                >
                                    <span className="font-medium text-slate-700">
                                        #{a.id} • {fmtDate(a.appointment_date)} •{" "}
                                        {fmtTime(a.appointment_time)}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusStyle(
                                            a.status,
                                        )}`}
                                    >
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ---------------- Patient notes ---------------- */}
                {patient?.notes && (
                    <Section icon={FileText} title="Patient Notes" count={1} emptyText="">
                        <p className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">
                            {patient.notes}
                        </p>
                    </Section>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 p-5">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95"
                >
                    Close
                </button>
            </div>
        </ModalShell>
    );
};

export default AppointmentDetailsModal;