import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Sectors } from "@/components/landing/sectors";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Home",
  description: "AI Voice Agent - Train your intelligent voice agent to handle calls in medical, support, construction, and more. 24/7 customer service automation.",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Sectors />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}

