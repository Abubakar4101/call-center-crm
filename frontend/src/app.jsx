import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import FilesPage from "./pages/FilesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import DialerPage from "./pages/DialerPage.jsx";
import DriversPage from "./pages/DriversPage.jsx";
import LoaderCarrierPage from "./pages/LoaderCarrierPage.jsx";
import LeadsPage from "./pages/LeadsPage.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import ToastContainer from "./components/ToastContainer.jsx";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/dashboard/payments" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default dashboard route */}
          <Route index element={<Navigate to="/dashboard/payments" replace />} />
          {/* ✅ These are relative paths */}
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="staff" element={<StaffPage />} />
          {/* THIS MUST BE HERE */}
          <Route path="files" element={<FilesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="dialer" element={<DialerPage />} />{" "}
          {/* ✅ RELATIVE PATH */}
          <Route path="leads" element={<LeadsPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="loads" element={<LoaderCarrierPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </ToastProvider>
  );
}
