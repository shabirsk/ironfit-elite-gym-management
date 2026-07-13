import api from './axios';

export const getDietPlans = async (params = {}) => {
  const { data } = await api.get('/diet-plans', { params });
  return data;
};

export const getDietPlan = async (id) => {
  const { data } = await api.get(`/diet-plans/${id}`);
  return data;
};

export const createDietPlan = async (dietPlanData) => {
  const { data } = await api.post('/diet-plans', dietPlanData);
  return data;
};

export const updateDietPlan = async (id, dietPlanData) => {
  const { data } = await api.put(`/diet-plans/${id}`, dietPlanData);
  return data;
};

export const deleteDietPlan = async (id) => {
  const { data } = await api.delete(`/diet-plans/${id}`);
  return data;
};
