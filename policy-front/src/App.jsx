// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/home/Home";
import Login from "./component/login/Login";
import ProtectedRoute from "./component/ProtectedRoute";
import useAuthStore from "./store/authStore";
import CookieDebug from "./pages/DebugCookies";
// clients import
import Clients from "./pages/client/Clients";
import ClientProfile from "./pages/client/ClientProfile";
import ClientForm from "./pages/client/ClientForm";
import GicForm from "./pages/gic/GicForm";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />

        {/* clients path  */}
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/profile/:clientId" element={<ClientProfile />} />
        <Route path="/clients/create" element={<ClientForm mode="create" />} />
        <Route
          path="/clients/edit/:clientId"
          element={<ClientForm mode="edit" />}
        />

        {/* GIC Path  */}
        <Route path="/gic-entries/create" element={<GicForm />} />
      </Route>
    </>
  )
);

function App() {
  const { initializeCSRF, debugState } = useAuthStore();
  const [appLoading, setAppLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      console.log("🚀 Initializing application...");

      try {
        // Initialize CSRF protection
        console.log("🛡️ Initializing CSRF protection...");
        const csrfSuccess = await initializeCSRF();

        if (!csrfSuccess) {
          throw new Error("Failed to initialize CSRF protection");
        }

        console.log("✅ App initialization complete");
        setAppLoading(false);
      } catch (error) {
        console.error("❌ App initialization failed:", error);
        setInitError(error.message);
        setAppLoading(false);
      }
    };

    initializeApp();
  }, [initializeCSRF]);

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Initializing app...</p>
        <p className="text-sm text-gray-500 mt-2">Setting up security</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold text-lg mb-2">Initialization Error</h2>
          <p>{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      {/* Add debug component in development */}
      {/* {process.env.NODE_ENV === "development" && <CookieDebug />} */}
    </>
  );
}

export default App;
