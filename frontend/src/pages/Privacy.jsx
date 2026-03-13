// src/pages/Privacy.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, Lock, Database, ArrowLeft } from "lucide-react";

export default function Privacy() {
  const lastUpdated = "March 15, 2026";

  return (
    <div className="min-h-screen bg-background-light py-12 font-sans text-brand-deep">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-brand-deep">Privacy Policy</h1>
          <p className="mt-2 text-brand-mid/80">Last updated: {lastUpdated}</p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar / Table of Contents */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 rounded-xl2 bg-white p-6 shadow-soft border border-gray-100">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Contents</h3>
              <nav className="space-y-3 text-sm font-semibold text-gray-600">
                <a href="#collection" className="block hover:text-brand-accent">1. Data Collection</a>
                <a href="#usage" className="block hover:text-brand-accent">2. How We Use Data</a>
                <a href="#protection" className="block hover:text-brand-accent">3. Data Protection</a>
                <a href="#cookies" className="block hover:text-brand-accent">4. Cookies & Tracking</a>
              </nav>
            </div>
          </div>

          {/* Main Document Content */}
          <div className="flex-1 rounded-xl2 bg-white p-8 shadow-soft border border-gray-100 md:p-12">
            <div className="prose prose-blue max-w-none text-gray-600">
              
              <p className="lead text-lg font-medium text-brand-mid mb-8">
                StudyHub was built by students, for students. We believe in complete transparency regarding how your data is handled within our academic community.
              </p>

              <section id="collection" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-brand-accent"><Database className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">1. Data Collection</h2>
                </div>
                <p>We collect minimal information required to provide you with a personalized study experience:</p>
                <ul className="list-disc pl-5 space-y-2 mt-3">
                  <li><strong>Account Information:</strong> Your name and college email address when you register.</li>
                  <li><strong>Academic Preferences:</strong> Your selected university, degree, and semester to tailor resource recommendations.</li>
                  <li><strong>Contributions:</strong> Questions you ask, answers you provide, and resources you upload to the platform.</li>
                </ul>
              </section>

              <section id="usage" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Eye className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">2. How We Use Data</h2>
                </div>
                <p>Your data is strictly used to enhance your educational experience. We use your information to:</p>
                <ul className="list-disc pl-5 space-y-2 mt-3">
                  <li>Authenticate your account and maintain your session.</li>
                  <li>Display your name (or initials) next to your forum posts and resource contributions.</li>
                  <li>Track your saved materials on your personal dashboard.</li>
                </ul>
                <div className="mt-4 rounded-xl bg-gray-50 p-4 border border-gray-100 text-sm">
                  <strong>Note:</strong> We do not sell, rent, or share your personal data with any third-party advertisers. This is an academic project, not a data-mining operation.
                </div>
              </section>

              <section id="protection" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-orange-50 p-2 text-accent-orange"><Shield className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">3. Data Protection</h2>
                </div>
                <p>
                  We implement standard security measures to protect your information. Your passwords are cryptographically hashed using bcrypt before being stored in our database. We use JSON Web Tokens (JWT) to securely transmit information about your identity between the client and server.
                </p>
              </section>

              <section id="cookies" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600"><Lock className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">4. Cookies & Local Storage</h2>
                </div>
                <p>
                  StudyHub uses local storage (specifically <code>localStorage</code>) to save your authentication token. This keeps you logged in between sessions. We do not use tracking cookies or third-party analytics cookies.
                </p>
              </section>

              <hr className="my-8 border-gray-100" />
              
              <p className="text-sm">
                If you have any questions about this Privacy Policy, please <Link to="/contact" className="text-brand-accent hover:underline">contact us</Link>.
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}