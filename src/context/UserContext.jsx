import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as authService from '../services/authService';
import toast from 'react-hot-toast';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined: not yet checked, null: not logged in
  const [loading, setLoading] = useState(true); // Start loading until we've checked for a session

  // On initial load, check if a user session exists
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // This is expected if the user is not logged in (API returns 401/403)
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkCurrentUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const loggedInUser = await authService.login(email, password);
      setUser(loggedInUser);
      toast.success('Successfully signed in!');
      return loggedInUser;
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error; // Re-throw to be handled by the login form
    }
  }, []);

  // Logout function to clear the user state
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    toast.success('Successfully signed out.');
  }, []);

  // Derived state to check if user is authenticated
  const isAuthenticated = !!user;

  const value = { user, loading, isAuthenticated, login, logout, setUser };

  return (
    <UserContext.Provider value={value}>{!loading && children}</UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};