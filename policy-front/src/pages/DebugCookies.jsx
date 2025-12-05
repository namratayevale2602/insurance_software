import React from "react";
import useAuthStore from "../store/authStore";

const CookieDebug = () => {
  const { debugState } = useAuthStore();

  const checkCookies = () => {
    const cookies = document.cookie.split(";");
    const accessToken = cookies.find((cookie) =>
      cookie.trim().startsWith("access_token=")
    );
    const refreshToken = cookies.find((cookie) =>
      cookie.trim().startsWith("refresh_token=")
    );
    const xsrfToken = cookies.find((cookie) =>
      cookie.trim().startsWith("XSRF-TOKEN=")
    );

    return {
      accessToken: accessToken ? "✅ Present" : "❌ Missing",
      refreshToken: refreshToken ? "✅ Present" : "❌ Missing",
      xsrfToken: xsrfToken ? "✅ Present" : "❌ Missing",
      allCookies: document.cookie || "No cookies",
    };
  };

  const cookieStatus = checkCookies();
  const state = debugState();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-md max-h-64 overflow-auto">
      <h3 className="font-bold mb-2 text-yellow-400">🍪 Debug Panel</h3>

      <div className="space-y-2">
        <div>
          <span className="font-medium">Auth State:</span>
          <span
            className={
              state.isAuthenticated
                ? "text-green-400 ml-2"
                : "text-red-400 ml-2"
            }
          >
            {state.isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </span>
        </div>

        <div>
          <span className="font-medium">CSRF:</span>
          <span
            className={
              state.csrfInitialized
                ? "text-green-400 ml-2"
                : "text-red-400 ml-2"
            }
          >
            {state.csrfInitialized ? "Initialized" : "Not Initialized"}
          </span>
        </div>

        <div className="border-t border-gray-700 pt-2">
          <span className="font-medium">Cookies:</span>
          <div className="mt-1 space-y-1">
            <div>Access Token: {cookieStatus.accessToken}</div>
            <div>Refresh Token: {cookieStatus.refreshToken}</div>
            <div>XSRF Token: {cookieStatus.xsrfToken}</div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-2">
          <span className="font-medium">User:</span>
          <div className="mt-1 truncate">
            {state.user ? state.user.email : "No user"}
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          debugState();
          checkCookies();
        }}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs w-full"
      >
        Refresh Debug
      </button>
    </div>
  );
};

export default CookieDebug;
