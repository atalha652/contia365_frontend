export const setLocalStorageItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
export const getLocalStorageItem = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};
// Helper functions for sessionStorage
export const setSessionStorageItem = (key, data) => {
  sessionStorage.setItem(key, JSON.stringify(data));
};
export const getSessionStorageItem = (key) => {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Returns available tax periods based on the "10th of the month" rule.
 * - Always includes the current month.
 * - Includes the previous month ONLY if today is <= 10.
 * @returns {Array<{ label: string, value: string }>}
 */
export const getAvailablePeriods = () => {
  const now = new Date();
  const day = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const fmt = (y, m) => {
    const mm = String(m + 1).padStart(2, "0");
    const label = new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return { label, value: `${y}-${mm}` };
  };

  const periods = [fmt(year, month)];

  if (day <= 10) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    periods.unshift(fmt(prevYear, prevMonth));
  }

  return periods;
};
