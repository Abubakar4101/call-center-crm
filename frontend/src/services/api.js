// API service layer for frontend to backend communication
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(error.message || "Request failed");
    }
    return response.json();
  }

  // Auth APIs
  async login(email, password, role) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    return this.handleResponse(response);
  }

  async register(tenantName, name, email, password) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantName,
        name,
        email,
        password,
        type: "tenant",
      }),
    });
    return this.handleResponse(response);
  }

  // Staff APIs
  async getStaff() {
    const response = await fetch(`${this.baseURL}/staff`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createStaff(staffData) {
    const response = await fetch(`${this.baseURL}/staff`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(staffData),
    });
    return this.handleResponse(response);
  }

  async updateStaff(id, staffData) {
    const response = await fetch(`${this.baseURL}/staff/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(staffData),
    });
    return this.handleResponse(response);
  }

  async deleteStaff(id) {
    const response = await fetch(`${this.baseURL}/staff/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Payment APIs
  async getPayments() {
    const response = await fetch(`${this.baseURL}/payments`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getDashboardStats() {
    const response = await fetch(`${this.baseURL}/payments/dashboard`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createPayment(paymentData) {
    const response = await fetch(`${this.baseURL}/stripe/create-checkout`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });
    return this.handleResponse(response);
  }

  // File APIs
  async getFiles() {
    const response = await fetch(`${this.baseURL}/files`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async renameFile(fileId, name) {
    const response = await fetch(`${this.baseURL}/files/rename`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ fileId, name }),
    });
    return this.handleResponse(response);
  }

  async deleteFile(fileId) {
    const response = await fetch(`${this.baseURL}/files/delete`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ fileId }),
    });
    return this.handleResponse(response);
  }

  // Dialer APIs
  async startDialing(filename) {
    const response = await fetch(`${this.baseURL}/dialer/start`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ filename }),
    });
    return this.handleResponse(response);
  }

  async stopDialing() {
    const response = await fetch(`${this.baseURL}/dialer/stop`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async nextCall() {
    const response = await fetch(`${this.baseURL}/dialer/next`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async prevCall() {
    const response = await fetch(`${this.baseURL}/dialer/prev`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async loadContacts(fileId) {
    const response = await fetch(`${this.baseURL}/dialer/load/${fileId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Call metrics
  async incrementCallsMade() {
    const response = await fetch(`${this.baseURL}/dialer/metrics/made`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async incrementCallsReceived() {
    const response = await fetch(`${this.baseURL}/dialer/metrics/received`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Profile APIs
  async getProfile() {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData) {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await fetch(`${this.baseURL}/profile/upload-picture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  // Driver APIs
  async getDrivers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/drivers${queryString ? `?${queryString}` : ''}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getDriverById(id) {
    const response = await fetch(`${this.baseURL}/drivers/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createDriver(driverData) {
    const response = await fetch(`${this.baseURL}/drivers`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(driverData),
    });
    return this.handleResponse(response);
  }

  async updateDriver(id, driverData) {
    const response = await fetch(`${this.baseURL}/drivers/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(driverData),
    });
    return this.handleResponse(response);
  }

  async updateDriverStatus(id, status, notes = '') {
    const response = await fetch(`${this.baseURL}/drivers/${id}/status`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return this.handleResponse(response);
  }

  async deleteDriver(id) {
    const response = await fetch(`${this.baseURL}/drivers/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async uploadDriverDocument(id, documentType, file) {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentType);

    const response = await fetch(`${this.baseURL}/drivers/${id}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getDriverStats() {
    const response = await fetch(`${this.baseURL}/drivers/stats`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
