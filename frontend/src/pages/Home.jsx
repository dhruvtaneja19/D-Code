import React, { useEffect, useState, useRef } from "react";
import NavbarNew from "../components/NavbarNew";
import Footer from "../components/Footer";
import Select from "react-select";
import { api_base_url, makeApiCall } from "../helper";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion"; // Framer Motion import
// React Icons imports
import {
  SiJavascript,
  SiPython,
  SiCplusplus,
  SiC,
  SiGnubash,
  SiCoffeescript,
} from "react-icons/si";
import { IoTerminal, IoPlay, IoStop } from "react-icons/io5";
import { FaCode, FaJava } from "react-icons/fa";
import { BiRightArrow } from "react-icons/bi";

const Home = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("dcode-darkmode");
    return stored ? JSON.parse(stored) : true;
  });

  // Terminal simulation states
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);

  // Sample code examples for terminal simulation
  const codeExamples = [
    {
      language: "Python",
      icon: SiPython,
      color: "#3776AB",
      code: `print("Hello, World!")
print("Welcome to Python.")
name = "Dhruv"
print("My name is", name)`,
      output: ["Hello, World!", "Welcome to Python.", "My name is Dhruv"],
    },
    {
      language: "Java",
      icon: FaJava,
      color: "#ED8B00",
      code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java.");
        String name = "Dhruv";
        System.out.println("My name is " + name);
    }
}`,
      output: ["Hello, World!", "Welcome to Java.", "My name is Dhruv"],
    },
    {
      language: "C",
      icon: SiC,
      color: "#A8B9CC",
      code: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Welcome to C.\\n");
    char name[] = "Dhruv";
    printf("My name is %s\\n", name);
    return 0;
}`,
      output: ["Hello, World!", "Welcome to C.", "My name is Dhruv"],
    },
    {
      language: "JavaScript",
      icon: SiJavascript,
      color: "#F7DF1E",
      code: `console.log("Hello, World!");
console.log("Welcome to JavaScript.");
let name = "Dhruv";
console.log("My name is " + name);`,
      output: ["Hello, World!", "Welcome to JavaScript.", "My name is Dhruv"],
    },
    {
      language: "C++",
      icon: SiCplusplus,
      color: "#00599C",
      code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "Welcome to C++." << endl;
    string name = "Dhruv";
    cout << "My name is " << name << endl;
    return 0;
}`,
      output: ["Hello, World!", "Welcome to C++.", "My name is Dhruv"],
    },
    {
      language: "Bash",
      icon: SiGnubash,
      color: "#4EAA25",
      code: `#!/bin/bash

