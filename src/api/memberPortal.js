import api from './axios';

export const getMemberDashboard = async () => {
  const { data } = await api.get('/member/dashboard');
  return data;
};

export const getMyAttendance = async (params = {}) => {
  const { data } = await api.get('/member/attendance', { params });
  return data;
};

export const getMyPayments = async (params = {}) => {
  const { data } = await api.get('/member/payments', { params });
  return data;
};

export const getMySubscriptions = async () => {
  const { data } = await api.get('/member/subscriptions');
  return data;
};

export const getMyWorkouts = async () => {
  const { data } = await api.get('/member/workouts');
  return data;
};

export const updateWorkoutProgress = async (id, progress) => {
  const { data } = await api.put(`/member/workouts/${id}/progress`, { progress });
  return data;
};

export const getMyDietPlans = async () => {
  const { data } = await api.get('/member/diet-plans');
  return data;
};

export const getMyTrainer = async () => {
  const { data } = await api.get('/member/trainer');
  return data;
};

export const generateQRCode = async () => {
  const { data } = await api.get('/member/qr-code');
  return data;
};

export const scanQRCode = async (qrData) => {
  const { data } = await api.post('/member/scan-qr', { qrData });
  return data;
};

export const getPlans = async (params = {}) => {
  const { data } = await api.get('/plans', { params });
  return data;
};
