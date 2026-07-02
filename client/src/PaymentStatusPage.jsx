import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');

  const [status, setStatus] = useState('loading');
  const intervalRef = useRef(null); // stores the interval so we can stop it

  useEffect(() => {
    if (!tx_ref) {
      setStatus('error');
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payments/status/${tx_ref}`
        );
        const currentStatus = response.data.status;
        setStatus(currentStatus);

        // Stop polling once we have a final answer
        if (currentStatus === 'success' || currentStatus === 'failed') {
          clearInterval(intervalRef.current);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
        setStatus('error');
        clearInterval(intervalRef.current); // stop polling on error too
      }
    };

    // Fetch immediately on load, then every 3 seconds
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 3000);

    // Cleanup — stop polling if user navigates away
    return () => clearInterval(intervalRef.current);

  }, [tx_ref]);

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      {status === 'loading' && <p>Checking your payment status...</p>}

      {status === 'pending' && (
        <>
          <h1 style={{ color: 'orange' }}>⏳ Payment Pending</h1>
          <p>Confirming your payment, please wait...</p>
          <p style={{ fontSize: '13px', color: '#888' }}>This updates automatically.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 style={{ color: 'green' }}>✅ Payment Successful</h1>
          <p>Thank you! Your payment has been confirmed.</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <h1 style={{ color: 'red' }}>❌ Payment Failed</h1>
          <p>Something went wrong with your payment. Please try again.</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 style={{ color: 'gray' }}>⚠️ Unable to Check Status</h1>
          <p>We couldn't find this transaction.</p>
        </>
      )}

      {tx_ref && (
        <p style={{ color: '#888', fontSize: '14px', marginTop: '20px' }}>
          Reference: {tx_ref}
        </p>
      )}
    </div>
  );
}

export default PaymentStatusPage;