import React, { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../contexts/ToastContext.jsx";

export default function DashboardLayout() {
  // Initialize user from localStorage to prevent flash of all tabs
  const [user, setUser] = useState(() => {
    const savedProfile = localStorage.getItem("profile");
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, success } = useToast();
  const SERVER_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${SERVER_URL}/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          localStorage.setItem("profile", JSON.stringify(data));
        }
      } catch (err) {
        error(err);
      }
    }
    fetchProfile();
  }, []);

  // Check permissions and redirect if user doesn't have access to current route
  useEffect(() => {
    if (!user) return; // Wait for user to load

    const permissionMap = {
      "/dashboard/payments": "payment",
      "/dashboard/staff": "staff",
      "/dashboard/files": "files",
      "/dashboard/dialer": "dialer",
      "/dashboard/leads": "dialer",
      "/dashboard/drivers": "driver",
      "/dashboard/loads": "driver",
    };

    const currentPath = location.pathname;
    const requiredPermission = permissionMap[currentPath];

    // If this route requires a permission
    if (requiredPermission) {
      // Admin/tenant has full access
      if (user.role !== 'staff') return;

      // Check if staff has the required permission
      const hasPermission = (user.permissions || []).includes(requiredPermission);

      if (!hasPermission) {
        // Redirect to first available page
        const availableRoutes = Object.keys(permissionMap).filter(path => {
          const perm = permissionMap[path];
          return (user.permissions || []).includes(perm);
        });

        if (availableRoutes.length > 0) {
          navigate(availableRoutes[0], { replace: true });
        } else {
          navigate("/dashboard/profile", { replace: true });
        }
      }
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    localStorage.removeItem("userRole");
    localStorage.removeItem("account");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    {
      path: "/dashboard/payments",
      label: "Payments",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      path: "/dashboard/staff",
      label: "Staff",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      path: "/dashboard/files",
      label: "Files",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      path: "/dashboard/dialer",
      label: "Dialer",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      path: "/dashboard/leads",
      label: "Leads",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: "/dashboard/drivers",
      label: "Drivers",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    {
      path: "/dashboard/loads",
      label: "Loads",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
  ];

  const permissionForPath = (path) => {
    if (!user) return true; // wait until loaded
    if (user.role !== 'staff') return true; // admin full access
    const map = {
      "/dashboard/payments": "payment",
      "/dashboard/staff": "staff",
      "/dashboard/files": "files",
      "/dashboard/dialer": "dialer",
      "/dashboard/leads": "dialer",
      "/dashboard/drivers": "driver",
      "/dashboard/loads": "driver",
    };
    const perm = map[path];
    return !perm || (user.permissions || []).includes(perm);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-gray-800 border-r border-gray-700 shadow-lg lg:shadow-sm
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
          ${sidebarCollapsed ? "w-16" : "w-64"}
          flex flex-col
        `}
      >
        {/* Logo Section */}
        <div className="p-2 lg:p-3 lg:py-[27px] border-b border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">SkyInfinit</h3>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {/* Desktop collapse button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={sidebarCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                  />
                </svg>
              </button>
              {/* Mobile close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 pt-4 pb-4 px-1 space-y-1">
          {navigationItems.filter((i) => permissionForPath(i.path)).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                group flex items-center ${sidebarCollapsed ? "justify-center px-1" : "px-3"
                } py-3 rounded-xl text-sm font-medium
                transition-all duration-200 relative overflow-hidden
                ${isActive(item.path)
                  ? "bg-gradient-to-r from-blue-900/30 to-blue-800/30 text-blue-300 shadow-sm border border-blue-700"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-sm"
                }
              `}
            >
              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
              )}

              {/* Icon */}
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                ${isActive(item.path)
                    ? "bg-blue-800/50 text-blue-300"
                    : "bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200"
                  }
              `}
              >
                {item.icon}
              </div>

              {/* Label */}
              {!sidebarCollapsed && (
                <span className="ml-3 font-medium">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}

          {/* Scraper Button */}
          {/* {(!user || user.role !== 'staff' || (user.permissions || []).includes('scraper')) && (
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${SERVER_URL}/run-scrapper`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
                  const data = await res.json();
                  if (res.ok) {
                    success(data.message || "Scraper started successfully!");
                  } else {
                    error(data.error || data.message || "Failed to start scraper");
                  }
                } catch (err) {
                  error(err);
                }
              }}
              className={`group flex items-center w-full ${sidebarCollapsed ? "justify-center px-1" : "px-3"
                } py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-sm transition-all duration-200`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-gray-400 group-hover:bg-gray-600 group-hover:text-gray-200 transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              {!sidebarCollapsed && (
                <span className="ml-3 font-medium">Run Scraper</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Run Scraper
                </div>
              )}
            </button>
          )} */}
        </nav>

        {/* User Info */}
        {!sidebarCollapsed && user && (
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-xl shadow-sm">
              <img
                src={
                  user?.profilePicture
                    ? SERVER_URL.replace("/api", "") + user.profilePicture
                    : "https://via.placeholder.com/40?text=👤"
                }
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 lg:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-100">
                  {navigationItems.find((item) => isActive(item.path))?.label ||
                    "Dashboard"}
                </h3>
                <p className="text-sm text-gray-400 hidden sm:block">
                  Welcome back, {user?.name || "User"}
                </p>
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3">
              {/* Profile Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center cursor-pointer space-x-3 p-2 rounded-xl hover:bg-gray-700 transition-colors border border-gray-600 hover:border-gray-500"
                >
                  <img
                    src={
                      user?.profilePicture
                        ? SERVER_URL.replace("/api", "") + user.profilePicture
                        : "https://via.placeholder.com/40?text=👤"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-100">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-400">View Profile</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-lg border border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-gray-100">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigate("/dashboard/profile");
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="animate-fade-in max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
