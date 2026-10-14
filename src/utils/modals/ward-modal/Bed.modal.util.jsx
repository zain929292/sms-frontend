/**
 * @file Bed.modal.util.jsx
 * @module BedModal
 * @description Bed creation / update modal.
 */

import { useReducer, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Plus,
  Save,
  Bed,
  FileText,
  Sparkles,
  Layers,
  Activity,
  Home,
  DoorOpen,
} from "lucide-react";
import { createBed, updateBed } from "../../../redux/slices/Bed.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const BED_TYPES = [
  { value: "general", label: "General" },
  { value: "private", label: "VIP" },
  { value: "icu", label: "ICU" },
];

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "maintenance", label: "Under Maintenance" },
];

const DEFAULT_FORM = {
  id: "",
  bed_number: "",
  bed_type: "",
  status: "available",
  notes: "",
};

/* -------------------------------------------------------------------------- */
/*                                  Reducer                                   */
/* -------------------------------------------------------------------------- */

const initialState = { form: DEFAULT_FORM, errors: {} };

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return { form: action.form ?? DEFAULT_FORM, errors: {} };
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors[action.field]
          ? { ...state.errors, [action.field]: "" }
          : state.errors,
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    default:
      return state;
  }
};

const validate = (form) => {
  const errors = {};
  if (!form.bed_number.trim()) errors.bed_number = "Bed number is required";
  if (!form.bed_type) errors.bed_type = "Bed type is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const BedModal = ({
  isOpen,
  onClose,
  ward = null,
  room = null,
  bedData = null,
  onAdd,
  onUpdate,
}) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(bedData);

  const { creating, updating } = useSelector((s) => s.bed ?? {});
  const isLoading = isEditMode ? updating : creating;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!isOpen) return;
    if (bedData) {
      dispatchAction({
        type: "RESET",
        form: {
          id: bedData.id || bedData._id || "",
          bed_number: bedData.bed_number || "",
          bed_type: (bedData.bed_type || room?.room_type || "").toLowerCase(),
          status: (bedData.status || "available").toLowerCase(),
          notes: bedData.notes || "",
        },
      });
    } else {
      dispatchAction({
        type: "RESET",
        form: {
          ...DEFAULT_FORM,
          bed_type: room?.room_type ? room.room_type.toLowerCase() : "",
        },
      });
    }
  }, [isOpen, bedData, room]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    dispatchAction({ type: "SET_FIELD", field: name, value });
  }, []);

  const close = useCallback(() => {
    dispatchAction({ type: "RESET" });
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errors = validate(state.form);
      dispatchAction({ type: "SET_ERRORS", errors });
      if (Object.keys(errors).length) {
        toast.error("Please fix the errors in the form before submitting.");
        return;
      }

      try {
        if (isEditMode) {
          await dispatch(
            updateBed({ id: state.form.id, data: state.form }),
          ).unwrap();
          toast.success("Bed updated successfully!");
          onUpdate?.(room, state.form);
        } else {
          const { id, ...rest } = state.form;
          const payload = {
            ward_id: ward?._id || ward?.id,
            room_id: room?._id || room?.id,
            ...rest,
          };
          const res = await dispatch(createBed(payload)).unwrap();
          toast.success("Bed created successfully!");
          onAdd?.(res);
        }
        close();
      } catch (err) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || "An unexpected error occurred.";
        toast.error(msg);
      }
    },
    [state.form, isEditMode, dispatch, close, ward, room, onAdd, onUpdate],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Update Bed" : "Add New Bed"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? `Bed ${state.form.bed_number} in Room ${room?.room_number || ""}`
          : `Add bed record to Room ${room?.room_number || ""}`
      }
      icon={<Bed size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {(ward || room) && (
          <div className="rounded-2xl bg-teal-50/50 border border-teal-100/80 p-4 space-y-1.5">
            {ward && (
              <div className="flex items-center gap-2 text-xs text-teal-900">
                <Home size={15} className="text-[#034A52]" />
                <span className="font-semibold">Ward:</span>
                <span>{ward.name}</span>
                {ward.floor && (
                  <>
                    <span className="text-teal-300">•</span>
                    <span className="text-teal-700">{ward.floor}</span>
                  </>
                )}
              </div>
            )}
            {room && (
              <div className="flex items-center gap-2 text-xs text-teal-900">
                <DoorOpen size={15} className="text-[#034A52]" />
                <span className="font-semibold">Room:</span>
                <span>{room.room_number}</span>
                {room.room_type && (
                  <>
                    <span className="text-teal-300">•</span>
                    <span className="text-teal-700 uppercase">
                      {room.room_type}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              label="Bed Number / Code"
              icon={Bed}
              name="bed_number"
              value={state.form.bed_number}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g., A, 1, Bed-01"
              error={state.errors.bed_number}
              required
            />
          </div>

          <FormField
            label="Bed Type"
            icon={Layers}
            name="bed_type"
            value={state.form.bed_type}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.bed_type}
            required
            options={BED_TYPES}
          />

          <FormField
            label="Status"
            icon={Activity}
            name="status"
            value={state.form.status}
            onChange={handleChange}
            disabled={isLoading}
            options={STATUS_OPTIONS}
          />

          <div className="sm:col-span-2">
            <FormField
              label="Notes"
              icon={FileText}
              name="notes"
              multiline
              rows={2}
              value={state.form.notes}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter optional bed notes..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-[#034A52] to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition-all duration-200 hover:shadow-teal-900/30 hover:opacity-95 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditMode ? "Updating..." : "Adding..."}
              </>
            ) : isEditMode ? (
              <>
                <Save size={16} /> Update Bed
              </>
            ) : (
              <>
                <Plus size={16} /> Add Bed
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default BedModal;
