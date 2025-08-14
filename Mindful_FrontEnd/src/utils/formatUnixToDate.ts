const formatUnixToDate = (unixTimestamp) => {
  if (!unixTimestamp) return null;

  const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default formatUnixToDate;
