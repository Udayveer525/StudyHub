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

export default function App() {
  return (
    <div className="min-h-screen bg-background-light font-sans text-slate-800 selection:bg-brand-accent/20 selection:text-brand-deep">
      <Navbar />

      <Routes>
        {/* Landing Page Route */}
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

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Public/Protected Feature Routes */}
        <Route path="/resources" element={<Resources />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionThread />} />

        {/* Strictly Protected Routes */}
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
  );
}
