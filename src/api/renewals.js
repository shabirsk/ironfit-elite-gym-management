import api from './axios';

export const getRenewalDashboard = async () => {
  const { data } = await api.get('/renewals');
  return data;
};
