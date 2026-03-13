// src/pages/Terms.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Scale, Users, FileCheck, AlertTriangle, ArrowLeft } from "lucide-react";

export default function Terms() {
  const lastUpdated = "March 15, 2026";

  return (
    <div className="min-h-screen bg-background-light py-12 font-sans text-brand-deep">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-brand-accent transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-brand-deep">Terms of Service</h1>
          <p className="mt-2 text-brand-mid/80">Last updated: {lastUpdated}</p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar / Table of Contents */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24 rounded-xl2 bg-white p-6 shadow-soft border border-gray-100">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">Contents</h3>
              <nav className="space-y-3 text-sm font-semibold text-gray-600">
                <a href="#acceptance" className="block hover:text-brand-accent">1. Acceptance of Terms</a>
                <a href="#conduct" className="block hover:text-brand-accent">2. User Conduct</a>
                <a href="#content" className="block hover:text-brand-accent">3. User-Generated Content</a>
                <a href="#disclaimer" className="block hover:text-brand-accent">4. Disclaimers</a>
              </nav>
            </div>
          </div>

          {/* Main Document Content */}
          <div className="flex-1 rounded-xl2 bg-white p-8 shadow-soft border border-gray-100 md:p-12">
            <div className="prose prose-blue max-w-none text-gray-600">
              
              <p className="lead text-lg font-medium text-brand-mid mb-8">
                Welcome to StudyHub. By accessing our platform, you agree to abide by these terms, designed to keep our academic community safe, helpful, and respectful.
              </p>

              <section id="acceptance" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-brand-accent"><Scale className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">1. Acceptance of Terms</h2>
                </div>
                <p>
                  By creating an account or accessing the resources on StudyHub, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                </p>
              </section>

              <section id="conduct" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><Users className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">2. User Conduct</h2>
                </div>
                <p>To ensure a positive environment for all learners, you agree NOT to:</p>
                <ul className="list-disc pl-5 space-y-2 mt-3">
                  <li>Post spam, irrelevant links, or promotional material in the Q&A forum.</li>
                  <li>Use abusive, harassing, or offensive language toward other students.</li>
                  <li>Attempt to disrupt the platform's servers or networks.</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to suspend or terminate accounts that violate these community guidelines without prior notice.
                </p>
              </section>

              <section id="content" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-purple-50 p-2 text-purple-600"><FileCheck className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">3. User-Generated Content & Copyright</h2>
                </div>
                <p>
                  StudyHub relies on community contributions. When uploading notes, PYQs, or answering questions:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-3">
                  <li><strong>Ownership:</strong> You retain ownership of your original content, but grant StudyHub a license to display and distribute it on the platform.</li>
                  <li><strong>Copyright:</strong> You must <strong>strictly not</strong> upload copyrighted textbooks, commercial study guides, or material you do not have permission to share.</li>
                  <li><strong>Moderation:</strong> All uploads are subject to review. We will remove any material that violates copyright claims.</li>
                </ul>
              </section>

              <section id="disclaimer" className="mb-10 scroll-mt-28">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-orange-50 p-2 text-accent-orange"><AlertTriangle className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-brand-deep m-0">4. Disclaimers</h2>
                </div>
                <p>
                  StudyHub is an academic project provided on an "AS IS" and "AS AVAILABLE" basis. While we strive to ensure the accuracy of the Q&A forum and study materials, we do not guarantee that all information is completely accurate or up-to-date with your specific university syllabus. Your exam preparation is ultimately your own responsibility.
                </p>
              </section>

              <hr className="my-8 border-gray-100" />
              
              <p className="text-sm">
                For inquiries regarding these terms, please <Link to="/contact" className="text-brand-accent hover:underline">contact the development team</Link>.
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}