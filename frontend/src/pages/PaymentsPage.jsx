import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { useToast } from "../contexts/ToastContext.jsx";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const {error, success} = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    title: "",
    customerEmail: "",
  });
  const [checkoutLink, setCheckoutLink] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const fetchData = async () => {
    try {
      setLoading(true);
      const [{ payments: paymentList, pagination }, stats] = await Promise.all([
        apiService.getPayments({ page, limit: pageSize }),
        apiService.getDashboardStats(),
      ]);

      setPayments(paymentList || []);
      setTotalCount(stats.totalCount || pagination?.totalItems || 0);
      setTotalThisMonth(stats.totalThisMonth || 0);
      setTotalPages(pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      error("Failed to fetch payments data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [page]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      succeeded: "badge-success",
      pending: "badge-warning",
      failed: "badge-error",
      canceled: "badge-gray",
    };
    return statusClasses[status] || "badge-gray";
  };

  const handlePaymentFormChange = (e) => {
    setPaymentFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      // Call backend API to create payment
      const response = await apiService.createPayment({
        amount: Number(paymentFormData.amount),
        title: paymentFormData.title,
        customer_email: paymentFormData.customerEmail,
        currency: "usd",
      });

      // Set the checkout link from backend response
      setCheckoutLink(response.url);
      success("Checkout link created successfully!");
      
      await fetchData();
      // Don't add temporary payment - wait for webhook to create real payment
      // The payment will appear in the list when the user completes the checkout
    } catch (err) {
      console.error(err);
      error("Server error, please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setPaymentFormData({ amount: "", title: "", customerEmail: "" });
    setCheckoutLink("");
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-100">
            Payments
          </h3>
          <p className="text-gray-400 mt-1 text-sm lg:text-base">
            Manage and track all payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const fetchData = async () => {
                try {
                  setLoading(true);
                  const [{ payments: paymentList, pagination }, stats] = await Promise.all([
                    apiService.getPayments({ page, limit: pageSize }),
                    apiService.getDashboardStats(),
                  ]);
                  setPayments(paymentList || []);
                  setTotalCount(stats.totalCount || pagination?.totalItems || 0);
                  setTotalThisMonth(stats.totalThisMonth || 0);
                  setTotalPages(pagination?.totalPages || 1);
                  success("Payments refreshed successfully!");
                } catch (err) {
                  console.error("Failed to fetch payments:", err);
                  error("Failed to refresh payments data");
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            }}
            className="btn btn-secondary w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => {
              setPaymentFormData({ amount: "", title: "", customerEmail: "" });
              setCheckoutLink("");
              setShowPaymentModal(true);
            }}
            className="btn btn-primary w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Total Payments
                </p>
                <p className="text-2xl font-bold text-gray-100">{totalCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-100">
                  ${totalThisMonth.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-100">
                  {payments.length > 0
                    ? Math.round(
                        (payments.filter((p) => p.status === "succeeded")
                          .length /
                          payments.length) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-100">
            Recent Payments
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Latest payment transactions
          </p>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">
                  Loading payments...
                </span>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No payments
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new payment.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th className="hidden sm:table-cell">Payment ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th className="hidden md:table-cell">Currency</th>
                    <th>Status</th>
                    <th className="hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td className="hidden sm:table-cell font-mono text-xs lg:text-sm">
                        {p.stripePaymentId?.slice(0, 8)}...
                      </td>
                      <td>
                        <div className="flex items-center">
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2 lg:mr-3">
                            <svg
                              className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600"
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
                          </div>
                          <span className="text-xs lg:text-sm truncate max-w-24 lg:max-w-none">
                            {p.customer_email}
                          </span>
                        </div>
                      </td>
                      <td className="font-semibold text-sm lg:text-base">
                        ${p.amount}
                      </td>
                      <td className="hidden md:table-cell">
                        <span className="badge badge-gray text-xs">
                          {p.currency?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${getStatusBadge(
                            p.status
                          )} text-xs`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell text-xs lg:text-sm text-gray-600">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex items-center justify-between p-4 border-t border-gray-700">
                <div className="text-xs lg:text-sm text-gray-400">
                  Page {page} of {totalPages} • {totalCount} total
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1 || loading}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages || loading}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Creation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-gray-700 modal-content">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800 rounded-t-2xl">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">
                  Create New Payment
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Generate a secure checkout link for your customer
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all duration-200 p-2 rounded-lg cursor-pointer"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto modal-body">
              <div className="p-6">
                {!checkoutLink ? (
                  <form onSubmit={handleCreatePayment} className="space-y-5">
                    {/* Amount */}
                    <div>
                      <label className="form-label">Amount (USD)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          name="amount"
                          placeholder="0.00"
                          value={paymentFormData.amount}
                          onChange={handlePaymentFormChange}
                          className="form-input pl-7"
                          required
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="form-label">Payment Title</label>
                      <input
                        type="text"
                        name="title"
                        placeholder="e.g., Monthly Subscription, Service Fee"
                        value={paymentFormData.title}
                        onChange={handlePaymentFormChange}
                        className="form-input"
                        required
                      />
                    </div>

                    {/* Customer Email */}
                    <div>
                      <label className="form-label">Customer Email</label>
                      <input
                        type="email"
                        name="customerEmail"
                        placeholder="customer@example.com"
                        value={paymentFormData.customerEmail}
                        onChange={handlePaymentFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </form>
                ) : (
                  /* Success Result */
                  <div className="p-4 lg:p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Payment link created successfully!
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          Share this link with your customer to complete the
                          payment.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">
                          Checkout Link
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={checkoutLink}
                            readOnly
                            className="form-input flex-1 sm:rounded-r-none"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(checkoutLink);
                              alert("Link copied to clipboard!");
                            }}
                            className="btn btn-secondary sm:rounded-l-none sm:border-l-0"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => window.open(checkoutLink, "_blank")}
                          className="btn btn-primary btn-sm flex-1 sm:flex-none"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Open Link
                        </button>
                        <button
                          onClick={resetPaymentForm}
                          className="btn btn-secondary btn-sm flex-1 sm:flex-none"
                        >
                          Create Another
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            {!checkoutLink && (
              <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800 rounded-b-2xl modal">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-secondary order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleCreatePayment}
                  disabled={paymentLoading}
                  className="btn btn-primary order-1 sm:order-2"
                >
                  {paymentLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Payment...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Payment Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
