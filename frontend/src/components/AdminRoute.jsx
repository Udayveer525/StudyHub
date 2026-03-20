// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldOff } from "lucide-react";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="h-4 w-4 rounded-full border-2 border-gray-600 border-t-brand-accent animate-spin" />
          <span className="text-sm font-mono">Verifying access...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <ShieldOff className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm mb-6">
            You don't have permission to access this area.
          </p>
          <a
            href="/"
            className="text-xs font-mono text-brand-accent hover:underline"
          >
            ← Return to StudyHub
          </a>
        </div>
      </div>
    );
  }

  return children;
}