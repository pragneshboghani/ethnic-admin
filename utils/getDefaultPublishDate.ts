const getDefaultPublishDate = (globalStatus: string) => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (globalStatus === "future") {
    now.setDate(now.getDate() + 1);
  }

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export default getDefaultPublishDate;
