import { useState } from 'react';
import axios from 'axios';
import './PaymentForm.css'
function PaymentForm() {
    // 1. Set up state for each form field
    const [full_name, setfull_name] = useState('');
    const [phone_number, setphone_number] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setloading] = useState(false);

    // 2. Handle form submission (intercepting default browser reload)
    const handleSubmit = async (e) => {

        e.preventDefault();
        setloading(true);

        if (Number(amount) <= 0) {
            alert("Please enter a valid amount greater than 0.");
            setloading(false);
            return; // Stops the function here!
        } // amount validation
        const cleanPhone = phone_number.trim();
        const ethiopianPhoneRegex = /^(09|07)\d{8}$/;
        if (!ethiopianPhoneRegex.test(cleanPhone)) {
            alert("Please enter a valid 10-digit phone number starting with 09 or 07. Letters and symbols are not allowed.");
            setloading(false);
            return; // Stops execution dead in its tracks
        }//phone number validation

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/payments/initiate`, {
                full_name,
                phone_number,
                amount
            });
            console.log('Backend response:', response.data);
            if (response.data && response.data.url) {
                window.location.href = response.data.url;
            } else {
                alert('Payment initialization succeeded, but no redirect URL was returned.');
            }
        }
        catch (error) {
            console.error('Payment initialization failed:', error);

            if (error.response) {
                // The server responded with a status code outside the 2xx range
                // (e.g., our 400 validation error messages)
                alert(error.response.data.message || error.response.data.error || "Server rejected submission.");
            } else if (error.request) {
                // The request was made but no response was received
                // This is your Ghost Server / Network Outage trigger!
                alert("Unable to reach the payment server. Please verify your internet connection or check if the server is offline.");
            } else {
                // Something happened in setting up the request that triggered an Error
                alert("An unexpected error occurred. Please try again.");
            }
        }
        finally {
            setloading(false)
        }
    }
    return (
        <div className="payment-container">
            <h1 className="payment-title">Make a Payment</h1>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your full name"
                        maxLength="100"
                        value={full_name}
                        onChange={(e) => setfull_name(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your phone number"
                        value={phone_number}
                        onChange={(e) => setphone_number(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Amount (ETB)</label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        step="0.01"
                        disabled={loading}
                    />
                </div>

                <button type="submit" className="pay-button" disabled={loading}>
                    {loading ? 'Processing...' : 'Pay'}
                </button>
            </form>
        </div>
    );
}


export default PaymentForm;







