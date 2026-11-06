
import { useCallback, useEffect, useState } from "react";
import { getClasses } from "../../redux/api_data/classApi/classApi";
import toast from "react-hot-toast";
import errorMessage from "../../utils/errorMessage/errorMessage";

const INITIAL_PAGINATION = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

const useClassList = () => {
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);

    try {
      const response = await getClasses(page, limit);
      const responseData = response?.data;
      const result = responseData?.data;

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setClasses(list);

      setPagination(
        responseData?.pagination || {
          current_page: page,
          per_page: limit,
          last_page: 1,
          total: list.length,
        }
      );
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses(
      pagination.current_page,
      pagination.per_page
    );
  }, [
    fetchClasses,
    pagination.current_page,
    pagination.per_page,
  ]);

  return {
    classes,
    pagination,
    loading,
    fetchClasses,
  };
};

export default useClassList;
