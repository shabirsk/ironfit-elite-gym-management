import api from './axios';

export const getPublicStats = async () => {
  const { data } = await api.get('/public/stats');
  return data;
};
