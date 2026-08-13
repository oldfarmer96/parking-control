export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export const formatDuration = (start: string, end?: string | null) => {
  const elapsed = Math.max(
    0,
    new Date(end ?? Date.now()).getTime() - new Date(start).getTime(),
  );
  const totalMinutes = Math.floor(elapsed / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
};

export const toLocalDateTimeInput = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};
