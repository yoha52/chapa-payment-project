import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from "axios";
function PaymentStatusPage() {
    // Hardcoded for now — just to design the layout
    const [searchParams] = useSearchParams(); // try changing this to 'failed' or 'pending' to see how it looks
    const tx_ref = searchParams.get('tx_ref');
    const [status, setStatus ]= useState('loading');

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
                setStatus(response.data.status);
                console.log(status)
            } catch (error) {
                console.log('Failed to fetch status:', error)
                setStatus('error');
            }

        }
        fetchStatus();
    }, [tx_ref])


    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
            {status === 'success' && (
                <>
                    <h1 style={{ color: 'green', lineHeight: '1.5' }}>✅ Payment Successful</h1>
                    <p>Thank you! Your payment has been confirmed.</p>
                </>
            )}

            {status === 'failed' && (
                <>
                    <h1 style={{ color: 'red' }}>❌ Payment Failed</h1>
                    <p>Something went wrong with your payment. Please try again.</p>
                </>
            )}

            {status === 'pending' && (
                <>
                    <h1 style={{ color: 'orange' }}>⏳ Payment Pending</h1>
                    <p>We're still confirming your payment. Please wait a moment.</p>
                </>
            )}

            <p style={{ color: '#888', fontSize: '14px' }}>Reference: {tx_ref}</p>
        </div>
    );
}

export default PaymentStatusPage;