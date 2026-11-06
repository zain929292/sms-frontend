
import { useCallback, useEffect, useState } from "react";
import { getUsers } from "../../../redux/api_data/userApi/userApi";

export default function useUsersList(options = {}) {
  const { limit = 10 } = options;

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(limit);

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: limit,
    last_page: 1,
    total: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });

      const result = response.data;

      setUsers(result.data || []);
      setStats(result.stats || {});

      setPagination({
        current_page: result.pagination?.current_page || 1,
        per_page: result.pagination?.per_page || itemsPerPage,
        last_page: result.pagination?.last_page || 1,
        total: result.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (value) => {
    const search =
      typeof value === "string"
        ? value
        : value?.target?.value || "";

    setSearchTerm(search);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit) => {
    setItemsPerPage(Number(limit));
    setCurrentPage(1);
  };

  return {
    users,
    stats,
    loading,
    pagination,
    searchTerm,
    currentPage,
    itemsPerPage,
    fetchUsers,
    handleSearchChange,
    handleClearFilters,
    handlePageChange,
    handleLimitChange,
  };
}
