
const errorMessage = (error) => {
  const data = error?.response?.data;
  const firstValidationError = Object.values(
    data?.errors || {}
  ).flat()[0];

  return (
    firstValidationError ||
    data?.message ||
    data?.error ||
    "Something went wrong."
  );
};

export default errorMessage;
