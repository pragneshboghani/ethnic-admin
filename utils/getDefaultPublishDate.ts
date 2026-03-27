const getDefaultPublishDate = (globalStatus: string) => {
  const now = new Date();

  if (globalStatus === "future") {
    now.setUTCDate(now.getUTCDate() + 1);
  }

  return now.toISOString().slice(0, 16);
};

export default getDefaultPublishDate;
