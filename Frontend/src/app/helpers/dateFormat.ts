function formatDate(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toISOString().slice(0, 10);
}