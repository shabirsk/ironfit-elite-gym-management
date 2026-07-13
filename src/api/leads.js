import api from './axios';

export const getLeads = async (params = {}) => {
  const { data } = await api.get('/leads', { params });
  return data;
};

export const getLead = async (id) => {
  const { data } = await api.get(`/leads/${id}`);
  return data;
};

export const updateLead = async (id, updates) => {
  const { data } = await api.put(`/leads/${id}`, updates);
  return data;
};

export const deleteLead = async (id) => {
  const { data } = await api.delete(`/leads/${id}`);
  return data;
};
