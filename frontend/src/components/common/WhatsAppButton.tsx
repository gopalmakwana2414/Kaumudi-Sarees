"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on SSR and initial hydration to prevent mismatch,
  // and only render on public pages when configured
  if (!mounted || !whatsappNumber || pathname?.startsWith("/admin")) {
    return null;
  }

  // Format the WhatsApp URL (support standard format for wa.me link)
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        {/* Modern Ripple Effect */}
        <span className="absolute inset-0 -z-10 animate-whatsapp-ripple rounded-full bg-[#25D366] opacity-75" />

        {/* Official WhatsApp Logo SVG */}
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-current transition-transform duration-300 group-hover:rotate-12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.019-5.101-2.875-6.958C16.598 1.93 14.12 1.9 12.008 1.9c-5.435 0-9.863 4.419-9.866 9.863-.001 1.77.462 3.5 1.34 5.03L2.485 20.8l4.162-1.646zm11.233-5.265c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>

        {/* Premium Slide-in Tooltip */}
        <div 
          role="tooltip"
          className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 mr-2 opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 bg-gray-950/95 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xl whitespace-nowrap backdrop-blur-sm border border-white/10"
        >
          Chat with us
          <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-y-4 border-y-transparent border-l-4 border-l-gray-955/95" />
        </div>
      </a>
    </div>
  );
}
