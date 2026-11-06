
import { useCallback, useState } from "react";
import { Pencil, Trash2, GraduationCap } from "lucide-react";

import useEnrollmentList from "./Components/useEnrollmentList";
import useEnrollmentFilters from "./Components/useEnrollmentFilters";
import useEnrollmentActions from "./Components/useEnrollmentActions";

export default function useStudentEnrollments() {
  const filters = useEnrollmentFilters();

  const {
    enrollments,
    classes,
    loading,
    stats,
    pagination,
    fetchEnrollments,
  } = useEnrollmentList(filters.queryParams);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewEnrollment, setViewEnrollment] = useState(null);

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionEnrollment, setPromotionEnrollment] = useState(null);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedEnrollment(null);
  }, []);

  const closePromotionModal = useCallback(() => {
    setIsPromotionModalOpen(false);
    setPromotionEnrollment(null);
  }, []);

  const actions = useEnrollmentActions({
    selectedEnrollment,
    closeModal,
    closePromotionModal,
    fetchEnrollments,
    setCurrentPage: filters.setCurrentPage,
    currentPage: filters.currentPage,
    itemsPerPage: filters.itemsPerPage,
    enrollments,
  });

  const openCreateModal = () => {
    setSelectedEnrollment(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedEnrollment(item);
    setIsModalOpen(true);
  };

  const openViewModal = (item) => {
    setViewEnrollment(item);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewEnrollment(null);
    setIsViewModalOpen(false);
  };

  const openPromotionModal = (item) => {
    setPromotionEnrollment(item);
    setIsPromotionModalOpen(true);
  };

  const getRowActions = (row) => [
    {
      label: "Edit Enrollment",
      icon: <Pencil size={14} />,
      onClick: (selectedRow) => openEditModal(selectedRow || row),
    },
    {
      label: "Promote Student",
      icon: <GraduationCap size={14} />,
      onClick: (selectedRow) => openPromotionModal(selectedRow || row),
    },
    {
      label: "Delete Enrollment",
      icon: <Trash2 size={14} />,
      variant: "danger",
      onClick: (selectedRow) =>
        actions.handleDelete(selectedRow || row),
    },
  ];

  return {
    ...filters,
    ...actions,

    enrollments,
    classes,
    loading,
    stats,
    pagination,
    fetchEnrollments,

    activeCount: stats.active,
    totalCount: stats.total,
    classTabCounts: stats.classTabCounts ?? {},

    isModalOpen,
    selectedEnrollment,
    isViewModalOpen,
    viewEnrollment,
    isPromotionModalOpen,
    promotionEnrollment,

    openCreateModal,
    openEditModal,
    closeModal,
    openViewModal,
    closeViewModal,
    openPromotionModal,
    closePromotionModal,
    getRowActions,
  };
}
