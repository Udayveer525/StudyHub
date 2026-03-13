// src/components/Features.jsx
import React from "react";
import { 
  BookOpen, 
  MessageCircle, 
  BarChart3, 
  BrainCircuit 
} from "lucide-react";

const features = [
  {
    title: "Exam-Focused Resources",
    description: "Previous year questions, curated videos, and study material organized exactly as per your syllabus.",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Community Forum",
    description: "Ask doubts, get community-validated answers, and avoid noisy WhatsApp groups.",
    icon: MessageCircle,
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "Progress Dashboard",
    description: "Keep track of saved resources, questions asked, and answers contributed in one place.",
    icon: BarChart3,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "AI Study Buddy",
    description: "Get guided explanations, topic prioritization, and smart suggestions. (Coming Soon)",
    icon: BrainCircuit,
    color: "bg-purple-50 text-purple-600",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold text-brand-deep sm:text-4xl">
            Everything you need. <span className="text-brand-accent">Nothing you don't.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            We stripped away the clutter to focus on what actually helps you score marks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group rounded-xl2 border border-gray-100 bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-deep">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}