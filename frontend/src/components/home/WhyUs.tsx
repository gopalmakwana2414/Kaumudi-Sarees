"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Truck, RefreshCcw, Shield, Star, Factory, Headphones } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

const FEATURES = [
  {
    icon: <Factory size={24} className="text-primary" />,
    title: "Direct from Loom",
    desc: "We manufacture every saree in our own Surat facility, eliminating middleman markup to deliver unmatched value.",
  },
  {
    icon: <Star size={24} className="text-primary" />,
    title: "Heritage Handcraft",
    desc: "Each piece is handwoven by master artisans, preserving centuries-old Indian weaving traditions.",
  },
  {
    icon: <Truck size={24} className="text-primary" />,
    title: "Complimentary Delivery",
    desc: "Enjoy free shipping pan-India on orders above ₹999, arriving securely at your doorstep in 3–7 business days.",
  },
  {
    icon: <RefreshCcw size={24} className="text-primary" />,
    title: "7-Day Easy Return",
    desc: "If you're not fully delighted with your drape, return it within 7 days. Simple, straightforward process.",
  },
  {
    icon: <Shield size={24} className="text-primary" />,
    title: "Secure Purchase",
    desc: "Every transaction is securely processed and encrypted, supporting card payments, UPI, and COD.",
  },
  {
    icon: <Headphones size={24} className="text-primary" />,
    title: "Dedicated Support",
    desc: "Our support concierges are available on WhatsApp and email to resolve queries within 24 hours.",
  },
];

export default function WhyUs() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="py-28 bg-[#FFF8F8] overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <span className="text-primary font-semibold uppercase tracking-[4px] text-xs">
            The Kaumudi Promise
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-light mt-3 text-gray-900">
            Why Choose Us
          </h2>
          <div className="w-12 h-[1px] bg-accent-gold mx-auto mt-4" />
          <p className="text-gray-500 mt-4 max-w-xl mx-auto font-light text-sm md:text-base leading-relaxed">
            We are not just a marketplace. We own the looms, ensuring uncompromising quality control from thread to final packaging.
          </p>
        </ScrollReveal>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      y: -6,
                      borderColor: "rgba(212, 175, 55, 0.3)",
                      boxShadow: "0 20px 40px -15px rgba(128, 0, 32, 0.05)",
                    }
              }
              className="bg-white border border-gray-100 rounded-2xl p-8 transition-all duration-300 group flex flex-col items-start"
            >
              {/* Icon container with double ring effect */}
              <div className="w-12 h-12 rounded-full bg-[#FFF8F8] border border-[#FFF0F2] flex items-center justify-center mb-6 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
                {feature.icon}
              </div>

              {/* Text details */}
              <h3 className="text-lg font-serif font-medium text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
