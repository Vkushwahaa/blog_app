import { createContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    try {
      const tokens = localStorage.getItem("authTokens");
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error("Error parsing authTokens:", error);
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const tokens = localStorage.getItem("authTokens");
      if (!tokens) return null;
      const parsedTokens = JSON.parse(tokens);
      return parsedTokens.access ? jwtDecode(parsedTokens.access) : null; // Safe access
    } catch (error) {
      console.error("Error decoding authTokens:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [tokenRefreshed, setTokenRefreshed] = useState(false);
  const navigate = useNavigate();

  const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = jwtDecode(token);
    const buffer = 60;
    return decoded.exp < Date.now() / 1000 + buffer;
  };

  const loginUser = useCallback(
    async (event) => {
      event.preventDefault();

      try {
        const response = await fetch(`${API_URL}/auths/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: event.target.username.value,
            password: event.target.password.value,
          }),
        });

        const data = await response.json();
        console.log("Login Response:", data); // ✅ Debugging step

        if (!response.ok) {
          throw new Error(data.detail || "Invalid username or password.");
        }

        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem("authTokens", JSON.stringify(data));
        navigate("/");
      } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
      }
    },
    [navigate]
  );

  const logoutUser = useCallback(() => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    navigate("/login");
  }, [navigate]);

  const updateToken = useCallback(async () => {
    if (!authTokens || !authTokens.refresh) {
      setLoading(false);
      setTokenRefreshed(true);
      logoutUser();
      return;
    }

    if (isTokenExpired(authTokens.refresh)) {
      console.error("Refresh token expired. Logging out.");
      logoutUser();
      return;
    }

    try {
      console.log("Refreshing token...");
      const response = await fetch(`${API_URL}/auths/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: authTokens.refresh }),
      });

      if (!response.ok) {
        console.error("Failed to refresh token. Logging out.");
        logoutUser();
        return;
      }

      const data = await response.json();
      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
      console.log("Token refreshed successfully.");
    } catch (error) {
      console.error("Error refreshing token:", error);
      logoutUser();
    } finally {
      setLoading(false);
      setTokenRefreshed(true);
    }
  }, [authTokens, logoutUser]);
  const registerUser = useCallback(async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auths/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      console.log("API Response:", data);

      if (!response.ok) {
        return {
          success: false,
          errors:
            typeof data === "object"
              ? data
              : { detail: "Registration failed." },
          status: response.status, // Optional: return status for UI logic
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Registration Error:", error);
      return {
        success: false,
        errors: { detail: "An unexpected error occurred. Please try again." },
      };
    }
  }, []);

  useEffect(() => {
    const storedTokens = localStorage.getItem("authTokens");
    if (storedTokens && !authTokens) {
      setAuthTokens(JSON.parse(storedTokens));
    }

    if (!authTokens) {
      setLoading(false);
      setTokenRefreshed(true);
      return;
    }

    if (loading) {
      updateToken();
    }

    const interval = setInterval(updateToken, 240000);
    return () => clearInterval(interval);
  }, [authTokens, loading, updateToken]);

  if (loading || !tokenRefreshed) {
    return <div>Loading...</div>;
  }

  let contextData = {
    loginUser,
    logoutUser,
    authTokens,
    user,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};
