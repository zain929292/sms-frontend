/**
 * @file exportUtils.js
 * @module Utils/ExportUtils
 * @description Utilities for exporting data to CSV/Excel.
 */

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Extract plain text from a value that may be a React element. */
const extractText = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value))
    return value.map(extractText).filter(Boolean).join(" ");
  if (value?.props?.children != null) return extractText(value.props.children);
  return "";
};

/** Escape a value for safe CSV output. */
const cleanValue = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

/** Trigger a browser download for a CSV string. */
const downloadCsv = (csvContent, filename) => {
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/* -------------------------------------------------------------------------- */
/*                              Core Export                                   */
/* -------------------------------------------------------------------------- */

/**
 * Export data to CSV.
 * @param {Array} data
 * @param {string} filename
 * @param {Array} [columns]  Column config: [{ key, label?, render? }]
 */
export const exportToExcel = (data, filename = "export", columns = null) => {
  if (!data?.length) {
    alert("No data available to export.");
    return;
  }

  const resolvedColumns =
    columns || Object.keys(data[0]).map((key) => ({ key, label: key }));

  const headers = resolvedColumns.map((c) => c.label || c.header || c.key);

  const rows = data.map((row) =>
    resolvedColumns.map((col) => {
      if (col.render) {
        return extractText(col.render(row)) || row[col.key] || "";
      }
      return row[col.key] ?? "";
    }),
  );

  let csv = headers.map(cleanValue).join(",") + "\n";
  for (const r of rows) {
    csv += r.map(cleanValue).join(",") + "\n";
  }

  downloadCsv(csv, filename);
};

/* -------------------------------------------------------------------------- */
/*                              Formatters                                    */
/* -------------------------------------------------------------------------- */

const formatDateForExport = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${m}/${d}/${date.getFullYear()}`;
  } catch {
    return String(dateString) || "N/A";
  }
};

const formatTimeForExport = (timeString) => {
  if (!timeString) return "N/A";
  try {
    if (timeString instanceof Date) {
      if (isNaN(timeString.getTime())) return "N/A";
      let h = timeString.getHours();
      const min = String(timeString.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${h}:${min} ${ampm}`;
    }
    const match = String(timeString).match(/(\d{1,2}):(\d{2})/);
    if (!match) return String(timeString);
    const hour = parseInt(match[1], 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${match[2]} ${ampm}`;
  } catch {
    return String(timeString) || "N/A";
  }
};

const formatStatusForExport = (status) =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    : "N/A";

/* -------------------------------------------------------------------------- */
/*                          Appointments Export                               */
/* -------------------------------------------------------------------------- */

/** Compact field resolver: tries multiple aliases in order. */
const pick = (row, ...keys) => {
  for (const k of keys) {
    const val = k.includes(".")
      ? k.split(".").reduce((o, p) => o?.[p], row)
      : row[k];
    if (val != null && val !== "") return val;
  }
  return undefined;
};

export const exportAppointmentsToExcel = (
  data,
  filename = "appointments_export",
) => {
  const columns = [
    {
      key: "id",
      label: "Appointment ID",
      render: (r) =>
        pick(r, "id", "_id", "appointment_id")
          ? `#${pick(r, "id", "_id", "appointment_id")}`
          : "N/A",
    },
    {
      key: "patient_name",
      label: "Patient Name",
      render: (r) =>
        pick(r, "patient.name", "patient_name", "patientName") ?? "N/A",
    },
    {
      key: "patient_id",
      label: "Patient ID",
      render: (r) => pick(r, "patient_id", "patientId") ?? "N/A",
    },
    {
      key: "doctor_name",
      label: "Doctor Name",
      render: (r) =>
        pick(r, "doctor.name", "doctor_name", "doctorName") ?? "N/A",
    },
    {
      key: "doctor_id",
      label: "Doctor ID",
      render: (r) => pick(r, "doctor_id", "doctorId") ?? "N/A",
    },
    {
      key: "appointment_date",
      label: "Appointment Date",
      render: (r) =>
        formatDateForExport(
          pick(
            r,
            "appointment_date",
            "appointmentDate",
            "date",
            "booking_date",
          ),
        ),
    },
    {
      key: "appointment_time",
      label: "Appointment Time",
      render: (r) =>
        formatTimeForExport(
          pick(
            r,
            "appointment_time",
            "appointmentTime",
            "time",
            "booking_time",
          ),
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) =>
        formatStatusForExport(pick(r, "status", "appointment_status")),
    },
    {
      key: "token_no",
      label: "Token Number",
      render: (r) => pick(r, "token_no", "token", "tokenNumber") ?? "N/A",
    },
  ];

  const filenameWithDate = `${filename}_${new Date().toISOString().split("T")[0]}`;
  exportToExcel(data, filenameWithDate, columns);
};

/* -------------------------------------------------------------------------- */
/*                           Filters Helper                                   */
/* -------------------------------------------------------------------------- */

export const exportWithFilters = (data, filename = "export", filters = {}) => {
  let name = filename;
  if (filters.startDate && filters.endDate) {
    name += `_${filters.startDate.replace(/-/g, "")}_to_${filters.endDate.replace(/-/g, "")}`;
  } else if (filters.startDate) {
    name += `_from_${filters.startDate.replace(/-/g, "")}`;
  } else if (filters.endDate) {
    name += `_until_${filters.endDate.replace(/-/g, "")}`;
  }
  exportAppointmentsToExcel(data, name);
};

/* -------------------------------------------------------------------------- */
/*                        Column Configuration Helper                         */
/* -------------------------------------------------------------------------- */

export const getExportColumns = (columns) =>
  columns
    .filter((col) => col.key !== "actions" && !col.hideFromExport)
    .map((col) => ({
      key: col.key,
      label: col.label || col.key,
      render: (row) =>
        col.render
          ? extractText(col.render(row)) || row[col.key] || ""
          : row[col.key] || "",
    }));
