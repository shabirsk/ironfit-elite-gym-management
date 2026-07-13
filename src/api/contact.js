import api from './axios';

export const submitContactForm = async (formData) => {
  const { data } = await api.post('/contact', formData);
  return data;
};
