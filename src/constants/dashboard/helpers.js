import { EMPTY } from "./constants";

export const selectPatients = (state) => {
  const p = state.patients || state.patient;
  if (!p) return EMPTY;
  const list = Array.isArray(p) ? p : p.patientsList || p.patients || p.data;
  return Array.isArray(list) ? list : EMPTY;
};

export const joinName = (o) =>
  `${o.first_name || ""} ${o.last_name || ""}`.trim() || null;

export const patientNameOf = (p) =>
  p.name ||
  p.full_name ||
  p.patient_name ||
  p.user?.name ||
  p.user?.full_name ||
  joinName(p);

export const staffNameOf = (s) => s.name || s.user?.name || s.full_name || joinName(s);

export const buildNameMap = (list, getId, getName) => {
  const map = new Map();
  for (const item of list) {
    const id = getId(item);
    const name = getName(item);
    if (id != null && name) map.set(String(id), name);
  }
  return map;
};

export const resolveName = (record, kind, byId) => {
  const label = kind === "patient" ? "Patient" : "Doctor";
  const nested = record[kind];
  const direct =
    nested?.name || record[`${kind}_details`]?.name || record[`${kind}Name`];

  if (typeof direct === "string" && direct && !direct.includes(`${label} #`)) {
    return direct;
  }

  const id = record[`${kind}_id`] || nested?.id || nested?._id;
  return byId.get(String(id)) || `${label} #${id || "Unknown"}`;
};

export const latestN = (list, dateKey, n = 5) => {
  const top = [];
  for (const item of list) {
    const ts = Date.parse(item[dateKey]) || 0;
    if (top.length === n && ts <= top[n - 1].ts) continue;
    let i = top.length;
    while (i > 0 && top[i - 1].ts < ts) i--;
    top.splice(i, 0, { ts, item });
    if (top.length > n) top.pop();
  }
  return top.map((t) => t.item);
};

export const isActiveAdmission = (a) =>
  a.status === "Admitted" || a.status === "Active";