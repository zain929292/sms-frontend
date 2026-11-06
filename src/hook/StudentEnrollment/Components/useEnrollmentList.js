
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { getStudentEnrollments } from "../../../redux/api_data/studentEnrollmentApi/studentEnrollmentApi";

import { getClasses } from "../../../redux/api_data/classApi/classApi";
import errorMessage from "../../../utils/errorMessage/errorMessage";

const getList = (response) => {
  const payload = response?.data;

  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.enrollments)) {
    return payload.enrollments;
  }

  if (Array.isArray(payload?.classes)) {
    return payload.classes;
  }

  return [];
};

export default function useEnrollmentList(queryParams) {
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    promoted: 0,
    other: 0,
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    last_page: 1,
    total: 0,
  });

  // Primitive dependency prevents refetching on every render.
  const queryString = JSON.stringify(queryParams);

  const fetchEnrollments = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);

      try {
        const params = JSON.parse(queryString);
        const response = await getStudentEnrollments(params);
        const payload = response?.data;

        setEnrollments(getList(response));

      setStats({
        total: Number(payload?.stats?.total ?? 0),
        active: Number(payload?.stats?.active ?? 0),
        promoted: Number(payload?.stats?.promoted ?? 0),
        other: Number(payload?.stats?.other ?? 0),
        classTabCounts: payload?.stats?.classTabCounts ?? {},
      });

        setPagination({
          current_page: Number(
            payload?.pagination?.current_page ?? params.page ?? 1
          ),
          per_page: Number(
            payload?.pagination?.per_page ?? params.limit ?? 10
          ),
          last_page: Number(payload?.pagination?.last_page ?? 1),
          total: Number(payload?.pagination?.total ?? 0),
        });
      } catch (error) {
        toast.error(
          errorMessage(error, "Failed to fetch enrollments.")
        );
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [queryString]
  );

  const fetchClasses = useCallback(async () => {
    try {
      const response = await getClasses();
      setClasses(getList(response));
    } catch (error) {
      toast.error(errorMessage(error, "Failed to fetch classes."));
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    enrollments,
    classes,
    loading,
    stats,
    pagination,
    fetchEnrollments,
  };
}
