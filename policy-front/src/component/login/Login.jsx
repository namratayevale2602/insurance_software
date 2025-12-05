// src/component/login/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaKey } from "react-icons/fa";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Login page - isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      console.log("Redirecting to home from login page");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear error when form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData.email, formData.password, clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login form submitted");
    console.log("Cookies before login:", document.cookie);

    const result = await login(formData);
    console.log("Login result:", result);
    console.log("Cookies after login:", document.cookie);

    if (result.success) {
      navigate("/", { replace: true });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Glass Morphism Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-black/20 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-black">Welcome Back</h2>
            <p className="mt-2 text-sm text-black/80">
              Sign in to your account to continue
            </p>
          </div>

          {/* Debug Info */}
          <div className="mt-4 p-2 bg-yellow-100 rounded text-xs">
            <p>Debug: isAuthenticated = {isAuthenticated.toString()}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div className="group">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-black/50 group-focus-within:text-black/20 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-black/10 rounded-2xl text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-black/50 group-focus-within:text-black/20 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-12 pr-12 py-4 bg-white/5 border border-black/10 rounded-2xl text-black placeholder-black/60 focus:outline-none focus:ring-2 focus:ring-black/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center group/toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-all duration-300 group-hover/toggle:scale-105">
                      {showPassword ? (
                        <>
                          <FaEyeSlash className="h-4 w-4 text-black/80" />
                          <span className="text-xs text-black/80 font-medium hidden sm:inline">
                            Hide
                          </span>
                        </>
                      ) : (
                        <>
                          <FaEye className="h-4 w-4 text-black/80" />
                          <span className="text-xs text-black/80 font-medium hidden sm:inline">
                            Show
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-black border-black/30 rounded bg-black/10"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-black/80"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-black hover:text-black/80 transition duration-300 flex items-center"
                >
                  <FaKey className="mr-1 h-3 w-3" />
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300 transform ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign in to your account"
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-black/80">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-black hover:text-black/80 transition duration-300"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
