// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MASCOT_IMAGE = "/owl-icon.png"; // Ensure this path is correct

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkStyle = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive ? "text-brand-accent" : "text-gray-600 hover:text-brand-deep"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="relative h-10 w-10 overflow-hidden transition-transform group-hover:scale-105">
             <img src={MASCOT_IMAGE} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-deep">
            Study<span className="text-brand-accent">Hub</span>
          </span>
        </NavLink>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkStyle}>Home</NavLink>
          <NavLink to="/resources" className={navLinkStyle}>Resources</NavLink>
          <NavLink to="/questions" className={navLinkStyle}>Q&A Forum</NavLink>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-4 md:flex">
          {!user ? (
            <>
              <NavLink to="/login" className="text-sm font-bold text-gray-500 hover:text-brand-deep">
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-xl bg-brand-deep px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition-all hover:bg-brand-mid hover:scale-105 hover:shadow-blue-900/20"
              >
                Get Started
              </NavLink>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink 
                to="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-brand-accent/10 px-4 py-2 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-accent/20"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              
              <div className="h-6 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-deep text-xs font-bold text-white ring-2 ring-white">
                    {user.name ? user.name.charAt(0) : "U"}
                 </div>
                 <button 
                   onClick={() => { logout(); navigate("/"); }}
                   className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                   title="Logout"
                 >
                   <LogOut className="h-5 w-5" />
                 </button>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="absolute left-0 top-full w-full border-b border-gray-100 bg-white p-4 shadow-xl md:hidden">
          <div className="flex flex-col space-y-4">
            <NavLink to="/" onClick={() => setIsOpen(false)} className="text-sm font-bold text-gray-600">Home</NavLink>
            <NavLink to="/resources" onClick={() => setIsOpen(false)} className="text-sm font-bold text-gray-600">Resources</NavLink>
            <NavLink to="/questions" onClick={() => setIsOpen(false)} className="text-sm font-bold text-gray-600">Forum</NavLink>
            <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-bold text-brand-accent">Dashboard</NavLink>
            <div className="h-px w-full bg-gray-100"></div>
            {!user ? (
               <div className="flex flex-col gap-3">
                  <NavLink to="/login" className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-bold text-gray-700">Log in</NavLink>
                  <NavLink to="/signup" className="w-full rounded-xl bg-brand-deep py-3 text-center text-sm font-bold text-white">Get Started</NavLink>
               </div>
            ) : (
               <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600">
                  <LogOut className="h-4 w-4" /> Log Out
               </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}