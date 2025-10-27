import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await apiService.getDashboardStats();

        // Transform API data to match the UI structure
        const transformedStats = [
          {
            title: "Total Revenue",
            value: `$${dashboardStats.totalRevenue?.toLocaleString() || "0"}`,
            change: dashboardStats.revenueChange
              ? `+${dashboardStats.revenueChange}%`
              : "+0%",
            changeType: "positive",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            ),
          },
          {
            title: "Active Users",
            value: dashboardStats.activeUsers?.toLocaleString() || "0",
            change: dashboardStats.usersChange
              ? `+${dashboardStats.usersChange}%`
              : "+0%",
            changeType: "positive",
            icon: (
              <svg
                className="w-6 h-6"
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
            title: "Total Payments",
            value: dashboardStats.totalPayments?.toLocaleString() || "0",
            change: dashboardStats.paymentsChange
              ? `+${dashboardStats.paymentsChange}%`
              : "+0%",
            changeType: "positive",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
          },
          {
            title: "Pending Orders",
            value: dashboardStats.pendingOrders?.toLocaleString() || "0",
            change: dashboardStats.ordersChange
              ? `${dashboardStats.ordersChange}%`
              : "0%",
            changeType:
              dashboardStats.ordersChange < 0 ? "negative" : "positive",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
        ];

        setStats(transformedStats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Fallback to default stats if API fails
        setStats([
          {
            title: "Total Revenue",
            value: "$0",
            change: "+0%",
            changeType: "positive",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            ),
          },
          {
            title: "Active Users",
            value: "0",
            change: "+0%",
            changeType: "positive",
            icon: (
              <svg
                className="w-6 h-6"
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
            title: "Total Payments",
            value: "0",
            change: "+0%",
            changeType: "positive",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
          },
          {
            title: "Pending Orders",
            value: "0",
            change: "0%",
            changeType: "positive",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Welcome to SkyInfinit Dashboard! 🎉
            </h1>
            <p className="text-blue-100 text-sm lg:text-base">
              Manage your business operations efficiently with our comprehensive
              tools.
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {loading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg animate-pulse">
                      <div className="w-6 h-6"></div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-12"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-20 ml-2"></div>
                  </div>
                </div>
              </div>
            ))
          : stats.map((stat, index) => (
              <div key={index} className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-100 mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                      <div className="text-blue-400">{stat.icon}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "positive"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      from last month
                    </span>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-100">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Common tasks and shortcuts
            </p>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/dashboard/payments")}
                className="p-4 bg-blue-900/20 rounded-lg hover:bg-blue-900/30 transition-colors text-left"
              >
                <div className="text-blue-400 mb-2">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <h4 className="font-medium text-gray-100">Payments</h4>
                <p className="text-sm text-gray-400">Manage transactions</p>
              </button>

              <button
                onClick={() => navigate("/dashboard/staff")}
                className="p-4 bg-green-900/20 rounded-lg hover:bg-green-900/30 transition-colors text-left"
              >
                <div className="text-green-400 mb-2">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <h4 className="font-medium text-gray-100">Staff</h4>
                <p className="text-sm text-gray-400">Team management</p>
              </button>

              <button
                onClick={() => navigate("/dashboard/files")}
                className="p-4 bg-purple-900/20 rounded-lg hover:bg-purple-900/30 transition-colors text-left"
              >
                <div className="text-purple-400 mb-2">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <h4 className="font-medium text-gray-100">Files</h4>
                <p className="text-sm text-gray-400">Document storage</p>
              </button>

              <button
                onClick={() => navigate("/dashboard/dialer")}
                className="p-4 bg-orange-900/20 rounded-lg hover:bg-orange-900/30 transition-colors text-left"
              >
                <div className="text-orange-400 mb-2">
                  <svg
                    className="w-6 h-6"
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
                </div>
                <h4 className="font-medium text-gray-100">Dialer</h4>
                <p className="text-sm text-gray-400">Communication tools</p>
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-100">
              Recent Activity
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Latest updates and notifications
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-100">New payment received</p>
                  <p className="text-xs text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-100">Staff member added</p>
                  <p className="text-xs text-gray-400">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-100">
                    File uploaded successfully
                  </p>
                  <p className="text-xs text-gray-400">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
