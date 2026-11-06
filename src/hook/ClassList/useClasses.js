
import { useState } from "react";
import { toast } from "react-hot-toast";

import {
  createClass as createClassApi,
  updateClass as updateClassApi,
  deleteClass as deleteClassApi,
} from "../../redux/api_data/classApi/classApi";

import useClassList from "../ClassList/useClassList";
import errorMessage from "../../utils/errorMessage/errorMessage";

const useClasses = () => {
  const {    classes,    pagination,    loading,    fetchClasses,  } = useClassList();

  const [saving, setSaving] = useState(false);

  const createClass = async (payload) => {
    setSaving(true);

    try {
      await createClassApi(payload);
      toast.success("Class created successfully.");

      await fetchClasses(
        pagination.current_page,
        pagination.per_page
      );

      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateClass = async (id, payload) => {
    setSaving(true);

    try {
      await updateClassApi(id, payload);
      toast.success("Class updated successfully.");

      await fetchClasses(
        pagination.current_page,
        pagination.per_page
      );

      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (id) => {
    try {
      await deleteClassApi(id);
      toast.success("Class deleted successfully.");

      const nextPage =
        classes.length === 1 && pagination.current_page > 1
          ? pagination.current_page - 1
          : pagination.current_page;

      await fetchClasses(nextPage, pagination.per_page);

      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    }
  };

  return {
    classes,
    pagination,
    loading,
    saving,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
  };
};

export default useClasses;
