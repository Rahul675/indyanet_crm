export const saveToStorage = (key, data) =>
  localStorage.setItem(key, JSON.stringify(data));

export const getFromStorage = (key, fallback = []) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

export const formatDate = (date) => new Date(date).toISOString().split("T")[0];
