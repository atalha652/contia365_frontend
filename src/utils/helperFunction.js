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
