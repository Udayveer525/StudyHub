// src/components/Contact.jsx
import React, { useState } from "react";
import { Send, UploadCloud, CheckCircle, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");

    try {
      // Simulation of API call
      await new Promise(r => setTimeout(r, 1000));
      // Fallback logic preserved from your original code
      throw new Error("submission endpoint not available");
    } catch (err) {
      const subject = encodeURIComponent("StudyHub Submission");
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      window.location.href = `mailto:studyhub@example.com?subject=${subject}&body=${body}`;
      setStatus("mailto");
    }
  }

  return (
    <section className="bg-background-light py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-brand-deep shadow-2xl md:grid md:grid-cols-2">
          
          {/* Left: Info Side */}
          <div className="relative p-10 text-white md:p-14">
            <div className="absolute left-0 top-0 h-32 w-32 rounded-br-full bg-white/10 blur-2xl"></div>
            
            <h2 className="mb-6 text-3xl font-extrabold leading-tight">
              Share Resources. <br /> Help your classmates.
            </h2>
            <p className="mb-8 text-blue-100 opacity-90">
              Help grow StudyHub — share what helped you. If you have <span className="font-medium"> notes, solved PYQs, ebooks (your own), or links to
              useful study materials</span>, please share them. By sharing what you know, you're not only enriching your peers' 
              education but also helping to build a supportive, knowledge-sharing network. <span className="font-medium">Knowledge truly grows when 
              shared, so let's uplift each other and create a community where every student has the tools to succeed!</span>
            </p>

            <ul className="space-y-4 text-sm font-medium text-blue-100">
               <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-accent" />
                  We accept PDF, DOCX, and Links.
               </li>
               <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-accent" />
                  All uploads are moderated for quality.
               </li>
               <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-brand-accent" />
                  No copyrighted material allowed.
               </li>
            </ul>

            <div className="mt-12 text-xs text-white/40">
               Need help? <Link to="/terms" className="underline hover:text-white">Read Guidelines</Link>
            </div>
          </div>

          {/* Right: Form Side */}
          <div className="bg-white p-10 md:p-14">
             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Your Name</label>
                   <input 
                     value={name} onChange={e => setName(e.target.value)} required 
                     className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none"
                     placeholder="John Doe"
                   />
                </div>
                <div>
                   <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Email Address</label>
                   <input 
                     value={email} onChange={e => setEmail(e.target.value)} required type="email"
                     className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none"
                     placeholder="john@college.edu"
                   />
                </div>
                <div>
                   <label className="mb-1 block text-xs font-bold uppercase text-gray-500">Description</label>
                   <textarea 
                     value={message} onChange={e => setMessage(e.target.value)} required rows={3}
                     className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none"
                     placeholder="e.g. Unit 3 Notes for Data Structures"
                   />
                </div>
                
                {/* Custom File Input */}
                <div>
                   <label className="mb-2 block text-xs font-bold uppercase text-gray-500">Attachment (Optional)</label>
                   <div className="relative">
                      <input 
                         type="file"
                         accept=".pdf,.doc,.docx,.txt,.md"
                         onChange={e => setFile(e.target.files[0])}
                         className="absolute inset-0 z-10 h-full w-full opacity-0 cursor-pointer"
                      />
                      <div className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-4 text-sm font-bold text-gray-500 transition-colors hover:border-brand-accent hover:bg-white hover:text-brand-accent">
                         <UploadCloud className="h-5 w-5" />
                         {file ? file.name : "Click to Upload File"}
                      </div>
                   </div>
                </div>

                <button 
                  disabled={status === "sending"}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-deep py-3 text-sm font-bold text-white shadow-lg shadow-gray-200 transition-all hover:bg-brand-mid hover:shadow-xl disabled:opacity-70"
                >
                   {status === "sending" ? "Uploading..." : "Submit Resource"}
                   {!status && <Send className="h-4 w-4" />}
                </button>
             </form>
          </div>
        </div>
      </div>
    </section>
  );
}