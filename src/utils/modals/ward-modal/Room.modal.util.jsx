/**
 * @file Room.modal.util.jsx
 * @module RoomModal
 * @description Room creation / update modal.
 */

import { useReducer, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Plus,
  Save,
  DoorOpen,
  Home,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import { createRoom, updateRoom } from "../../../redux/slices/Room.slice.redux";
import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";

/* -------------------------------------------------------------------------- */
/*                                Constants                                   */
/* -------------------------------------------------------------------------- */

const ROOM_TYPES = [
  { value: "private", label: "Private" },
  { value: "shared", label: "Shared" },
  { value: "icu", label: "ICU" },
];

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "full", label: "Full" },
  { value: "maintenance", label: "Under Maintenance" },
];

const DEFAULT_FORM = {
  id: "",
  room_number: "",
  room_type: "",
  status: "available",
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
  if (!form.room_number.trim()) errors.room_number = "Room number is required";
  if (!form.room_type) errors.room_type = "Room type is required";
  return errors;
};

/* -------------------------------------------------------------------------- */
/*                              Component                                     */
/* -------------------------------------------------------------------------- */

const RoomModal = ({
  isOpen,
  onClose,
  ward = null,
  roomData = null,
  onAdd,
  onUpdate,
}) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(roomData);

  const { creating, updating } = useSelector((s) => s.room ?? {});
  const isLoading = isEditMode ? updating : creating;

  const [state, dispatchAction] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!isOpen) return;
    if (roomData) {
      dispatchAction({
        type: "RESET",
        form: {
          id: roomData.id || roomData._id || "",
          room_number: roomData.room_number || "",
          room_type: (roomData.room_type || "").toLowerCase(),
          status: (roomData.status || "available").toLowerCase(),
        },
      });
    } else {
      dispatchAction({
        type: "RESET",
        form: {
          ...DEFAULT_FORM,
          room_type: (ward?.type || "").toLowerCase(),
        },
      });
    }
  }, [isOpen, roomData, ward]);

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

      const wardId = ward?._id || ward?.id;

      try {
        if (isEditMode) {
          const payload = { ...state.form, ward_id: wardId };
          await dispatch(
            updateRoom({ id: state.form.id, data: payload }),
          ).unwrap();
          toast.success("Room updated successfully!");
          onUpdate?.(payload);
        } else {
          const { id, ...rest } = state.form;
          const payload = { ...rest, ward_id: wardId };
          const res = await dispatch(createRoom(payload)).unwrap();
          toast.success("Room created successfully!");
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
    [state.form, isEditMode, dispatch, close, ward, onAdd, onUpdate],
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={close}
      disabled={isLoading}
      title={
        <>
          {isEditMode ? "Update Room" : "Add New Room"}
          <Sparkles size={16} className="text-teal-500 inline ml-1" />
        </>
      }
      subtitle={
        isEditMode
          ? `${ward?.name || "Ward"} — Room ${state.form.room_number}`
          : `Assign a new room configuration to ${ward?.name || "Ward"}`
      }
      icon={isEditMode ? <Save size={22} /> : <DoorOpen size={22} />}
      iconClass="from-[#034A52] to-teal-500"
      accentShadow="shadow-teal-900/20"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {ward && (
          <div className="rounded-2xl bg-teal-50/50 border border-teal-100/80 p-4">
            <div className="flex items-center gap-2.5 text-xs text-teal-900">
              <Home size={16} className="text-[#034A52]" />
              <span className="font-semibold">{ward.name}</span>
              {ward.floor && (
                <>
                  <span className="text-teal-300">•</span>
                  <span className="text-teal-700">{ward.floor}</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField
              label="Room Number"
              icon={DoorOpen}
              name="room_number"
              value={state.form.room_number}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g., 101, A-202"
              error={state.errors.room_number}
              required
            />
          </div>

          <FormField
            label="Room Type"
            icon={Layers}
            name="room_type"
            value={state.form.room_type}
            onChange={handleChange}
            disabled={isLoading}
            error={state.errors.room_type}
            required
            options={ROOM_TYPES}
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
                <Save size={16} /> Update Room
              </>
            ) : (
              <>
                <Plus size={16} /> Add Room
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default RoomModal;
