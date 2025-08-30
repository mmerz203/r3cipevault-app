import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  // Note: Logout is primarily a client-side action with Firebase Auth.
  // This backend call would be for invalidating a session token if you have one.
  await api.post('/auth/logout');
};

export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

// This endpoint is expected to check the user's session (e.g., via a secure cookie)
// and return the user's data if they are authenticated, or a 401 error if not.
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    // It's expected for this to fail if the user is not logged in.
    return null;
  }
};