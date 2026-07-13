import api from './axios';

export const memberLogin = async (email, password) => {
  const { data } = await api.post('/member-auth/login', { email, password });
  return data;
};

export const memberRegister = async (userData) => {
  const { data } = await api.post('/member-auth/register', userData);
  return data;
};

export const getMemberProfile = async () => {
  const { data } = await api.get('/member-auth/me');
  return data;
};

export const updateMemberProfile = async (profileData) => {
  const { data } = await api.put('/member-auth/profile', profileData);
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/member-auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, email, password) => {
  const { data } = await api.post(`/member-auth/reset-password/${token}`, { email, password });
  return data;
};
