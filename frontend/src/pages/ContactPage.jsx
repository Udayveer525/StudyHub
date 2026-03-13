// src/pages/Contact.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  MessageSquare, 
  Bug, 
  FileUp, 
  HelpCircle,
  Paperclip,
  Send,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

const CATEGORIES = [
  { id: "resource", label: "Share a Resource", icon: FileUp, desc: "Upload notes or PYQs" },
  { id: "bug", label: "Report a Bug", icon: Bug, desc: "Found a glitch? Let us know" },
  { id: "query", label: "General Query", icon: HelpCircle, desc: "Questions about StudyHub" },
];

export default function Contact() {
  const { user } = useAuth();
  
  // Form State
  const [category, setCategory] = useState("query");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  
  // Submission State
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  // Pre-fill if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);
      if (file) formData.append("attachment", file);

      // Using the token if it exists so the backend can link the user_id
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers, // Do NOT set Content-Type to application/json when using FormData!
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to send message. Please try again.");
      
      setStatus("success");
      setMessage("");
      setFile(null);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-background-light py-12 font-sans text-brand-deep">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand-accent">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* LEFT: Info & Categories */}
          <div className="lg:col-span-1">
            <h1 className="text-4xl font-extrabold text-brand-deep mb-4">Get in touch</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether you want to share a brilliant set of notes, report a glitch in the matrix, or just say hi—we are all ears.
            </p>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">How can we help?</h3>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all ${
                      isActive 
                        ? "bg-white shadow-md ring-2 ring-brand-accent" 
                        : "bg-gray-50 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className={`rounded-lg p-2.5 ${isActive ? "bg-brand-accent text-white" : "bg-white text-gray-500 shadow-sm"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isActive ? "text-brand-deep" : "text-gray-700"}`}>{cat.label}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-6">
               <div className="flex items-center gap-3 mb-2">
                 <MessageSquare className="h-5 w-5 text-brand-accent" />
                 <h4 className="font-bold text-brand-deep">Community First</h4>
               </div>
               <p className="text-sm text-gray-600">
                 StudyHub is maintained by students. We usually review submissions and respond within 24-48 hours.
               </p>
            </div>
          </div>

          {/* RIGHT: The Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl2 border border-gray-100 bg-white p-8 shadow-soft md:p-10">
              
              {status === "success" ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                   <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                      <CheckCircle className="h-10 w-10" />
                   </div>
                   <h2 className="text-2xl font-bold text-brand-deep">Message Received!</h2>
                   <p className="mt-3 max-w-md text-gray-600">
                     Thanks for reaching out. Your ticket has been logged in our system and our moderation team will review it shortly.
                   </p>
                   <button 
                     onClick={() => setStatus("idle")}
                     className="mt-8 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-600 hover:bg-gray-50"
                   >
                     Send another message
                   </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {status === "error" && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Your Name</label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-colors focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Email Address</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-colors focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                        placeholder="john@university.edu"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      {category === "resource" ? "Resource Description" : category === "bug" ? "Bug Details" : "Your Message"}
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-colors focus:border-brand-accent focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-accent/10"
                      placeholder={
                        category === "resource" ? "What subject is this for? Which semester?" : 
                        category === "bug" ? "How can we reproduce the error?" : 
                        "How can we help you today?"
                      }
                    />
                  </div>

                  {/* Attachment Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Attachments (Optional)
                    </label>
                    <div className="relative">
                       <input 
                         type="file"
                         onChange={(e) => setFile(e.target.files[0])}
                         className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                         accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                       />
                       <div className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-sm font-bold transition-colors ${
                          file ? "border-brand-accent bg-brand-accent/5 text-brand-accent" : "border-gray-300 bg-gray-50 text-gray-500 hover:border-brand-accent hover:bg-white hover:text-brand-accent"
                       }`}>
                          {file ? (
                            <>
                              <CheckCircle className="h-5 w-5" />
                              {file.name}
                            </>
                          ) : (
                            <>
                              <Paperclip className="h-5 w-5" />
                              Drag and drop or click to upload
                            </>
                          )}
                       </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">Max file size: 10MB. Accepted formats: PDF, DOCX, Images.</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      disabled={status === "loading"}
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-4 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:bg-brand-mid hover:shadow-xl disabled:opacity-70 sm:w-auto sm:px-10"
                    >
                      {status === "loading" ? "Sending..." : "Submit Ticket"}
                      {status !== "loading" && <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}