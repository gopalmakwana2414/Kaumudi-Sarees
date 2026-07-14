"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import api from "@/lib/api";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ContactClient() {
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/contact", form);
      toast.success(
        "Message sent! We will get back to you within 24 hours."
      );
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] as const },
    },
  };

  return (
    <main className="overflow-hidden bg-gradient-to-tr from-[#fff8f8] via-[#fffbfb] to-[#ffffff]">
      {/* Hero */}
      <section className="hero-gradient py-24">
        <ScrollReveal className="container-custom text-center">
          <p className="text-primary font-semibold uppercase tracking-[4px] text-sm">
            Get in Touch
          </p>
          <h1 className="text-5xl font-bold mt-4">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="mt-4 text-gray-600 max-w-xl mx-auto">
            We&apos;re here to help. Write to us, call us, or visit our store in
            Surat. We&apos;d love to hear from you.
          </p>
        </ScrollReveal>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Contact Form */}
            <ScrollReveal y={30} duration={0.6} className="bg-white rounded-3xl border shadow-sm p-8 shadow-[0_20px_50px_rgba(128,0,32,0.02)]">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Send a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Priya Sharma"
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors duration-200 disabled:opacity-60 cursor-pointer shadow-md hover:shadow-lg shadow-primary/20 hover:scale-[1.02] duration-300"
                >
                  {loading ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </ScrollReveal>

            {/* Contact Info */}
            <div className="space-y-6">
              <ScrollReveal>
                <h2 className="text-2xl font-bold text-gray-800">Our Details</h2>
              </ScrollReveal>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="space-y-4"
              >
                {[
                  {
                    icon: <MapPin size={22} className="text-primary" />,
                    label: "Factory & Store",
                    value: "Ring Road, Surat, Gujarat – 395002",
                  },
                  {
                    icon: <Phone size={22} className="text-primary" />,
                    label: "Phone",
                    value: "+91 89594 65264",
                  },
                  {
                    icon: <Mail size={22} className="text-primary" />,
                    label: "Email",
                    value: "g91652251@gmail.com",
                  },
                  {
                    icon: <Clock size={22} className="text-primary" />,
                    label: "Business Hours",
                    value: "Mon – Sat: 9:00 AM – 6:00 PM",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    variants={cardVariants}
                    whileHover={shouldReduceMotion ? {} : { x: 4 }}
                    className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                      <p className="font-medium text-gray-700">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* WhatsApp CTA */}
              <ScrollReveal delay={0.2}>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://wa.me/918959465264"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-green-500 text-white py-4 rounded-2xl font-semibold hover:bg-green-600 transition-colors duration-200 shadow-md shadow-green-500/10 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6 fill-white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Chat on WhatsApp
                </motion.a>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
