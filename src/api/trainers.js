import api from './axios';

export const getTrainers = async (params = {}) => {
  const { data } = await api.get('/trainers', { params });
  return data;
};

export const getTrainer = async (id) => {
  const { data } = await api.get(`/trainers/${id}`);
  return data;
};

export const createTrainer = async (trainerData) => {
  const { data } = await api.post('/trainers', trainerData);
  return data;
};

export const updateTrainer = async (id, trainerData) => {
  const { data } = await api.put(`/trainers/${id}`, trainerData);
  return data;
};

export const deleteTrainer = async (id) => {
  const { data } = await api.delete(`/trainers/${id}`);
  return data;
};

export const assignMembers = async (id, memberIds) => {
  const { data } = await api.put(`/trainers/${id}/assign-members`, { memberIds });
  return data;
};
