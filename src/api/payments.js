import api from './axios';

export const getPayments = async (params = {}) => {
  const { data } = await api.get('/payments', { params });
  return data;
};

export const getPayment = async (id) => {
  const { data } = await api.get(`/payments/${id}`);
  return data;
};

export const recordPayment = async (paymentData) => {
  const { data } = await api.post('/payments', paymentData);
  return data;
};

export const getPaymentReports = async (params = {}) => {
  const { data } = await api.get('/payments/reports', { params });
  return data;
};

// ===== RAZORPAY ENDPOINTS =====

export const createRazorpayOrder = async ({ planId, memberId }) => {
  const { data } = await api.post('/payments/razorpay/create-order', { planId, memberId });
  return data;
};

export const verifyRazorpayPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const { data } = await api.post('/payments/razorpay/verify', {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return data;
};

export const refundRazorpayPayment = async (paymentId, amount) => {
  const { data } = await api.post(`/payments/razorpay/refund/${paymentId}`, { amount });
  return data;
};

export const getRazorpayOrders = async (params = {}) => {
  const { data } = await api.get('/payments/razorpay/orders', { params });
  return data;
};
