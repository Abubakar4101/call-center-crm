import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import apiService from "../services/api";

// Map route segments to permission keys
const routePermissionMap = {
  payments: "payment",
  staff: "staff",
  files: "files",
  dialer: "dialer",
};

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "null");
    } catch (_) {
      return null;
    }
  });

  if (!token) return <Navigate to="/login" replace />;

  useEffect(() => {
    if (!profile) {
      apiService
        .getProfile()
        .then((p) => {
          setProfile(p);
          localStorage.setItem("profile", JSON.stringify(p));
        })
        .catch(() => {});
    }
  }, []);

  // If we have a profile and user is staff, enforce permission by URL
  if (profile && profile.role === "staff") {
    console.log("I am in")
    const parts = location.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("dashboard");
    const section = idx >= 0 ? parts[idx + 1] : null;
    const required = section ? routePermissionMap[section] : null;
    if (required && !(profile.permissions || []).includes(required)) {
      // Find first available page for this staff user
      const availablePages = [
        { path: "/dashboard/payments", perm: "payment" },
        { path: "/dashboard/staff", perm: "staff" },
        { path: "/dashboard/files", perm: "files" },
        { path: "/dashboard/dialer", perm: "dialer" }
      ];
      const firstAvailable = availablePages.find(page => 
        (profile.permissions || []).includes(page.perm)
      );
      const redirectTo = firstAvailable ? firstAvailable.path : "/dashboard";
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
}
