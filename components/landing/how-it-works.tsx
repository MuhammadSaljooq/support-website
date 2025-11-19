"use client";

import { Mic, Brain, Phone, BarChart3, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "Train Your Agent",
    description: "Upload your knowledge base, scripts, and FAQs. Our AI learns your business processes, terminology, and customer interaction patterns.",
  },
  {
    icon: Brain,
    title: "AI Learns & Adapts",
    description: "Advanced machine learning algorithms analyze your data to understand context, intent, and provide accurate responses tailored to your industry.",
  },
  {
    icon: Phone,
    title: "Handle Calls 24/7",
    description: "Your trained agent answers calls instantly, handles inquiries, schedules appointments, and escalates complex issues to human agents when needed.",
  },
  {
    icon: BarChart3,
    title: "Monitor & Improve",
    description: "Track performance metrics, review call transcripts, and continuously improve your agent's responses with real-time analytics and insights.",
  },
];

const benefits = [
  "Natural, human-like conversations",
  "Multi-language support",
  "Seamless handoff to human agents",
  "HIPAA compliant for medical use",
  "Customizable for any industry",
  "Real-time call analytics",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get your AI voice agent up and running in minutes, not months
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative group p-6 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-4 right-4 text-3xl font-bold text-slate-200 dark:text-slate-700">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 border border-blue-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100 text-center">
              Why Our Voice Agent is Amazing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

