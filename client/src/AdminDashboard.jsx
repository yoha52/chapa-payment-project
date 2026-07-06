import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios";
function AdminDashboard() {
    const [payments, setpayments] = useState([]);
    const [error, seterror] = useState('');
    const [loading, setloading] = useState(false);

    const navigate = useNavigate();
    async function handleLogout() {
       try{
         await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/logout`, {}, { withCredentials: true });
        navigate('/admin/login')
       }catch(err){
        console.log(err)
        navigate('/admin/login')
       }
    }
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/admin/payments`,
                    { withCredentials: true }
                );
                setpayments(response.data.payments);
            } catch (err) {
                console.error('Full Error Response:', err.response?.data);
                if (err.response.status === 401) {
                    navigate('/admin/login'); // not logged in / token expired — bounce back
                } else {
                    seterror('Failed to load payments');
                }
                

            } finally {
                setloading(false)
            }
        }
        fetchPayments();

    }, [navigate]);
    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</p>;
    if (error) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</p>;
    return (
        <div style={{ maxWidth: '1000px', margin: '50px auto', padding: '20px', backgroundColor: '#121212', color: '#e0e0e0', borderRadius: '8px' }}>
            <h1 style={{ marginBottom: '20px' }}>Admin Dashboard</h1>
        <div> <button onClick={
            handleLogout
        }>logout</button></div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    {/* Header Row: Jet Black background with Light Gray text */}
                    <tr style={{ backgroundColor: '#1a1a1a', borderBottom: '2px solid #333', textAlign: 'left', color: '#b3b3b3' }}>
                        <th style={{ padding: '12px 8px' }}>Name</th>
                        <th style={{ padding: '12px 8px' }}>Phone</th>
                        <th style={{ padding: '12px 8px' }}>Amount</th>
                        <th style={{ padding: '12px 8px' }}>Tx Ref</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px' }}>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Added 'index' to calculate even/odd row backgrounds */}
                    {payments.map((p, index) => (
                        <tr 
                            key={p.id} 
                            style={{ 
                                borderBottom: '1px solid #2d2d2d',
                                /* Zebra pattern: Alternate between solid dark charcoal and off-black */
                                backgroundColor: index % 2 === 0 ? '#1e1e1e' : '#252525'
                            }}
                        >
                            <td style={{
                                padding: '12px 8px',
                                maxWidth: '200px',            
                                whiteSpace: 'nowrap',         
                                overflow: 'hidden',           
                                textOverflow: 'ellipsis'
                            }} title={p.full_name}>
                                {p.full_name}
                            </td>
                            <td style={{ padding: '12px 8px' }}>{p.phone_number}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{p.amount}</td>
                            <td style={{ padding: '12px 8px', fontSize: '12px', color: '#aaa' }}>{p.tx_ref}</td>
                            <td style={{ padding: '12px 8px' }}>
                                <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    /* Enhanced status badges for dark mode readability */
                                    backgroundColor:
                                        p.chapa_status === 'success' ? '#1b4332' :
                                            p.chapa_status === 'failed' ? '#4c1d1d' : '#4d3e17',
                                    color:
                                        p.chapa_status === 'success' ? '#52b788' :
                                            p.chapa_status === 'failed' ? '#ff8585' : '#ffd166',
                                }}>
                                    {p.chapa_status}
                                </span>
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '12px', color: '#bbb' }}>
                                {new Date(p.created_at).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {payments.length === 0 && <p style={{ marginTop: '20px', color: '#888' }}>No payments yet.</p>}
        </div>
    );
}


export default AdminDashboard;