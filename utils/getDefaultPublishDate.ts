const getDefaultPublishDate = (globalStatus: string, publishDate?: string) => {
  if (publishDate) return publishDate;

  const now = new Date();

  if (globalStatus === "publish" || globalStatus === 'draft') {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  }

  if (globalStatus === "future") {
    now.setDate(now.getDate() + 1);
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  }

  return "";
};

export default getDefaultPublishDate