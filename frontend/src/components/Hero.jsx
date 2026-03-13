// src/components/Hero.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle, Award } from "lucide-react";

const MASCOT_IMAGE = "/owl-mascot.png";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
      {/* Background Decor */}
      <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-brand-accent/10 blur-3xl"></div>
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-brand-mid/10 blur-3xl"></div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        
        {/* Left: Copy */}
        <div className="z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-accent/5 px-4 py-1.5 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-brand-accent"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-deep">For Students</span>
            <span className="flex h-2 w-2 rounded-full bg-brand-accent"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-deep">Exam Ready</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-brand-deep sm:text-6xl mb-6">
            Study Smarter. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-mid">
               Pass Confidently.
            </span>
          </h1>
          
          <p className="mb-8 text-lg leading-relaxed text-gray-600">
            Access curated notes, previous year questions (PYQs), and a community of toppers. 
            Stop searching, start studying.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-xl bg-brand-deep px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-deep/20 transition-transform hover:scale-105 hover:bg-brand-mid"
            >
              Start Learning Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/resources"
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-deep shadow-soft border border-gray-100 hover:bg-gray-50"
            >
              <BookOpen className="h-5 w-5 text-brand-accent" /> Browse Notes
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 lg:justify-start grayscale opacity-60">
             {/* Social Proof / Trust Indicators can go here later */}
             <div className="text-xs font-semibold uppercase tracking-widest text-gray-400">Trusted by students from</div>
             <div className="font-serif font-bold text-gray-500">P.U.</div>
          </div>
        </div>

        {/* Right: Visual */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-lg mt-8 lg:mt-0">
           
           {/* Decorative Glowing Orbs behind the card for depth */}
           <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-brand-accent opacity-30 blur-3xl mix-blend-multiply"></div>
           <div className="absolute -bottom-8 -left-12 h-64 w-64 rounded-full bg-accent-orange opacity-20 blur-3xl mix-blend-multiply"></div>

           {/* Main Dark Card */}
           <div className="relative z-10 overflow-hidden rounded-3xl bg-brand-deep shadow-2xl border border-white/10">
              
              {/* Subtle Tech Grid Background inside the card */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E4C75_1px,transparent_1px),linear-gradient(to_bottom,#1E4C75_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30"></div>

              <div className="relative p-8 md:p-14 text-center flex flex-col items-center justify-center min-h-[400px]">
                 
                 {/* Glowing Aura directly behind the Mascot */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 bg-brand-accent rounded-full blur-3xl opacity-20"></div>
                 
                 <img 
                   src={MASCOT_IMAGE} 
                   alt="StudyHub Mascot" 
                   className="relative z-10 mx-auto h-72 w-72 object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-500" 
                 />
                 
                 {/* Glassmorphism Floating Badge 1 (Top Left) */}
                 <div className="absolute left-4 top-1/4 -translate-y-1/2 rounded-xl bg-white/10 backdrop-blur-md p-3 shadow-2xl border border-white/20 animate-[bounce_4s_infinite]">
                    <div className="flex items-center gap-3">
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                       </div>
                       <div className="text-left">
                          <div className="text-xs font-bold text-white">DBMS Notes</div>
                          <div className="text-[10px] text-blue-200">Unlocked</div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Glassmorphism Floating Badge 2 (Bottom Right) */}
                 <div className="absolute right-4 bottom-1/4 translate-y-1/2 rounded-xl bg-white/10 backdrop-blur-md p-3 shadow-2xl border border-white/20 animate-[bounce_5s_infinite_reverse]">
                    <div className="flex items-center gap-3">
                       <div className="text-left">
                          <div className="text-xs font-bold text-white">Level Up</div>
                          <div className="text-[10px] font-medium text-accent-orange">Top Contributor</div>
                       </div>
                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-orange/20 text-accent-orange">
                          <Award className="h-4 w-4" />
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </div>
    </section>
  );
}