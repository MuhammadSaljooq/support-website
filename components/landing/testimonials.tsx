"use client";

import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Dr. Sarah Chen",
    role: "Medical Director",
    company: "Metro Health Clinic",
    location: "New York, USA",
    image: "SC",
    rating: 5,
    text: "Our AI voice agent handles 80% of patient calls now. It schedules appointments, answers medication questions, and routes urgent cases perfectly. Our staff can focus on patient care instead of phone calls.",
    sector: "Medical",
  },
  {
    name: "James Mitchell",
    role: "CEO",
    company: "TechSupport Pro",
    location: "London, UK",
    image: "JM",
    rating: 5,
    text: "We serve clients across 12 time zones. The voice agent never sleeps and handles technical support calls flawlessly. Customer satisfaction increased by 40% since we deployed it.",
    sector: "Support",
  },
  {
    name: "Maria Rodriguez",
    role: "Operations Manager",
    company: "Premier Construction Co.",
    location: "Madrid, Spain",
    image: "MR",
    rating: 5,
    text: "Our construction business gets calls at all hours. The AI agent schedules site visits, provides quotes, and handles emergency calls. It understands construction terminology perfectly.",
    sector: "Construction",
  },
  {
    name: "David Kim",
    role: "Founder",
    company: "LegalEase Solutions",
    location: "Seoul, South Korea",
    image: "DK",
    rating: 5,
    text: "Client intake used to take hours. Now our voice agent handles initial consultations, schedules meetings, and qualifies leads. We've doubled our client capacity without hiring more staff.",
    sector: "Legal",
  },
  {
    name: "Emma Thompson",
    role: "Customer Success Director",
    company: "Global Retail Group",
    location: "Sydney, Australia",
    image: "ET",
    rating: 5,
    text: "24/7 customer support across multiple countries. The voice agent speaks multiple languages and handles everything from product inquiries to returns. Our international customers love it.",
    sector: "Retail",
  },
  {
    name: "Ahmed Hassan",
    role: "Property Manager",
    company: "Luxury Real Estate Dubai",
    location: "Dubai, UAE",
    image: "AH",
    rating: 5,
    text: "Property inquiries come in constantly. Our AI agent answers questions about listings, schedules viewings, and qualifies buyers. We never miss a potential sale, even at 2 AM.",
    sector: "Real Estate",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            Trusted by Businesses Worldwide
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            See how companies across industries are transforming their customer service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 h-12 w-12 text-blue-200 dark:text-blue-900/30" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial text */}
              <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author info */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                    {testimonial.image}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {testimonial.role}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {testimonial.company} • {testimonial.location}
                  </div>
                </div>
              </div>

              {/* Sector badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {testimonial.sector}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
            <div className="text-slate-600 dark:text-slate-400">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50M+</div>
            <div className="text-slate-600 dark:text-slate-400">Calls Handled</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">150+</div>
            <div className="text-slate-600 dark:text-slate-400">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">99.9%</div>
            <div className="text-slate-600 dark:text-slate-400">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}

