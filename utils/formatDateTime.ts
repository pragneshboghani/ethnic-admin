export const formatDateTime = (date: string | Date) => {
  if (!date) return "";

  const d = new Date(date);

  const formattedDate = d
    .toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");

  const formattedTime = d.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
};
