// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-xl text-brand-deep">
              <div className="h-10 w-10 ">
                <img
                  src="/owl-icon.png"
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-brand-deep">
                Study<span className="text-brand-accent">Hub</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Built by students, for students. <br />
              Making academic success accessible to everyone.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-brand-deep mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/resources" className="hover:text-brand-accent">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/questions" className="hover:text-brand-accent">
                  Discussion Forum
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-accent">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-brand-deep mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/contact" className="hover:text-brand-accent">
                  Contribute Notes
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-accent">
                  Report Issue
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-accent">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Copyright */}
          <div>
            <h4 className="font-bold text-brand-deep mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link to="/privacy" className="hover:text-brand-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-accent">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
          <p>&copy; {currentYear} StudyHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
