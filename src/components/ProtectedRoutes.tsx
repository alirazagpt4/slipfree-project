import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
    const token = localStorage.getItem('admin_token');

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};