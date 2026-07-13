import api from './axios';

export const getPlans = async (params = {}) => {
  const { data } = await api.get('/plans', { params });
  return data;
};

export const getPlan = async (id) => {
  const { data } = await api.get(`/plans/${id}`);
  return data;
};

export const createPlan = async (planData) => {
  const { data } = await api.post('/plans', planData);
  return data;
};

export const updatePlan = async (id, planData) => {
  const { data } = await api.put(`/plans/${id}`, planData);
  return data;
};

export const deletePlan = async (id) => {
  const { data } = await api.delete(`/plans/${id}`);
  return data;
};
