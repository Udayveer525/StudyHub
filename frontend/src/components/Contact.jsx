// src/components/Contact.jsx
// Landing page section — redirects to the full /contact page
import React from "react";
import { Link } from "react-router-dom";
import { FileUp, Bug, HelpCircle, ArrowRight, CheckCircle } from "lucide-react";

const HIGHLIGHTS = [
  { icon: FileUp, text: "Share notes, PYQs, and study links" },
  { icon: Bug, text: "Report bugs or platform issues" },
  { icon: HelpCircle, text: "Ask anything about StudyHub" },
];

export default function Contact() {
  return (
    <section className="bg-background-light py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-brand-deep shadow-2xl md:grid md:grid-cols-2">
          {/* Left: Info */}
          <div className="relative p-10 text-white md:p-14">
            <div className="absolute left-0 top-0 h-32 w-32 rounded-br-full bg-white/10 blur-2xl" />
            <h2 className="mb-4 text-3xl font-extrabold leading-tight">
              Share Resources. <br /> Help your classmates.
            </h2>
            <p className="mb-8 text-blue-100 opacity-90 leading-relaxed">
              Help grow StudyHub — share notes, PYQs, or useful links. Report
              bugs, or just reach out. Every contribution makes the platform
              better for everyone.
            </p>
            <ul className="space-y-4 text-sm font-medium text-blue-100">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-brand-accent" />
                  {text}
                </li>
              ))}
            </ul>
            <div className="mt-12 text-xs text-white/40">
              All submissions are moderated for quality. No copyrighted
              material.
            </div>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col items-center justify-center bg-white p-10 text-center md:p-14">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/10 border border-brand-accent/20">
              <FileUp className="h-8 w-8 text-brand-accent" />
            </div>
            <h3 className="text-2xl font-extrabold text-brand-deep mb-3">
              Got something to share?
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs">
              Use our submission form to contribute resources, report issues, or
              send us a message. It only takes a minute.
            </p>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-deep px-8 py-4 text-sm font-bold text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-brand-mid hover:shadow-xl"
            >
              Open Contact Form
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-6 text-xs text-gray-400">
              We review submissions within 24–48 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
