import React from "react";

const Footer = () => (
  <footer className="w-full bg-[#18181b] text-[#cbd5e1] flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-6 border-t border-[#23272f] mt-12">
    <div className="flex items-center gap-2">
      <span className="font-bold text-lg text-white">D Code</span>
      <span className="text-xs text-[#a855f7]">your coding buddy</span>
    </div>
    <div className="flex gap-4 mt-2 md:mt-0">
      <a href="/about" className="hover:text-[#a855f7] transition">
        About
      </a>
      <a href="/services" className="hover:text-[#a855f7] transition">
        Services
      </a>
      <a
        href="mailto:support@dcode.com"
        className="hover:text-[#a855f7] transition"
      >
        Contact
      </a>
    </div>
    <div className="text-xs mt-2 md:mt-0">
      © 2025 D Code. All rights reserved.
    </div>
  </footer>
);

export default Footer;
