import api from './axios';

export const getAttendance = async (params = {}) => {
  const { data } = await api.get('/attendance', { params });
  return data;
};

export const markAttendance = async (attendanceData) => {
  const { data } = await api.post('/attendance', attendanceData);
  return data;
};

export const scanAdminQRCode = async (qrData) => {
  const { data } = await api.post('/attendance/scan', { qrData });
  return data;
};

export const getAttendanceReport = async (params = {}) => {
  const { data } = await api.get('/attendance/report', { params });
  return data;
};
