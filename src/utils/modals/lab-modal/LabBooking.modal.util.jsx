/**
 * @file LabBooking.modal.util.jsx
 * @module LabBookingModal
 * @description Lab booking create / update with multi-test support.
 *              Uses the separate `lab-booking-tests` junction API.
 *              Doctor field removed.
 */

import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Calendar,
  User,
  FlaskConical,
  FileText,
  Edit,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createLabTestBooking,
  updateLabTestBooking,
  fetchAllLabTestBookings,
  fetchAllLabTests,
  fetchAllLabBookingTests,
  createLabBookingTest,
  deleteLabBookingTest,
} from "../../../redux/slices/Lab.slice.redux";
import { fetchPatients } from "../../../redux/slices/Patients.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const DEFAULT_FORM = {
  patient_id: "",
  patient_name: "",
  booking_date: "",
  notes: "",
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const initialState = {
  form: DEFAULT_FORM,
  errors: {},
  patientSearchTerm: "",
  testSearchTerm: "",
  patientDropdownOpen: false,
  testDropdownOpen: false,
  // Selected lab tests for this booking: [{ id, test_name, price, category }]
  selectedTests: [],
  // In edit mode: map of testId → junction row id, so we can diff on submit
  existingLinks: {},
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { ...initialState };

    case "INIT":
      return {
        ...initialState,
        form: action.form,
        patientSearchTerm: action.form.patient_name || "",
        selectedTests: action.selectedTests || [],
        existingLinks: action.existingLinks || {},
      };

    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };

    case "SET_SEARCH":
      return { ...state, [action.field]: action.value };

    case "SELECT_PATIENT":
      return {
        ...state,
        form: {
          ...state.form,
          patient_id: action.patient.id,
          patient_name: action.patient.name,
        },
        patientSearchTerm: action.patient.name,
        patientDropdownOpen: false,
        errors: { ...state.errors, patient_id: "" },
      };

    case "CLEAR_PATIENT":
      return {
        ...state,
        form: { ...state.form, patient_id: "", patient_name: "" },
      };

    case "ADD_TEST": {
      const id = action.test.id ?? action.test._id;
      if (state.selectedTests.some((t) => String(t.id) === String(id))) {
        return state;
      }
      return {
        ...state,
        selectedTests: [
          ...state.selectedTests,
          {
            id,
            test_name:
              action.test.test_name || action.test.name || `Test #${id}`,
            price: action.test.price ?? action.test.test_price ?? 0,
            category: action.test.category || "",
          },
        ],
        testSearchTerm: "",
        testDropdownOpen: false,
        errors: { ...state.errors, lab_tests: "" },
      };
    }

    case "REMOVE_TEST":
      return {
        ...state,
        selectedTests: state.selectedTests.filter(
          (t) => String(t.id) !== String(action.id),
        ),
      };

    case "SET_ERRORS":
      return { ...state, errors: action.errors };

    default:
      return state;
  }
};

