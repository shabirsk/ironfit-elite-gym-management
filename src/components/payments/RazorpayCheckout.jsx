import { useState } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../api/payments';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * RazorpayCheckout — Button that opens Razorpay payment modal
 * 
 * Props:
 *   planId: string (required)
 *   memberId: string (required)
 *   onSuccess: (result) => void — called on successful payment + subscription
 *   onError: (error) => void
 *   buttonText: string — default "Pay Online"
 *   disabled: boolean
 *   className: string — additional CSS class
 */
const RazorpayCheckout = ({ planId, memberId, onSuccess, onError, buttonText, disabled, className }) => {
  const [loading, setLoading] = useState(false);

  const loadScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = RAZORPAY_SCRIPT;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Load Razorpay script
      const loaded = await loadScript();
      if (!loaded) {
        throw new Error('Failed to load Razorpay checkout. Please check your internet connection.');
      }

      // Step 2: Create order on backend
      const orderData = await createRazorpayOrder({ planId, memberId });
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const { order, keyId, plan, member } = orderData;

      // Step 3: Open Razorpay checkout modal
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'IronFit Elite',
        description: `${plan.name} — ₹${plan.price}`,
        order_id: order.id,
        prefill: {
          name: member.name,
          email: member.email,
          contact: member.phone,
        },
        theme: { color: '#ff6200' },
        handler: async function (response) {
          try {
            // Step 4: Verify payment on backend
            const verifyData = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.success) {
              onSuccess?.(verifyData);
            } else {
              onError?.(new Error(verifyData.message || 'Payment verification failed'));
            }
          } catch (err) {
            onError?.(err);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        onError?.(new Error(response.error.description || 'Payment failed'));
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      onError?.(err);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={className || 'razorpay-btn'}
      onClick={handlePayment}
      disabled={disabled || loading || !planId || !memberId}
      style={{
        padding: '10px 20px',
        background: loading ? '#888' : '#ff6200',
        color: '#fff',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        borderRadius: 6,
        transition: 'background 0.15s ease',
        opacity: (disabled || loading) ? 0.6 : 1,
      }}
    >
      {loading ? 'Processing...' : (buttonText || 'Pay Online')}
    </button>
  );
};

export default RazorpayCheckout;
