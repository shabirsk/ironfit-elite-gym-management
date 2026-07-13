import api from './axios';

export const getWorkouts = async (params = {}) => {
  const { data } = await api.get('/workouts', { params });
  return data;
};

export const getWorkout = async (id) => {
  const { data } = await api.get(`/workouts/${id}`);
  return data;
};

export const createWorkout = async (workoutData) => {
  const { data } = await api.post('/workouts', workoutData);
  return data;
};

export const updateWorkout = async (id, workoutData) => {
  const { data } = await api.put(`/workouts/${id}`, workoutData);
  return data;
};

export const deleteWorkout = async (id) => {
  const { data } = await api.delete(`/workouts/${id}`);
  return data;
};

export const assignToMember = async (id, memberId) => {
  const { data } = await api.put(`/workouts/${id}/assign`, { memberId });
  return data;
};

export const updateProgress = async (id, progress) => {
  const { data } = await api.put(`/workouts/${id}/progress`, { progress });
  return data;
};
