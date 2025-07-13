import React from "react";
import logo from "../images/logos/logo.png";
import logo2 from "../images/logos/logo2.png";
import { Link, useNavigate } from "react-router-dom";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const NavbarNew = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-8 md:px-16 h-[80px] bg-gradient-to-r from-[#3B82F6] via-[#22D3EE] to-[#38bdf8] shadow-xl rounded-b-2xl z-50 relative">
      {/* Logo & Brand */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center shadow-md">
          <img src={logo} className="w-7 h-7" alt="Logo" />
        </div>
        <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow-lg">
          D Code
        </span>
      </div>
      {/* Center Navigation */}
      <div className="flex-1 flex justify-center gap-6 md:gap-10">
        <Link
          to="/features"
          className="text-white text-lg font-semibold hover:text-[#a855f7] transition drop-shadow-sm"
        >
          Features
        </Link>
        <Link
          to="/pricing"
          className="text-white text-lg font-semibold hover:text-[#a855f7] transition drop-shadow-sm"
        >
          Pricing
        </Link>
        <Link
          to="/demo"
          className="text-white text-lg font-semibold hover:text-[#a855f7] transition drop-shadow-sm"
        >
          Live Demo
        </Link>
        <Link
          to="/about"
          className="text-white text-lg font-semibold hover:text-[#a855f7] transition drop-shadow-sm hidden sm:block"
        >
          About
        </Link>
      </div>
      {/* Right Side: Dark/Light Toggle, Notification, User Avatars, CTA */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Notification Banner Icon */}
        <button
          className="relative p-2 rounded-full bg-[#23272f] hover:bg-[#a855f7] transition flex items-center justify-center"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#fbbf24] rounded-full border-2 border-white"></span>
        </button>
        {/* Dark/Light Mode Toggle */}
        <button
          className="p-2 rounded-full bg-[#23272f] hover:bg-[#a855f7] transition flex items-center justify-center"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <SunIcon className="w-6 h-6 text-yellow-400" />
          ) : (
            <MoonIcon className="w-6 h-6 text-white" />
          )}
        </button>
        {/* User Avatars for Social Proof */}
        <div className="flex -space-x-2 items-center ml-2">
          <img
            src={logo}
            alt="user1"
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <img
            src={logo2}
            alt="user2"
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <div className="w-8 h-8 rounded-full bg-[#a855f7] flex items-center justify-center text-white font-bold border-2 border-white text-base">
            +99
          </div>
        </div>
        {/* CTA Button */}
        <button
          className="bg-white text-[#18181b] font-bold px-5 py-2 rounded-lg shadow-md hover:bg-[#a855f7] hover:text-white transition-all ml-2"
          onClick={() => navigate("/signUp")}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

export default NavbarNew;
