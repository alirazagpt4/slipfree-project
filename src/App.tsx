import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Aapka untouched live code (purana App.tsx jo rename kiya)
import CustomerReceipt from './CustomerReceipt';

// 2. Admin Portal Pages jo aapne Step 2 mein banaye
import { AdminLogin } from './pages/AdminLogin';
import { AdminTransactions } from './pages/AdminTransactions';
import { ProtectedRoute } from './components/ProtectedRoutes';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Customer Route: Pure live receipt code load hoga */}
                <Route path="/v/:hash" element={<CustomerReceipt />} />

                {/* Admin Public Route: Login screen */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Admin Protected Route: Dashboard access guard */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/admin/dashboard" element={<AdminTransactions />} />
                </Route>

                {/* Catch-All: Koi bhi irrelevant URL directly Admin Login par bhej dega */}
                <Route path="*" element={<Navigate to="/admin/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}