const validate = (form, selectedTests) => {
  const errors = {};
  if (!form.patient_id) errors.patient_id = "Patient is required";
  if (!form.booking_date) errors.booking_date = "Booking date is required";
  if (!selectedTests.length)
    errors.lab_tests = "At least one lab test is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const LabBookingModal = ({ isOpen, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(initialData);

  const labTests = useSelector((s) => s.lab?.labTests ?? []);
  const patients = useSelector((s) => s.patient?.patients ?? []);
  const bookingTests = useSelector((s) => s.lab?.labBookingTests ?? []);

  const [state, dispatchAction] = useReducer(reducer, initialState);

  /* ------------------------------- Effects ------------------------------- */

  useEffect(() => {
    if (!isOpen) return;
    dispatch(fetchAllLabTests());
    dispatch(fetchAllLabBookingTests());
    dispatch(fetchPatients());
  }, [isOpen, dispatch]);

  // Populate form on open / when dependencies arrive
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && initialData) {
      const bookingId = initialData.id || initialData._id;

      const existingRows = bookingTests.filter(
        (r) => Number(r.lab_booking_id) === Number(bookingId),
      );

      const selectedTests = existingRows
        .map((row) => {
          const testId = Number(row.lab_test_id);
          const test = labTests.find((t) => Number(t.id) === testId);
          return {
            id: testId,
            test_name: test?.test_name || test?.name || `Test #${testId}`,
            price: test?.price ?? test?.test_price ?? 0,
            category: test?.category || "",
          };
        })
        .filter(Boolean);

      const existingLinks = {};
      existingRows.forEach((row) => {
        existingLinks[Number(row.lab_test_id)] = row.id || row._id;
      });

      dispatchAction({
        type: "INIT",
        form: {
          patient_id: initialData.patient_id || "",
          patient_name: initialData.patient_name || "",
          booking_date: initialData.booking_date
            ? initialData.booking_date.split(" ")[0]
            : "",
          notes: initialData.notes || "",
        },
        selectedTests,
        existingLinks,
      });
    } else {
      dispatchAction({ type: "RESET" });
    }
  }, [isOpen, isEditMode, initialData, bookingTests, labTests]);

  /* ------------------------------ Handlers ------------------------------- */

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const handlePatientSearch = useCallback((value) => {
    dispatchAction({ type: "SET_SEARCH", field: "patientSearchTerm", value });
    if (value === "") dispatchAction({ type: "CLEAR_PATIENT" });
  }, []);

  const handleTestSearch = useCallback((value) => {
    dispatchAction({ type: "SET_SEARCH", field: "testSearchTerm", value });
  }, []);

  const handleAddTest = useCallback((test) => {
    dispatchAction({ type: "ADD_TEST", test });
  }, []);

  const handleRemoveTest = useCallback((id) => {
    dispatchAction({ type: "REMOVE_TEST", id });
  }, []);

  /* --------------------------- Submit handler ---------------------------- */

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const errors = validate(state.form, state.selectedTests);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors before submitting.");
        return;
      }

      // ---- 1. Create or update the booking ----
      const bookingPayload = {
        patient_id: Number(state.form.patient_id),
        booking_date: state.form.booking_date,
        notes: state.form.notes || "",
        status: isEditMode ? initialData.status : "pending",
      };

      let bookingId;
      try {
        if (isEditMode) {
          bookingId = initialData.id || initialData._id;
          await dispatch(
            updateLabTestBooking({ id: bookingId, ...bookingPayload }),
          ).unwrap();
        } else {
          const res = await dispatch(
            createLabTestBooking(bookingPayload),
          ).unwrap();
          const created = res?.data || res;
          bookingId = created?.id || created?._id;
        }
      } catch (err) {
        toast.error(err?.message || "Failed to save booking.");
        return;
      }

      if (!bookingId) {
        toast.error("Booking ID missing from server response.");
        return;
      }

      // ---- 2. Sync junction rows (lab-booking-tests) ----

      const selectedIds = new Set(state.selectedTests.map((t) => Number(t.id)));

      // (edit mode) delete rows that were removed
      if (isEditMode) {
        const toDelete = Object.entries(state.existingLinks).filter(
          ([testId]) => !selectedIds.has(Number(testId)),
        );
        for (const [, linkId] of toDelete) {
          try {
            await dispatch(deleteLabBookingTest(linkId)).unwrap();
          } catch {
            // non-fatal
          }
        }
      }

      // add rows that are new
      for (const test of state.selectedTests) {
        const testIdNum = Number(test.id);
        const alreadyLinked =
          isEditMode && state.existingLinks[testIdNum] != null;
        if (alreadyLinked) continue;

        try {
          await dispatch(
            createLabBookingTest({
              lab_booking_id: Number(bookingId),
              lab_test_id: testIdNum,
            }),
          ).unwrap();
        } catch (err) {
          toast.error(
            err?.message ||
              `Failed to link test "${test.test_name}" to booking.`,
          );
        }
      }

      // ---- 3. Refresh everything ----
      await Promise.all([
        dispatch(fetchAllLabTestBookings()),
        dispatch(fetchAllLabBookingTests()),
      ]);

      toast.success(
        isEditMode
          ? "Lab test booking updated successfully!"
          : "Lab test booking created successfully!",
      );
      close();
    },
    [
      state.form,
      state.selectedTests,
      state.existingLinks,
      isEditMode,
      initialData,
      dispatch,
      close,
    ],
  );

  /* ------------------------------ Filter fns ----------------------------- */

  const filterPatient = useCallback((p, term) => {
    if (!term) return true;
    const l = term.toLowerCase();
    return (
      p.name?.toLowerCase().includes(l) ||
      p.cnic?.includes(term) ||
      p.phone?.includes(term)
    );
  }, []);

  const filterTest = useCallback((t, term) => {
    if (!term) return true;
    const l = term.toLowerCase();
    return (
      t.test_name?.toLowerCase().includes(l) ||
      t.category?.toLowerCase().includes(l)
    );
  }, []);

  // Hide already-selected tests from dropdown
  const availableLabTests = useMemo(() => {
    const selectedIds = new Set(state.selectedTests.map((t) => String(t.id)));
    return labTests.filter((t) => !selectedIds.has(String(t.id)));
  }, [labTests, state.selectedTests]);

  const testItemRenderer = useCallback(
    (t) => (
      <>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            {(t.test_name || "T").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {t.test_name || t.name}
            </p>
            <p className="text-[10px] text-slate-500">
              {t.category || "General"} • Rs. {t.price ?? t.test_price ?? 0}
            </p>
          </div>
        </div>
        <span className="text-[11px] text-teal-600 font-semibold">+ Add</span>
      </>
    ),
    [],
  );

  /* -------------------------------- Render ------------------------------- */

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      title={
        <>
          {isEditMode ? "Update Lab Booking" : "New Lab Booking"}
          <Sparkles size={16} className="text-[#00A3AD] inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? "Update details and tests for this booking"
          : "Assign patient and one or more lab tests"
      }
      icon={isEditMode ? <Edit size={22} /> : <Calendar size={22} />}
      iconClass="from-[#00A3AD] to-cyan-500"
      accentShadow="shadow-cyan-900/20"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Patient — full width now */}
          <div className="sm:col-span-2">
            <SearchableSelect
              label="Patient"
              icon={User}
              placeholder="Search patient by name, CNIC, or phone..."
              searchTerm={state.patientSearchTerm}
              onSearchChange={handlePatientSearch}
              items={patients}
              filterFn={filterPatient}
              isOpen={state.patientDropdownOpen}
              onOpenChange={(open) =>
                dispatchAction({
                  type: "SET_SEARCH",
                  field: "patientDropdownOpen",
                  value: open,
                })
              }
              onSelect={(p) =>
                dispatchAction({ type: "SELECT_PATIENT", patient: p })
              }
              error={state.errors.patient_id}
              emptyMessage="No patients found."
            />
          </div>

          {/* Booking Date — full width now (no doctor next to it) */}
          <div className="sm:col-span-2">
            <FormField
              label="Booking Date"
              icon={Calendar}
              name="booking_date"
              type="date"
              value={state.form.booking_date}
              onChange={handleChange}
              error={state.errors.booking_date}
              required
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <FormField
              label="Notes"
              icon={FileText}
              name="notes"
              multiline
              rows={2}
              value={state.form.notes}
              onChange={handleChange}
              placeholder="Patient instructions or details..."
            />
          </div>
        </div>

        {/* ---------- Lab Tests Section ---------- */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FlaskConical size={16} className="text-[#00A3AD]" />
              Lab Tests
              <span className="ml-1 text-xs font-semibold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                {state.selectedTests.length}
              </span>
            </h3>
          </div>

          <SearchableSelect
            label="Add Lab Test"
            icon={FlaskConical}
            placeholder="Search and select a lab test..."
            searchTerm={state.testSearchTerm}
            onSearchChange={handleTestSearch}
            items={availableLabTests}
            filterFn={filterTest}
            isOpen={state.testDropdownOpen}
            onOpenChange={(open) =>
              dispatchAction({
                type: "SET_SEARCH",
                field: "testDropdownOpen",
                value: open,
              })
            }
            onSelect={handleAddTest}
            avatarClass="bg-amber-50 text-amber-600"
            emptyMessage="No lab tests available."
            itemRenderer={testItemRenderer}
          />

          {state.selectedTests.length > 0 && (
            <div className="mt-3 space-y-2">
              {state.selectedTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      {(test.test_name || "T").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {test.test_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {test.category || "General"} • Rs. {test.price || 0}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTest(test.id)}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                    title="Remove test"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {state.errors.lab_tests && (
            <p className="mt-2 text-xs text-rose-500">
              {state.errors.lab_tests}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-[#00A3AD] hover:bg-[#008C94] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all duration-200 active:scale-95"
          >
            {isEditMode ? "Update Booking" : "Create Booking"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default LabBookingModal;
