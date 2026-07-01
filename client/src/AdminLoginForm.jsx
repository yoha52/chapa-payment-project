import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLoginForm() {
    const [username, setusername] = useState('');
    const [password, setpassword] = useState('');
    const [error, seterror] = useState('');
    const [loading, setloading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        seterror('');
        setloading(true);

        try {
            await axios.post(
               `${import.meta.env.VITE_API_URL}/api/admin/login`
                , { username, password },
                { withCredentials: true }
            )

            navigate('/admin/dashboard');

        } catch (err) {
            console.error('Full Error Response:', err.response?.data);
            console.error('Login failed:', err);
            setError('Invalid username or password');
            setLoading(false);

        }

    };
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h1>Admin Login</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Username</label>
                    <br />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setusername(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Password</label>
                    <br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setpassword(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>

                <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}

export default AdminLoginForm;