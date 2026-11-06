
import { useState } from "react";
import { toast } from "react-hot-toast";

import {
  createStudentEnrollment,
  updateStudentEnrollment,
  deleteStudentEnrollment,
  promoteStudentEnrollment,
} from "../../../redux/api_data/studentEnrollmentApi/studentEnrollmentApi";

import errorMessage from "../../../utils/errorMessage/errorMessage";

export default function useEnrollmentActions({
  selectedEnrollment,
  closeModal,
  closePromotionModal,
  fetchEnrollments,
  setCurrentPage,
  currentPage,
  itemsPerPage,
  enrollments,
}) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [promoting, setPromoting] = useState(false);

  const handleSaveEnrollment = async (formData) => {
    setSaving(true);

    try {
      const payload = {
        student_id: Number(formData.student_id),
        class_id: Number(formData.class_id),
        academic_session_id: Number(formData.academic_session_id),
        enrollment_date: formData.enrollment_date || null,
        status: formData.status,
        remarks: String(formData.remarks ?? "").trim() || null,
      };

      if (selectedEnrollment?.id) {
        await updateStudentEnrollment(selectedEnrollment.id, payload);
        toast.success("Enrollment updated successfully.");
      } else {
        await createStudentEnrollment(payload);
        toast.success("Student enrolled successfully.");
      }

      closeModal();
      setCurrentPage(1);
      await fetchEnrollments(false);

      return true;
    } catch (error) {
      const errors = error?.response?.data?.errors;

      if (errors) {
        Object.values(errors).flat().filter(Boolean).forEach((message) => {
          toast.error(message);
        });
      } else {
        toast.error(errorMessage(error, "Failed to save enrollment."));
      }

      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteStudent = async (formData) => {
    setPromoting(true);

    try {
      await promoteStudentEnrollment(formData);
      toast.success("Student promoted successfully.");

      closePromotionModal();
      await fetchEnrollments(false);

      return true;
    } catch (error) {
      const errors = error?.response?.data?.errors;

      if (errors) {
        Object.values(errors).flat().filter(Boolean).forEach((message) => {
          toast.error(message);
        });
      } else {
        toast.error(errorMessage(error, "Failed to promote student."));
      }

      return false;
    } finally {
      setPromoting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!item?.id) {
      toast.error("Enrollment ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the enrollment for ${
        item.student_name || "this student"
      }?`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteStudentEnrollment(item.id);
      toast.success("Enrollment deleted successfully.");

      const nextPage =
        enrollments.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      setCurrentPage(nextPage);
      await fetchEnrollments(false);

      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Failed to delete enrollment."));
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    saving,
    deleting,
    promoting,
    handleSaveEnrollment,
    handlePromoteStudent,
    handleDelete,
  };
}
