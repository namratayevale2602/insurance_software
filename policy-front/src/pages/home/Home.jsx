// src/pages/home/Home.jsx
import React, { useEffect } from "react";
import useAuthStore from "../../store/authStore";

const Home = () => {
  const { user, logout, checkAuth, isAuthenticated, isLoading } =
    useAuthStore();

  // Check authentication status if user data is missing
  useEffect(() => {
    const fetchUserIfNeeded = async () => {
      // If user is authenticated but user data is missing, check auth status
      if (isAuthenticated && !user) {
        try {
          await checkAuth();
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUserIfNeeded();
  }, [user, isAuthenticated, checkAuth]);

  const handleLogout = async () => {
    await logout();
  };

  // Show loading state when fetching user data
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
                <p className="text-gray-600 mt-2">
                  Loading your information...
                </p>
              </div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl">
              <p className="text-yellow-700 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Loading user information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Not Authenticated
              </h1>
              <p className="text-gray-600 mb-6">
                Please log in to access your dashboard.
              </p>
              <div className="bg-red-50 p-6 rounded-xl">
                <p className="text-red-700">
                  You are not currently authenticated. Redirecting to login...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600 mt-2">
                Your authentication is working perfectly!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition duration-300"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-indigo-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                User Information
              </h2>
              <div className="space-y-3">
                <p>
                  <strong>ID:</strong> {user?.id}
                </p>
                <p>
                  <strong>Name:</strong> {user?.name}
                </p>
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Role:</strong>
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-green-900 mb-4">
                Security Status
              </h2>
              <div className="space-y-3">
                <p className="text-green-700 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  ✅ Secure authentication
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Tokens:</strong> HTTP-only cookies
                </p>
                <p className="text-sm text-gray-600">
                  <strong>User Data:</strong> Memory only (not in localStorage)
                </p>
              </div>
            </div>
          </div>

          {/* Security Info Section */}
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Enhanced Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-600">
                  ✅ No user data in localStorage
                </p>
                <p className="text-green-600">✅ Tokens in HTTP-only cookies</p>
              </div>
              <div>
                <p className="text-green-600">✅ User data fetched on demand</p>
                <p className="text-green-600">✅ Protected against XSS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
