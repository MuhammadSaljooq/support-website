"use client";

import { Stethoscope, Headphones, HardHat, Building2, Users, Zap } from "lucide-react";

const sectors = [
  {
    icon: Stethoscope,
    title: "Medical & Healthcare",
    description: "Handle patient inquiries, appointment scheduling, prescription refills, and triage calls. HIPAA-compliant and trained on medical terminology.",
    features: [
      "Patient appointment scheduling",
      "Prescription refill requests",
      "Symptom triage and routing",
      "Insurance verification",
      "HIPAA compliant",
    ],
    color: "from-red-500 to-pink-600",
    bgColor: "from-red-50 to-pink-50",
    darkBgColor: "from-red-900/20 to-pink-900/20",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description: "24/7 customer service that never sleeps. Handle product inquiries, troubleshooting, returns, and escalations with natural conversations.",
    features: [
      "Product information & FAQs",
      "Technical troubleshooting",
      "Order status & tracking",
      "Return & refund processing",
      "Multi-channel support",
    ],
    color: "from-blue-500 to-cyan-600",
    bgColor: "from-blue-50 to-cyan-50",
    darkBgColor: "from-blue-900/20 to-cyan-900/20",
  },
  {
    icon: HardHat,
    title: "Construction & Contracting",
    description: "Manage project inquiries, quote requests, scheduling, and client communications. Trained on construction terminology and processes.",
    features: [
      "Project quote requests",
      "Service scheduling",
      "Material inquiries",
      "Project status updates",
      "Emergency dispatch",
    ],
    color: "from-amber-500 to-orange-600",
    bgColor: "from-amber-50 to-orange-50",
    darkBgColor: "from-amber-900/20 to-orange-900/20",
  },
  {
    icon: Building2,
    title: "Real Estate",
    description: "Handle property inquiries, schedule viewings, answer questions about listings, and qualify leads before connecting with agents.",
    features: [
      "Property inquiries",
      "Viewing appointments",
      "Neighborhood information",
      "Mortgage pre-qualification",
      "Lead qualification",
    ],
    color: "from-purple-500 to-indigo-600",
    bgColor: "from-purple-50 to-indigo-50",
    darkBgColor: "from-purple-900/20 to-indigo-900/20",
  },
  {
    icon: Users,
    title: "Legal Services",
    description: "Client intake, consultation scheduling, case status updates, and initial legal guidance. Trained on legal terminology and procedures.",
    features: [
      "Client intake forms",
      "Consultation scheduling",
      "Case status inquiries",
      "Document requests",
      "Confidential & secure",
    ],
    color: "from-slate-500 to-gray-600",
    bgColor: "from-slate-50 to-gray-50",
    darkBgColor: "from-slate-900/20 to-gray-900/20",
  },
  {
    icon: Zap,
    title: "Any Industry",
    description: "Our AI voice agent can be trained for any field. Finance, education, retail, hospitality - customize it for your specific needs.",
    features: [
      "Fully customizable",
      "Industry-specific training",
      "Custom integrations",
      "White-label options",
      "Dedicated support",
    ],
    color: "from-green-500 to-emerald-600",
    bgColor: "from-green-50 to-emerald-50",
    darkBgColor: "from-green-900/20 to-emerald-900/20",
  },
];

export function Sectors() {
  return (
    <section id="sectors" className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Trained for Every Industry
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Our AI voice agent adapts to your field, learning your terminology, processes, and customer needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectors.map((sector, index) => {
            const Icon = sector.icon;
            return (
              <div
                key={sector.title}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sector.darkBgColor} dark:bg-gradient-to-br ${sector.darkBgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${sector.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                    {sector.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {sector.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {sector.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${sector.color} mt-2 flex-shrink-0`} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h3 className="text-2xl font-bold mb-3">Ready to Transform Your Call Handling?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl">
              Join thousands of businesses worldwide using our AI voice agent to provide exceptional customer service 24/7
            </p>
            <a
              href="/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

