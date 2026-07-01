import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import PaymentStatusPage from './PaymentStatusPage';
import AdminLoginForm from './AdminLoginForm';
import PaymentForm from './PaymentForm';
import AdminDashboard from './AdminDashboard';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PaymentForm />} />
        <Route path="/payment-status" element={<PaymentStatusPage />} />
        <Route path="/admin/login" element={<AdminLoginForm />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;