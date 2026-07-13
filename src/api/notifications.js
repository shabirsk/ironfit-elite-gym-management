import api from './axios';

export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications', { params });
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread-count');
  return data;
};

export const markNotificationRead = async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.put('/notifications/read-all');
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

export const getAllNotificationsAdmin = async (params = {}) => {
  const { data } = await api.get('/notifications/admin/all', { params });
  return data;
};

export const getAdminNotificationStats = async () => {
  const { data } = await api.get('/notifications/admin/stats');
  return data;
};

export const bulkActionNotifications = async (ids, action) => {
  const { data } = await api.post('/notifications/admin/bulk', { ids, action });
  return data;
};

export const createNotification = async (notificationData) => {
  const { data } = await api.post('/notifications', notificationData);
  return data;
};
