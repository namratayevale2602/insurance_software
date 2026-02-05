import React, { useState } from "react";
import { Shield, AlertCircle, X } from "lucide-react";

const PasswordConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "This action requires admin authentication.",
  type = "delete", // 'delete' or 'forceDelete'
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600 mt-1">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {type === "forceDelete" && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Permanent Deletion Warning
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    This action will permanently delete the client and all
                    associated data. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your admin password"
                autoComplete="current-password"
                disabled={loading}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  type === "forceDelete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-orange-600 hover:bg-orange-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verifying...
                  </div>
                ) : type === "forceDelete" ? (
                  "Permanently Delete"
                ) : (
                  "Soft Delete"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordConfirmModal;
