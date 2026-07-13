import api from './axios';

export const getSubscriptions = async (params = {}) => {
  const { data } = await api.get('/subscriptions', { params });
  return data;
};

export const getSubscription = async (id) => {
  const { data } = await api.get(`/subscriptions/${id}`);
  return data;
};

export const createSubscription = async (subData) => {
  const { data } = await api.post('/subscriptions', subData);
  return data;
};

export const updateSubscription = async (id, subData) => {
  const { data } = await api.put(`/subscriptions/${id}`, subData);
  return data;
};

export const deleteSubscription = async (id) => {
  const { data } = await api.delete(`/subscriptions/${id}`);
  return data;
};

export const renewSubscription = async (id) => {
  const { data } = await api.post(`/subscriptions/${id}/renew`);
  return data;
};

export const cancelSubscription = async (id) => {
  const { data } = await api.post(`/subscriptions/${id}/cancel`);
  return data;
};
