import api from './axios';

export const getMembers = async (params = {}) => {
  const { data } = await api.get('/members', { params });
  return data;
};

export const getMember = async (id) => {
  const { data } = await api.get(`/members/${id}`);
  return data;
};

export const createMember = async (memberData) => {
  const { data } = await api.post('/members', memberData);
  return data;
};

export const updateMember = async (id, memberData) => {
  const { data } = await api.put(`/members/${id}`, memberData);
  return data;
};

export const deleteMember = async (id) => {
  const { data } = await api.delete(`/members/${id}`);
  return data;
};

export const convertLeadToMember = async (leadId, memberData) => {
  const { data } = await api.post(`/members/convert-lead/${leadId}`, memberData);
  return data;
};
