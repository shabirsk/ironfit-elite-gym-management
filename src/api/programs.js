import api from './axios';

export const getPrograms = async (params = {}) => {
  const { data } = await api.get('/programs', { params });
  return data;
};

export const getProgram = async (id) => {
  const { data } = await api.get(`/programs/${id}`);
  return data;
};

export const createProgram = async (programData) => {
  const { data } = await api.post('/programs', programData);
  return data;
};

export const updateProgram = async (id, programData) => {
  const { data } = await api.put(`/programs/${id}`, programData);
  return data;
};

export const deleteProgram = async (id) => {
  const { data } = await api.delete(`/programs/${id}`);
  return data;
};
