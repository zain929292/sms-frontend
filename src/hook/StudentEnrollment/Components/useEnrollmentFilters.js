
import { useState } from "react";

export default function useEnrollmentFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassTab, setSelectedClassTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    ...(searchTerm.trim()
      ? { student_name: searchTerm.trim() }
      : {}),
    ...(selectedClassTab !== "all"
      ? {
          class_id: selectedClassTab,
          status: "active",
        }
      : {}),
  };

  const handleClassTabChange = (classId) => {
    setSelectedClassTab(String(classId));
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedClassTab("all");
    setCurrentPage(1);
  };

  const handleLimitChange = (limit) => {
    setItemsPerPage(Number(limit));
    setCurrentPage(1);
  };

  return {
    searchTerm,
    selectedClassTab,
    currentPage,
    itemsPerPage,
    queryParams,

    handleClassTabChange,
    handleSearchChange,
    handleClearSearch,
    handleClearFilters,
    handleLimitChange,

    setCurrentPage,
    setItemsPerPage,
  };
}
