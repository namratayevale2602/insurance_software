import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Create main API instance
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // CRITICAL for cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Create CSRF-specific instance
const csrfApi = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    console.log("🔄 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
    });
    console.log("🍪 Current Cookies:", document.cookie);
    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response Success:", {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("❌ API Response Error:", {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
    });

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 Attempting token refresh...");

      // Prevent infinite loops
      originalRequest._retry = true;

      try {
        // Call refresh endpoint
        await api.post("/refresh");

        console.log("✅ Token refreshed, retrying original request");

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // If refresh fails, clear auth state
        useAuthStore.getState().logout();

        // Redirect to login if not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Cookie status checker
const checkCookieStatus = () => {
  const cookies = document.cookie.split(";");
  const accessToken = cookies.find((cookie) =>
    cookie.trim().startsWith("access_token=")
  );
  const refreshToken = cookies.find((cookie) =>
    cookie.trim().startsWith("refresh_token=")
  );

  console.log("🔍 Cookie Status Check:", {
    accessToken: accessToken ? "✅ Present" : "❌ Missing",
    refreshToken: refreshToken ? "✅ Present" : "❌ Missing",
    allCookies: document.cookie || "No cookies found",
  });

  return { accessToken: !!accessToken, refreshToken: !!refreshToken };
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      csrfInitialized: false,

      // Initialize CSRF protection
      initializeCSRF: async () => {
        try {
          console.log("🛡️ Initializing CSRF protection...");

          const response = await csrfApi.get("/sanctum/csrf-cookie");
          console.log("✅ CSRF protection initialized", {
            status: response.status,
            headers: response.headers,
          });

          set({ csrfInitialized: true });
          return true;
        } catch (error) {
          console.error("❌ CSRF initialization failed:", error);
          set({ csrfInitialized: false });
          return false;
        }
      },

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log("🔐 Starting login process...", {
            email: credentials.email,
          });

          // Check initial cookie status
          checkCookieStatus();

          // Step 1: Initialize CSRF protection
          console.log("🛡️ Step 1: Initializing CSRF...");
          const csrfSuccess = await get().initializeCSRF();
          if (!csrfSuccess) {
            throw new Error("CSRF initialization failed");
          }

          // Step 2: Perform login
          console.log("🔐 Step 2: Performing login...");
          const response = await api.post("/login", credentials);
          console.log("✅ Login API response received", response.data);

          // Step 3: Store user data
          console.log("💾 Step 3: Storing user data...");
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Step 4: Verify cookies were set
          console.log("🔍 Step 4: Verifying cookies...");
          setTimeout(() => {
            checkCookieStatus();
          }, 200);

          return { success: true, data: response.data };
        } catch (error) {
          console.error("❌ Login process failed:", error);

          let errorMessage = "Login failed. Please try again.";

          if (error.response?.status === 401) {
            errorMessage = "Invalid email or password";
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });

          return { success: false, error: errorMessage };
        }
      },

      // Check authentication status
      checkAuth: async () => {
        try {
          console.log("🔍 Checking authentication status...");
          checkCookieStatus();

          const response = await api.get("/check-auth");
          console.log("🔍 Auth check response:", response.data);

          if (response.data.authenticated) {
            set({
              user: response.data.user,
              isAuthenticated: true,
            });
            console.log("✅ User is authenticated:", response.data.user.email);
            return { authenticated: true, user: response.data.user };
          } else {
            set({
              user: null,
              isAuthenticated: false,
            });
            console.log("❌ User is not authenticated");
            return { authenticated: false };
          }
        } catch (error) {
          console.error("❌ Auth check failed:", error);
          set({
            user: null,
            isAuthenticated: false,
          });
          return { authenticated: false };
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          console.log("🚪 Logging out...");
          await api.post("/logout");
          console.log("✅ Logout successful");
        } catch (error) {
          console.error("❌ Logout error:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          console.log("🧹 Local state cleared");
        }
      },

      clearError: () => set({ error: null }),

      // Debug method to check current state
      debugState: () => {
        const state = get();
        console.log("🐛 Auth Store Debug:", {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isLoading: state.isLoading,
          csrfInitialized: state.csrfInitialized,
          cookies: document.cookie,
        });
        return state;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        csrfInitialized: state.csrfInitialized,
      }),
    }
  )
);

export default useAuthStore;
