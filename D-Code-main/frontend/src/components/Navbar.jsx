import React from "react";
import logo from "../images/logos/logo.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  // Framer Motion animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const linkVariants = {
    hover: { scale: 1.1, color: "#22D3EE", transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "#EF4444",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="nav flex px-[100px] items-center justify-between h-[90px] bg-[#2D3748] shadow-md"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <Link to="/">
        <img src={logo} className="w-[170px] object-cover" alt="Logo" />
      </Link>

      <div className="links flex items-center gap-[20px]">
        <motion.div whileHover="hover" variants={linkVariants}>
          <Link to="/" className="text-[#F1F5F9] text-lg font-medium">
            Home
          </Link>
        </motion.div>
        <motion.div whileHover="hover" variants={linkVariants}>
          <Link to="/about" className="text-[#F1F5F9] text-lg font-medium">
            About
          </Link>
        </motion.div>
        <motion.div whileHover="hover" variants={linkVariants}>
          <Link to="/services" className="text-[#F1F5F9] text-lg font-medium">
            Services
          </Link>
        </motion.div>

        <motion.button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("isLoggedIn");
            window.location.reload();
          }}
          className="btnNormal bg-red-500 text-[#F1F5F9] px-[20px] py-2 rounded-lg shadow-md"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Logout
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Navbar;
