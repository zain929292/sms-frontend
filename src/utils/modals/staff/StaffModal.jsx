
import { useEffect, useState } from "react";
import {
  UserRound,
  ImagePlus,
  X,
  Upload,
} from "lucide-react";

import ModalShell from "../../../shared/ModalShell.shared";
import FormField from "../../../shared/FormField.shared";
import SearchableSelect from "../../../shared/SearchableSelect.shared";
import { useModalAnimation } from "../../../shared/useModalAnimation.hook";

const EMPTY_FORM = {
  user_id: "",
  phone: "",
  gender: "",
  dob: "",
  cnic: "",
  address: "",
  qualification: "",
  specialization: "",
  experience: "0",
  joining_date: "",
  employment_type: "permanent",
  emergency_contact: "",
  remarks: "",
};

const EMPLOYMENT_OPTIONS = [
  { value: "permanent", label: "Permanent" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part Time" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const StaffModal = ({
  open,
  staff,
  users = [],
  saving = false,
  onClose,
  onSave,
}) => {
  const { shouldRender, isAnimating } =
    useModalAnimation(open, 300);

  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [userSearch, setUserSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);

  const [errors, setErrors] = useState({});

  const isEdit = Boolean(staff?.id);

  // Load form data
  useEffect(() => {
    if (!open) return;

    const source = staff || {};

    const nextForm = {
      ...EMPTY_FORM,
      user_id: String(source.user_id ?? source.id ?? ""),
      phone: source.phone ?? "",
      gender: source.gender ?? "",
      dob: source.dob?.substring(0, 10) ?? "",
      cnic: source.cnic ?? "",
      address: source.address ?? "",
      qualification: source.qualification ?? "",
      specialization: source.specialization ?? "",
      experience: String(source.experience ?? "0"),
      joining_date: source.joining_date?.substring(0, 10) ?? "",
      employment_type: source.employment_type ?? "permanent",
      emergency_contact: source.emergency_contact ?? "",
      remarks: source.remarks ?? "",
    };

    setForm(nextForm);
    setPhotoPreview(source.photo ?? "");
    setPhoto(null);
    setRemovePhoto(false);
    setErrors({});
    setOpenDropdown(null);

    const selectedUser = users.find(
      (item) => String(item.id) === nextForm.user_id
    );

    setUserSearch(selectedUser?.name ?? "");
  }, [open, staff, users]);

  // Selected User
  const selectedUser = users.find(
    (item) => String(item.id) === String(form.user_id)
  );

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle user selection
  const selectItem = (field, item, setSearch, label) => {
    setForm((prev) => ({
      ...prev,
      [field]: String(item.id),
    }));

    setSearch(label(item));
    setOpenDropdown(null);
  };

  // User filter
  const userFilter = (item, search) =>
    `${item.name ?? ""} ${item.email ?? ""} ${item.id ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        photo: "Please select a valid image.",
      }));

      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: "Image size must be less than 2MB.",
      }));

      e.target.value = "";
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);

    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview("");
    setRemovePhoto(true);

    setErrors((prev) => ({
      ...prev,
      photo: "",
    }));
  };

  // Validate form
  const validateForm = () => {
    const nextErrors = {};

    if (!form.user_id) {
      nextErrors.user_id = "Please select a user.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!form.joining_date) {
      nextErrors.joining_date = "Joining date is required.";
    }

    if (
      form.experience !== "" &&
      (!Number.isFinite(Number(form.experience)) ||
        Number(form.experience) < 0)
    ) {
      nextErrors.experience = "Enter a valid experience.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // Close modal
  const handleClose = () => {
    if (saving) return;

    setOpenDropdown(null);
    onClose();
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value ?? "");
    });

    if (photo instanceof File) {
      payload.append("photo", photo);
    }

    if (removePhoto) {
      payload.append("remove_photo", "1");
    }

    onSave(payload);
  };

  if (!shouldRender) return null;

  return (
    <ModalShell
      isOpen={open}
      onClose={handleClose}
      title={isEdit ? "Update Staff" : "Add Staff"}
      subtitle="Manage staff information."
      icon={<UserRound size={22} />}
      maxWidth="max-w-3xl"
      disabled={saving}
    >
      <div
        className={`origin-center transform transition-all duration-300 ease-out ${
          isAnimating
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6">

          {/* Staff Photo */}
          <div className="mb-5 flex flex-col items-center">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Staff preview"
                  className="h-24 w-24 rounded-full border-2 border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50">
                  <ImagePlus
                    size={30}
                    className="text-slate-400"
                  />
                </div>
              )}

              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={saving}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              <Upload size={16} />
              Upload Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={saving}
                className="hidden"
              />
            </label>

            <p className="mt-1 text-xs text-slate-400">
              JPG, PNG or WEBP (Max 2MB)
            </p>

            {errors.photo && (
              <p className="mt-1 text-xs text-red-500">
                {errors.photo}
              </p>
            )}
          </div>

          {/* Staff Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* User */}
            <div>
              {isEdit ? (
                <>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Selected User
                  </label>

                  <div className="flex h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                    {selectedUser
                      ? `${selectedUser.name} - ID: ${selectedUser.id}`
                      : staff?.user_name || staff?.name || `User ID: ${form.user_id}`}
                  </div>
                </>
              ) : (
                <SearchableSelect
                  label="Select User"
                  icon={UserRound}
                  placeholder="Search user..."
                  searchTerm={userSearch}
                  onSearchChange={setUserSearch}
                  items={users}
                  isOpen={openDropdown === "user"}
                  onOpenChange={(open) =>
                    setOpenDropdown(open ? "user" : null)
                  }
                  filterFn={userFilter}
                  onSelect={(item) =>
                    selectItem(
                      "user_id",
                      item,
                      setUserSearch,
                      (value) => value.name
                    )
                  }
                  itemRenderer={(item) => (
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.email || `User ID: ${item.id}`}
                      </p>
                    </div>
                  )}
                  emptyMessage="No users found."
                />
              )}

              {errors.user_id && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.user_id}
                </p>
              )}

              {users.length === 0 && !isEdit && (
                <p className="mt-1 text-xs text-amber-600">
                  No users available.
                </p>
              )}
            </div>

            {/* Selected User Information */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                User Information
              </label>

              <div className="flex h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                {selectedUser
                  ? `${selectedUser.name} - ID: ${selectedUser.id}`
                  : form.user_id
                    ? `User ID: ${form.user_id}`
                    : "No user selected"}
              </div>
            </div>

            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              placeholder="Enter phone number"
            />

            <FormField
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={GENDER_OPTIONS}
              placeholder="Select gender"
            />

            <FormField
              label="Date of Birth"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />

            <FormField
              label="CNIC"
              name="cnic"
              value={form.cnic}
              onChange={handleChange}
              placeholder="XXXXX-XXXXXXX-X"
            />

            <FormField
              label="Qualification"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="e.g. BS Computer Science"
            />

            <FormField
              label="Specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="Enter specialization"
            />

            <FormField
              label="Experience (Years)"
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
              error={errors.experience}
              min="0"
              step="0.5"
              placeholder="e.g. 2.5"
            />

            <FormField
              label="Joining Date"
              name="joining_date"
              type="date"
              value={form.joining_date}
              onChange={handleChange}
              error={errors.joining_date}
              required
            />

            <FormField
              label="Employment Type"
              name="employment_type"
              value={form.employment_type}
              onChange={handleChange}
              options={EMPLOYMENT_OPTIONS}
              required
            />

            <FormField
              label="Emergency Contact"
              name="emergency_contact"
              type="tel"
              value={form.emergency_contact}
              onChange={handleChange}
              placeholder="Enter emergency contact"
            />

            <FormField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter complete address"
            />
          </div>

          {/* Remarks */}
          <div className="mt-4">
            <label
              htmlFor="remarks"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Remarks
            </label>

            <textarea
              id="remarks"
              name="remarks"
              rows={3}
              value={form.remarks}
              onChange={handleChange}
              placeholder="Additional information..."
              disabled={saving}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                (!isEdit && users.length === 0) ||
                (!isEdit && !form.user_id)
              }
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEdit
                  ? "Update Staff"
                  : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
};

export default StaffModal;
