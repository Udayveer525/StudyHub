// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts & Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Questions from "./pages/Questions";
import AskQuestion from "./pages/AskQuestion";
import QuestionThread from "./pages/QuestionThread";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ContactPage from "./pages/ContactPage";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminReports from "./pages/admin/AdminReports";
import AdminSubmissions from "./pages/admin/AdminSubmissions";

export default function App() {
  return (
    <Routes>
      {/* Admin Panel — completely isolated, no Navbar/Footer */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="submissions" element={<AdminSubmissions />} />
      </Route>

      {/* Main App — with Navbar */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen bg-background-light font-sans text-slate-800 selection:bg-brand-accent/20 selection:text-brand-deep">
            <Navbar />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <Features />
                    <Contact />
                    <Footer />
                  </>
                }
              />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/questions/:id" element={<QuestionThread />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions/ask"
                element={
                  <ProtectedRoute>
                    <AskQuestion />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        }
      />
    </Routes>
  );
}
