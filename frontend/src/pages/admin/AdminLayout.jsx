// src/pages/admin/AdminLayout.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Flag,
  Inbox,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/admin",
    end: true,
    icon: LayoutDashboard,
    label: "Overview",
    description: "Stats & summary",
  },
  {
    to: "/admin/reports",
    icon: Flag,
    label: "Reports",
    description: "Flagged content",
  },
  {
    to: "/admin/submissions",
    icon: Inbox,
    label: "Submissions",
    description: "Contact inbox",
  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
      isActive
        ? "bg-white/10 text-white"
        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
    }`;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent/20 border border-brand-accent/30">
          <Shield className="h-4 w-4 text-brand-accent" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-wide">
            StudyHub
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-brand-accent">
            Admin Panel
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        <div className="mb-3 px-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-600">
            Navigation
          </span>
        </div>
        {NAV_ITEMS.map(({ to, end, icon: Icon, label, description }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={navLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                    isActive
                      ? "bg-brand-accent/20 text-brand-accent"
                      : "bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`font-semibold leading-none ${isActive ? "text-white" : ""}`}
                  >
                    {label}
                  </div>
                  <div className="mt-0.5 text-[11px] text-gray-600">
                    {description}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user + logout */}
      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent/20 text-[11px] font-bold text-brand-accent">
            {user?.name?.charAt(0) ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-gray-200">
              {user?.name ?? "Admin"}
            </div>
            <div className="text-[10px] text-gray-500">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
        <a
          href="/"
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:text-gray-400"
        >
          ← Back to StudyHub
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-950 font-sans overflow-hidden">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-gray-900 lg:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-56 border-r border-white/10 bg-gray-900">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="flex items-center justify-between border-b border-white/10 bg-gray-900 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-accent" />
            <span className="text-sm font-bold text-white">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </header>

        {/* Page Content (scrollable) */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}