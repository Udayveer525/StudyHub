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
import ScrollToTop from "./components/ScrollToTop";

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
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminReports from "./pages/admin/AdminReports";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminSyllabus from "./pages/admin/AdminSyllabus";
import OlliePage from "./pages/ollie/OlliePage";

// Main app shell — renders Navbar above all student-facing pages
function MainLayout() {
  return (
    <div className="min-h-screen bg-background-light font-sans text-slate-800 selection:bg-brand-accent/20 selection:text-brand-deep">
      <ScrollToTop />
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
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/questions" element={<Questions />} />
        <Route
          path="/questions/ask"
          element={
            <ProtectedRoute>
              <AskQuestion />
            </ProtectedRoute>
          }
        />
        <Route path="/questions/:id" element={<QuestionThread />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <OlliePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Admin panel — fully isolated, no Navbar/Footer */}
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
        <Route path="syllabus" element={<AdminSyllabus />} />
      </Route>

      {/* All student-facing routes under MainLayout */}
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
}
