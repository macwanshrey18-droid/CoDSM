const API_BASE = '/api';

export async function requestAPI(endpoint, method = 'GET', body = null, token = null) {
  const headers = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data;
}

// Auth API (Email OTP & Profile)
export const registerUser = (email, role) => requestAPI('/auth/register', 'POST', { email, role });
export const sendOTP = (email) => requestAPI('/auth/otp/send', 'POST', { email });
export const verifyOTP = (email, otp) => requestAPI('/auth/otp/verify', 'POST', { email, otp });
export const updateUserProfile = (token, data) => requestAPI('/auth/profile', 'PUT', data, token);
export const getUserProfile = (token) => requestAPI('/auth/me', 'GET', null, token);
export const deleteUserAccount = (token) => requestAPI('/auth/account', 'DELETE', null, token);

// Worker API
export const getWorkerProfile = (token) => requestAPI('/worker/profile', 'GET', null, token);
export const updateWorkerProfile = (token, profileData) => requestAPI('/worker/profile', 'PUT', profileData, token);
export const updateWorkerAvailability = (token, status) => requestAPI('/worker/availability', 'PUT', { status }, token);
export const getWorkerRequests = (token) => requestAPI('/worker/requests', 'GET', null, token);
export const acceptWorkerRequest = (token, requestId) => requestAPI(`/worker/requests/${requestId}/accept`, 'POST', null, token);
export const declineWorkerRequest = (token, requestId) => requestAPI(`/worker/requests/${requestId}/decline`, 'POST', null, token);
export const completeWorkerRequest = (token, requestId) => requestAPI(`/worker/requests/${requestId}/complete`, 'POST', null, token);
export const getWorkerEarnings = (token) => requestAPI('/worker/earnings', 'GET', null, token);

// Household API
export const createServiceRequest = (token, requestData) => requestAPI('/requests', 'POST', requestData, token);
export const getServiceRequest = (token, requestId) => requestAPI(`/requests/${requestId}`, 'GET', null, token);
export const confirmServiceRequest = (token, requestId) => requestAPI(`/requests/${requestId}/confirm`, 'POST', null, token);
export const retryServiceRequest = (token, requestId) => requestAPI(`/requests/${requestId}/retry`, 'POST', null, token);
export const cancelServiceRequest = (token, requestId) => requestAPI(`/requests/${requestId}/cancel`, 'POST', null, token);

// Rating API
export const submitRating = (token, ratingData) => requestAPI('/ratings', 'POST', ratingData, token);
export const getWorkerRatings = (workerId) => requestAPI(`/workers/${workerId}/ratings`, 'GET');