echo "Hello, World!"
echo "Welcome to Bash."
name="Dhruv"
echo "My name is $name"`,
      output: ["Hello, World!", "Welcome to Bash.", "My name is Dhruv"],
    },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dcode-darkmode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Terminal simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCodeIndex((prev) => (prev + 1) % codeExamples.length);
      setTerminalOutput([]);
      setIsTerminalRunning(true);

      // Simulate code execution
      setTimeout(() => {
        const currentExample = codeExamples[currentCodeIndex];
        let outputIndex = 0;

        const outputInterval = setInterval(() => {
          if (outputIndex < currentExample.output.length) {
            setTerminalOutput((prev) => [
              ...prev,
              currentExample.output[outputIndex],
            ]);
            outputIndex++;
          } else {
            setIsTerminalRunning(false);
            clearInterval(outputInterval);
          }
        }, 800);

        return () => clearInterval(outputInterval);
      }, 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentCodeIndex]);

  // Function to get language icon
  const getLanguageIcon = (language) => {
    const iconMap = {
      javascript: {
        icon: SiJavascript,
        color: "#F7DF1E",
        bgColor: "#323330",
      },
      python: {
        icon: SiPython,
        color: "#3776AB",
        bgColor: "#FFD43B",
      },
      java: {
        icon: FaJava,
        color: "#ED8B00",
        bgColor: "#F89820",
      },
      cpp: {
        icon: SiCplusplus,
        color: "#00599C",
        bgColor: "#659AD2",
      },
      c: {
        icon: SiC,
        color: "#A8B9CC",
        bgColor: "#283593",
      },
      bash: {
        icon: SiGnubash,
        color: "#4EAA25",
        bgColor: "#000000",
      },
    };

    return (
      iconMap[language] || {
        icon: FaCode,
        color: "#6366F1",
        bgColor: "#E5E7EB",
      }
    );
  };

  const [isCreateModelShow, setIsCreateModelShow] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isEditModelShow, setIsEditModelShow] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // Loading state for create
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for update
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [projects, setProjects] = useState(null);
  const [editProjId, setEditProjId] = useState("");
  const createModalRef = useRef(null);
  const editModalRef = useRef(null);

  useEffect(() => {
    getProjects();
    getRunTimes();
  }, []);

  const getRunTimes = async () => {
    let res = await fetch("https://emkc.org/api/v2/piston/runtimes");
    let data = await res.json();

    const filteredLanguages = [
      "python",
      "javascript",
      "c",
      "c++",
      "java",
      "bash",
    ];
    const options = data
      .filter((runtime) => filteredLanguages.includes(runtime.language))
      .map((runtime) => ({
        label: `${runtime.language} (${runtime.version})`,
        value: runtime.language === "c++" ? "cpp" : runtime.language,
        version: runtime.version,
      }));

    setLanguageOptions(options);
  };

  const getProjects = async () => {
    try {
      const data = await makeApiCall("/getProjects", {
        method: "POST",
        body: JSON.stringify({ token: localStorage.getItem("token") }),
      });

      if (data.success) {
        setProjects(data.projects);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error("Failed to get projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const handleLanguageChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
    console.log("Selected language:", selectedOption);
  };

  const createProj = async () => {
    if (!name.trim()) {
      toast.error("Project name is required!");
      return;
    }
    if (!selectedLanguage) {
      toast.error("Please select a language!");
      return;
    }

    setIsCreating(true);
    try {
      const data = await makeApiCall("/createProj", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          projLanguage: selectedLanguage.value,
          token: localStorage.getItem("token"),
          version: selectedLanguage.version,
        }),
      });

      if (data.success) {
        setName("");
        setSelectedLanguage(null);
        setIsCreateModelShow(false);
        navigate("/editor/" + data.projectId);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteProject = async (id) => {
    let conf = confirm("Are you sure you want to delete this project?");
    if (conf) {
      try {
        const data = await makeApiCall("/deleteProject", {
          method: "POST",
          body: JSON.stringify({
            projectId: id,
            token: localStorage.getItem("token"),
          }),
        });

        if (data.success) {
          getProjects();
        } else {
          toast.error(data.msg);
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
        toast.error("Failed to delete project");
      }
    }
  };

  const updateProj = async () => {
    if (!name.trim()) {
      toast.error("Project name is required!");
      return;
    }

    setIsUpdating(true);
    try {
      const data = await makeApiCall("/editProject", {
        method: "POST",
        body: JSON.stringify({
          projectId: editProjId,
          token: localStorage.getItem("token"),
          name: name,
        }),
      });

      if (data.success) {
        setIsEditModelShow(false);
        setName("");
        setEditProjId("");
        getProjects();
      } else {
        toast.error(data.msg);
        setIsEditModelShow(false);
        setName("");
        setEditProjId("");
        getProjects();
      }
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project");
      setIsEditModelShow(false);
      setName("");
      setEditProjId("");
      getProjects();
    } finally {
      setIsUpdating(false);
    }
  };

  // Framer Motion animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const projectVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, delay: i * 0.2, ease: "easeOut" },
    }),
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      backgroundColor: "#22D3EE",
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.95 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // Handle click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        createModalRef.current &&
        !createModalRef.current.contains(event.target)
      ) {
        setIsCreateModelShow(false);
      }
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target)
      ) {
        setIsEditModelShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live animated background effect
  React.useEffect(() => {
    const canvas = document.getElementById("bg-animated");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    // Gradient background for light mode
    function drawGradientBg() {
      if (!darkMode) {
        const gradient = ctx.createRadialGradient(
          w / 2,
          h / 2,
          Math.min(w, h) * 0.1,
          w / 2,
          h / 2,
          Math.max(w, h) * 0.8,
        );
        gradient.addColorStop(0, "#f8fafc");
        gradient.addColorStop(1, "#e0e7ef");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }

    // Pastel color palette for light mode (more saturated)
    const pastelColors = [
      "rgba(168,85,247,0.28)", // purple
      "rgba(129,140,248,0.26)", // indigo
      "rgba(56,189,248,0.25)", // cyan
      "rgba(236,72,153,0.23)", // pink
      "rgba(34,211,238,0.23)", // teal
      "rgba(251,191,36,0.23)", // yellow
      "rgba(59,130,246,0.22)", // blue
      "rgba(244,114,182,0.22)", // fuchsia
    ];

    // Increase number and size of dots
    let dots = Array.from({ length: 120 }, () => {
      const baseColor = darkMode
        ? `rgba(168,85,247,${Math.random() * 0.3 + 0.18})`
        : pastelColors[Math.floor(Math.random() * pastelColors.length)];
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 4 + 2.5, // larger dots
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        color: baseColor,
        opacity: Math.random() * 0.5 + 0.5, // higher min opacity
        fade: Math.random() > 0.5 ? 1 : -1,
      };
    });

    let animationId;
    function animate() {
      ctx.clearRect(0, 0, w, h); // Always clear first
      if (!darkMode) {
        drawGradientBg(); // Draw gradient for light mode
      }
      for (let dot of dots) {
        ctx.save();
        ctx.globalAlpha = dot.opacity;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI);
        ctx.fillStyle = dot.color;
        ctx.fill();
        ctx.restore();
        dot.x += dot.dx;
        dot.y += dot.dy;
        // Animate opacity for dreamy effect
        dot.opacity += 0.005 * dot.fade;
        if (dot.opacity > 0.8) dot.fade = -1;
        if (dot.opacity < 0.25) dot.fade = 1;
        if (dot.x < 0 || dot.x > w) dot.dx *= -1;
        if (dot.y < 0 || dot.y > h) dot.dy *= -1;
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();
    function handleResize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [darkMode]);

  return (
    <>
      <NavbarNew darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Container */}
      <div
        className={`min-h-screen transition-colors duration-500 pt-20 ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Hero Section with Split Layout */}
        <div className="flex flex-col lg:flex-row min-h-[90vh]">
          {/* Left Side - Main Content */}
          <div className="flex-1 px-4 sm:px-8 lg:px-16 py-12 lg:py-20">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <div className="mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                    darkMode
                      ? "bg-purple-900/30 text-purple-300 border border-purple-700/50"
                      : "bg-purple-100 text-purple-700 border border-purple-200"
                  }`}
                >
                  <IoTerminal className="mr-2" />
                  Professional Code IDE Platform
                </motion.div>

                <h1
                  className={`text-4xl lg:text-6xl font-bold mb-6 leading-tight ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  <span className="bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    D-Code
                  </span>
                  <br />
                  <span
                    className={darkMode ? "text-gray-300" : "text-gray-700"}
                  >
                    Your Ultimate Coding Companion
                  </span>
                </h1>

                <p
                  className={`text-lg lg:text-xl mb-8 leading-relaxed ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Experience the future of coding with our AI-powered IDE.
                  Write, debug, and deploy code seamlessly across multiple
                  languages with intelligent assistance and real-time
                  collaboration.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    icon: "🚀",
                    title: "Lightning Fast",
                    desc: "Optimized performance",
                  },
                  {
                    icon: "🤖",
                    title: "AI-Powered",
                    desc: "Smart code completion",
                  },
                  {
                    icon: "🔗",
                    title: "Real-time Sync",
                    desc: "Collaborative coding",
                  },
                  {
                    icon: "🛡️",
                    title: "Secure",
                    desc: "Enterprise-grade security",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                      darkMode
                        ? "bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800"
                        : "bg-white border border-gray-200 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{feature.icon}</span>
                      <div>
                        <h3
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {feature.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateModelShow(true)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                >
                  <IoPlay className="mr-2" />
                  Start Coding Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/demo")}
                  className={`px-8 py-4 font-semibold rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${
                    darkMode
                      ? "border-purple-500 text-purple-400 hover:bg-purple-500/10"
                      : "border-purple-600 text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  <FaCode className="mr-2" />
                  Live Demo
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12"
              ></motion.div>
            </motion.div>
          </div>

          {/* Right Side - Terminal Simulation */}
          <div className="flex-1 max-w-xl lg:max-w-none p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{
                boxShadow:
                  "0 0 50px rgba(168, 85, 247, 0.3), 0 0 100px rgba(59, 130, 246, 0.2), inset 0 0 0 2px rgba(168, 85, 247, 0.4)",
                scale: 1.02,
                transition: { duration: 0.15, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.98 }}
              className={`h-full rounded-2xl shadow-2xl overflow-hidden border transition-all duration-150 ease-out ${
                darkMode
                  ? "bg-gray-900 border-gray-700 hover:border-purple-400/50"
                  : "bg-gray-900 border-gray-700 hover:border-purple-400/50"
              }`}
            >
              {/* Terminal Header */}
              <div
                className={`flex items-center justify-between px-6 py-4 border-b ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center">
                    <IoTerminal
                      className={`mr-2 ${
                        darkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-300"
                      }`}
                    >
                      D-Code Terminal
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: isTerminalRunning ? [1, 1.2, 1] : 1 }}
                    transition={{
                      repeat: isTerminalRunning ? Infinity : 0,
                      duration: 1,
                    }}
                    className={`w-2 h-2 rounded-full ${
                      isTerminalRunning ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {isTerminalRunning ? "Running" : "Ready"}
                  </span>
                </div>
              </div>

              {/* Code Execution Section */}
              <div className="flex flex-col min-h-[300px] lg:min-h-[340px]">
                {/* Language Tab */}
                <div
                  className={`flex items-center justify-between px-6 py-3 border-b ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <div className="flex items-center">
                    {React.createElement(codeExamples[currentCodeIndex].icon, {
                      className: "mr-3",
                      style: { color: codeExamples[currentCodeIndex].color },
                      size: 20,
                    })}
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {codeExamples[currentCodeIndex].language} Demo
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{
                        scale: isTerminalRunning ? [1, 1.1, 1] : 1,
                        rotate: isTerminalRunning ? [0, 180, 360] : 0,
                      }}
                      transition={{
                        repeat: isTerminalRunning ? Infinity : 0,
                        duration: 2,
                        ease: "linear",
                      }}
                      className={`p-2 rounded-full ${
                        isTerminalRunning
                          ? darkMode
                            ? "bg-green-900/30 text-green-400"
                            : "bg-green-100 text-green-600"
                          : darkMode
                            ? "bg-gray-700 text-gray-400"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isTerminalRunning ? (
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      ) : (
                        <IoPlay size={12} />
                      )}
                    </motion.div>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-300"
                      }`}
                    >
                      {isTerminalRunning ? "Executing..." : "Ready to Run"}
                    </span>
                  </div>
                </div>

                {/* Code Display Area */}
                <div
                  className={`flex-1 p-4 font-mono text-sm ${
                    darkMode ? "bg-gray-900" : "bg-gray-900"
                  }`}
                >
                  {/* Code Block */}
                  <div
                    className={`p-4 rounded-lg border-2 border-dashed mb-4 ${
                      darkMode
                        ? "bg-gray-800 border-gray-600"
                        : "bg-gray-800 border-gray-600"
                    }`}
                  >
                    <div
                      className={`text-xs uppercase tracking-wide font-bold mb-3 flex items-center ${
                        darkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      <FaCode className="mr-2" />
                      Source Code
                    </div>

                    <motion.div
                      key={currentCodeIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      className="relative"
                    >
                      <pre
                        className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          darkMode ? "text-gray-100" : "text-gray-100"
                        }`}
                      >
                        {codeExamples[currentCodeIndex].code}
                      </pre>

                      {/* Copy Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
                          darkMode
                            ? "bg-gray-700/50 hover:bg-gray-700 text-gray-300"
                            : "bg-gray-700/50 hover:bg-gray-700 text-gray-300"
                        }`}
                        onClick={() => {
                          navigator.clipboard.writeText(
                            codeExamples[currentCodeIndex].code,
                          );
                          // You could add a toast notification here
                        }}
                      >
                        📋
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Output Section */}
                  <div
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? "bg-gray-800 border-gray-600"
                        : "bg-gray-800 border-gray-600"
                    }`}
                  >
                    <div
                      className={`text-xs uppercase tracking-wide font-bold mb-3 flex items-center ${
                        darkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                    >
                      <IoTerminal className="mr-2" />
                      Console Output
                    </div>

                    <div
                      className={`${
                        darkMode ? "bg-gray-900" : "bg-gray-900"
                      } rounded p-3 font-mono text-sm`}
                    >
                      {/* Execution Command */}
                      <div
                        className={`${
                          darkMode ? "text-cyan-400" : "text-cyan-400"
                        } mb-2 flex items-center`}
                      >
                        <span className="mr-2">$</span>
                        <motion.span
                          key={`cmd-${currentCodeIndex}`}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          transition={{ duration: 0.8 }}
                        >
                          Running {codeExamples[currentCodeIndex].language}{" "}
                          code...
                        </motion.span>
                      </div>

                      {/* Output Lines */}
                      <AnimatePresence mode="wait">
                        {terminalOutput.map((line, index) => (
                          <motion.div
                            key={`${currentCodeIndex}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.1,
                            }}
                            className={`py-1 flex items-start ${
                              darkMode ? "text-green-400" : "text-green-400"
                            }`}
                          >
                            <BiRightArrow
                              className="mr-2 mt-1 flex-shrink-0"
                              size={12}
                            />
                            <span className="break-all">{line}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Loading Animation */}
                      {isTerminalRunning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`flex items-center py-1 ${
                            darkMode ? "text-yellow-400" : "text-yellow-400"
                          }`}
                        >
                          <div className="flex space-x-1 mr-2">
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0,
                              }}
                              className="w-1 h-1 bg-current rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0.1,
                              }}
                              className="w-1 h-1 bg-current rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                repeat: Infinity,
                                duration: 0.6,
                                delay: 0.2,
                              }}
                              className="w-1 h-1 bg-current rounded-full"
                            />
                          </div>
                          <span>Processing execution...</span>
                        </motion.div>
                      )}

                      {/* Empty state when no output */}
                      {!isTerminalRunning && terminalOutput.length === 0 && (
                        <div
                          className={`text-center py-4 ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          <div className="text-2xl mb-2">⚡</div>
                          <div className="text-xs">
                            Waiting for execution...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="px-4 sm:px-8 lg:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div
              className={`rounded-2xl p-8 sm:p-10 shadow-xl border transition-all duration-300 ${
                darkMode
                  ? "bg-gray-800/70 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <h2
                className={`text-2xl sm:text-3xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                About D CODE IDE
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-4">
                <span className="font-semibold">[D CODE]</span> is a versatile
                integrated development environment designed for developers of
                all levels. It supports multiple programming languages,
                including Python, JavaScript, Java, C++, and more.
              </p>
              <p className="text-base sm:text-lg leading-relaxed">
                Key features include intelligent code completion, real-time
                collaboration, an integrated debugger, and a customizable
                interface. Enhance your workflow with our extensive plugin
                library and built-in terminal. Get started quickly with our
                comprehensive documentation and tutorials.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Projects Section */}
        <div className="px-4 sm:px-8 lg:px-16 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2
                className={`text-3xl lg:text-4xl font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Your Projects
              </h2>
              <p
                className={`text-lg ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage and organize all your coding projects in one place
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects && projects.length > 0 ? (
                projects.map((project, index) => (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`group cursor-pointer rounded-xl p-6 transition-all duration-300 ${
                      darkMode
                        ? "bg-gray-800 hover:bg-gray-750 border border-gray-700"
                        : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md"
                    }`}
                    onClick={() => navigate(`/editor/${project._id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${
                            getLanguageIcon(project.projLanguage).color
                          }20, ${
                            getLanguageIcon(project.projLanguage).color
                          }10)`,
                        }}
                      >
                        {React.createElement(
                          getLanguageIcon(project.projLanguage).icon,
                          {
                            className: "w-6 h-6",
                            style: {
                              color: getLanguageIcon(project.projLanguage)
                                .color,
                            },
                          },
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditModelShow(true);
                            setEditProjId(project._id);
                            setName(project.name);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-400 hover:text-blue-400"
                              : "hover:bg-gray-100 text-gray-600 hover:text-blue-600"
                          }`}
                        >
                          ✏️
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project._id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-400 hover:text-red-400"
                              : "hover:bg-gray-100 text-gray-600 hover:text-red-600"
                          }`}
                        >
                          🗑️
                        </motion.button>
                      </div>
                    </div>

                    <h3
                      className={`text-lg font-semibold mb-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {project.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {project.projLanguage === "cpp"
                          ? "C++"
                          : project.projLanguage}
                      </span>
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {new Date(project.date).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div
                    className={`text-6xl mb-4 ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    📁
                  </div>
                  <p
                    className={`text-lg mb-6 ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    No projects found. Create your first project to get started!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModelShow(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Create First Project
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* About Section */}
        <div
          id="features"
          className={`py-16 ${darkMode ? "bg-gray-800/50" : "bg-gray-100"}`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2
                className={`text-3xl lg:text-4xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Why Choose D-Code?
              </h2>
              <p
                className={`text-lg leading-relaxed mb-8 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                D-Code is more than just an IDE - it's your comprehensive coding
                ecosystem. Built for developers who demand excellence, our
                platform combines cutting-edge AI assistance with intuitive
                design to accelerate your development workflow.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                {[
                  {
                    icon: "🎯",
                    title: "Precision Coding",
                    desc: "Advanced syntax highlighting and intelligent error detection",
                  },
                  {
                    icon: "⚡",
                    title: "Lightning Speed",
                    desc: "Optimized performance with instant compilation and execution",
                  },
                  {
                    icon: "🌐",
                    title: "Universal Support",
                    desc: "Support for 6+ programming languages and frameworks",
                  },
                  {
                    icon: "🤖",
                    title: "Ask AI",
                    desc: "Claude AI powered code analyzing feature for intelligent assistance",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-6 rounded-xl ${
                      darkMode
                        ? "bg-gray-800 border border-gray-700"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3
                      className={`text-xl font-semibold mb-3 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModelShow && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={createModalRef}
              className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2
                className={`text-2xl font-bold mb-6 text-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Create New Project
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter project name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Programming Language
                  </label>
                  <Select
                    options={languageOptions}
                    onChange={handleLanguageChange}
                    value={selectedLanguage}
                    placeholder="Select a language..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        backgroundColor: darkMode ? "#374151" : "#ffffff",
                        borderColor: state.isFocused
                          ? darkMode
                            ? "#a855f7"
                            : "#a855f7"
                          : darkMode
                            ? "#4B5563"
                            : "#D1D5DB",
                        borderWidth: "1px",
                        borderRadius: "12px",
                        padding: "8px",
                        boxShadow: state.isFocused
                          ? `0 0 0 2px ${
                              darkMode
                                ? "rgba(168, 85, 247, 0.2)"
                                : "rgba(168, 85, 247, 0.2)"
                            }`
                          : "none",
                        color: darkMode ? "#ffffff" : "#111827",
                        "&:hover": {
                          borderColor: darkMode ? "#a855f7" : "#a855f7",
                        },
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: darkMode ? "#374151" : "#ffffff",
                        borderRadius: "12px",
                        border: `1px solid ${darkMode ? "#4B5563" : "#D1D5DB"}`,
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? darkMode
                            ? "#4B5563"
                            : "#F3F4F6"
                          : "transparent",
                        color: darkMode ? "#ffffff" : "#111827",
                        padding: "12px 16px",
                        "&:hover": {
                          backgroundColor: darkMode ? "#4B5563" : "#F3F4F6",
                        },
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: darkMode ? "#ffffff" : "#111827",
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: darkMode ? "#9CA3AF" : "#6B7280",
                      }),
                      input: (provided) => ({
                        ...provided,
                        color: darkMode ? "#ffffff" : "#111827",
                      }),
                    }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={createProj}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      "Create Project"
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold border-2 transition-all duration-300 ${
                      darkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setIsCreateModelShow(false);
                      setName("");
                      setSelectedLanguage(null);
                    }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {isEditModelShow && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={editModalRef}
              className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${
                darkMode
                  ? "bg-gray-800 border border-gray-700"
                  : "bg-white border border-gray-200"
              }`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2
                className={`text-2xl font-bold mb-6 text-center ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Edit Project
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter project name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    } focus:outline-none`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={updateProj}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      "Update Project"
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold border-2 transition-all duration-300 ${
                      darkMode
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setIsEditModelShow(false);
                      setName("");
                      setEditProjId("");
                    }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default Home;
