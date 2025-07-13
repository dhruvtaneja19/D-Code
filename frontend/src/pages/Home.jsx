import React, { useEffect, useState, useRef } from "react";
import NavbarNew from "../components/NavbarNew";
import Footer from "../components/Footer";
import Select from "react-select";
import { api_base_url } from "../helper";
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
import { IoTerminal } from "react-icons/io5";
import { FaCode, FaJava } from "react-icons/fa";

const Home = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("dcode-darkmode");
    return stored ? JSON.parse(stored) : true;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dcode-darkmode", JSON.stringify(darkMode));
  }, [darkMode]);

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
    fetch(api_base_url + "/getProjects", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: localStorage.getItem("token") }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.projects);
        } else {
          toast.error(data.msg);
        }
      });
  };

  const handleLanguageChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
    console.log("Selected language:", selectedOption);
  };

  const createProj = () => {
    if (!name.trim()) {
      toast.error("Project name is required!");
      return;
    }
    if (!selectedLanguage) {
      toast.error("Please select a language!");
      return;
    }

    setIsCreating(true);
    fetch(api_base_url + "/createProj", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        projLanguage: selectedLanguage.value,
        token: localStorage.getItem("token"),
        version: selectedLanguage.version,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setName("");
          setSelectedLanguage(null);
          setIsCreateModelShow(false);
          navigate("/editor/" + data.projectId);
        } else {
          toast.error(data.msg);
        }
      })
      .finally(() => setIsCreating(false));
  };

  const deleteProject = (id) => {
    let conf = confirm("Are you sure you want to delete this project?");
    if (conf) {
      fetch(api_base_url + "/deleteProject", {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          token: localStorage.getItem("token"),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            getProjects();
          } else {
            toast.error(data.msg);
          }
        });
    }
  };

  const updateProj = () => {
    if (!name.trim()) {
      toast.error("Project name is required!");
      return;
    }

    setIsUpdating(true);
    fetch(api_base_url + "/editProject", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: editProjId,
        token: localStorage.getItem("token"),
        name: name,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
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
      })
      .finally(() => setIsUpdating(false));
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
          Math.max(w, h) * 0.8
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
      {/* Single Live Animated Background for the entire page */}
      <canvas
        id="bg-animated"
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      />
      {/* Notification Banner */}
      {/* 
      <div className="w-full flex justify-center mt-0 px-2 sm:px-4">
        <div className="bg-[#7c3aed] text-white px-2 sm:px-4 md:px-6 py-2 rounded-b-lg shadow-lg flex flex-wrap items-center gap-2 mt-0 text-xs sm:text-sm font-medium w-full max-w-3xl justify-center">
          <span role="img" aria-label="fire">
            🔥
          </span>
          Limited-Time Offer! Use coupon{" "}
          <span className="bg-black px-2 py-1 rounded text-[#fbbf24] font-bold ml-1 mr-1">
            LAUNCH30
          </span>{" "}
          at checkout and enjoy <span className="font-bold">30% OFF</span> on
          all plans.
          <button
            className="ml-3 underline hover:text-[#fbbf24] whitespace-nowrap"
            onClick={() => window.open("https://yourplanslink.com", "_blank")}
          >
            View Plans
          </button>
        </div>
      </div>
    */}
      {/* Hero Section */}
      <div
        className={`relative flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] text-center px-2 sm:px-4 pt-8 sm:pt-12 pb-0 overflow-hidden w-full transition-colors duration-500`}
      >
        {/* No static gradient, only live bg */}
        <h1
          className={`text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text drop-shadow-lg mb-2 sm:mb-4 animate-pulse ${
            darkMode
              ? "bg-gradient-to-r from-[#a855f7] via-[#818cf8] to-[#38bdf8]"
              : "bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#38bdf8]"
          }`}
        >
          D-Code - Your Coding Buddy !!
        </h1>
        <h2
          className={`text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 ${
            darkMode ? "text-white" : "text-[#3b3b3b]"
          }`}
        >
          Start your your coding journey with D-Code
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center mb-4 sm:mb-6 w-full max-w-xs sm:max-w-none mx-auto">
          <button
            className={`font-semibold py-2 sm:py-3 px-4 sm:px-8 rounded-lg shadow-lg text-sm sm:text-lg transition-all w-full sm:w-auto ${
              darkMode
                ? "bg-[#a855f7] hover:bg-[#7c3aed] text-white"
                : "bg-[#a855f7] hover:bg-[#818cf8] text-white"
            }`}
            onClick={() => setIsCreateModelShow(true)}
          >
            Get Started
          </button>
          <button
            className={`font-semibold py-2 sm:py-3 px-4 sm:px-8 rounded-lg shadow-lg text-sm sm:text-lg transition-all w-full sm:w-auto border-2 ${
              darkMode
                ? "bg-transparent border-[#a855f7] hover:bg-[#a855f7] hover:text-white text-[#a855f7]"
                : "bg-transparent border-[#818cf8] hover:bg-[#818cf8] hover:text-white text-[#6366f1]"
            }`}
            onClick={() => navigate("/demo")}
          >
            Live Demo
          </button>
        </div>
        {/* Social Proof */}
        <div className="flex items-center justify-center gap-1 sm:gap-3 mt-1 mb-0 flex-wrap">
          <div className="flex -space-x-1 sm:-space-x-3">
            <img
              src="/src/images/logos/logo.png"
              alt="user1"
              className="w-6 h-6 sm:w-10 sm:h-10 rounded-full border-1 sm:border-2 border-white"
            />
            <img
              src="/src/images/logos/logo2.png"
              alt="user2"
              className="w-6 h-6 sm:w-10 sm:h-10 rounded-full border-1 sm:border-2 border-white"
            />
            <div
              className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-1 sm:border-2 border-white text-xs sm:text-lg ${
                darkMode ? "bg-[#a855f7] text-white" : "bg-[#818cf8] text-white"
              }`}
            >
              +99
            </div>
          </div>
          <span
            className={`font-medium ml-1 sm:ml-2 text-xs sm:text-base ${
              darkMode ? "text-[#cbd5e1]" : "text-[#6366f1]"
            }`}
          >
            Hundreds of coders are already using D-code
          </span>
        </div>
      </div>

      {/* Feature Section (after Hero) */}
      <section
        className={`w-full flex flex-col items-center justify-center py-0 text-center px-0 sm:px-2`}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-4">
            <span
              className={`inline-flex items-center justify-center text-4xl sm:text-5xl md:text-6xl ${
                darkMode ? "text-[#a855f7]" : "text-[#a855f7] border-[#a855f7]"
              } border-2 rounded-full w-12 h-12 sm:w-16 sm:h-16 mb-1`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 sm:w-10 sm:h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </span>

            <h2
              className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 ${
                darkMode ? "text-white" : "text-[#7c3aed]"
              }`}
            >
              AI powered coding assistant
            </h2>
          </div>
          <ul
            className={`text-center text-base sm:text-lg mb-6 sm:mb-8 space-y-1 sm:space-y-2 ${
              darkMode ? "text-[#cbd5e1]" : "text-[#94a3b8]"
            }`}
          >
            <li className="flex items-center justify-center gap-2">
              <span className="text-green-400">✔</span> Ask follow-up questions
              or clarify doubts
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-green-400">✔</span> Get code snippets and
              suggestions
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="text-green-400">✔</span> Get explanations for
              your complex code
            </li>
          </ul>
          <button
            className={`font-semibold py-3 px-8 rounded-xl shadow-lg text-lg transition-all mb-6 sm:mb-8 mt-2 animate-pulse w-full sm:w-auto ${
              darkMode
                ? "bg-[#a855f7] hover:bg-[#7c3aed] text-white"
                : "bg-[#b983f7] hover:bg-[#a855f7] text-white shadow-[0_8px_24px_0_rgba(168,85,247,0.15)]"
            }`}
            onClick={() => setIsCreateModelShow(true)}
            style={{
              boxShadow: !darkMode
                ? "0 8px 24px 0 rgba(168,85,247,0.15)"
                : undefined,
            }}
          >
            Start your coding journey now →
          </button>
        </div>
        <h2
          className={`text-xl sm:text-3xl md:text-4xl font-bold mt-8 sm:mt-16 ${
            darkMode ? "text-white" : "text-[#7c3aed]"
          }`}
        >
          How D Code Works ??
        </h2>
      </section>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModelShow && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={createModalRef}
              className="bg-[#2D3748] p-6 rounded-lg shadow-lg w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl text-[#F1F5F9] font-semibold mb-4">
                Create New Project
              </h2>
              <div className="inputBox">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {/* Fix: Close the inputBox div and add missing closing tags for modal */}
              <Select
                options={languageOptions}
                onChange={handleLanguageChange}
                value={selectedLanguage}
                placeholder="Select Language"
                className="mt-4"
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "#4A5568",
                    borderColor: "#718096",
                    color: "#F1F5F9",
                    "&:hover": {
                      borderColor: "#A0AEC0",
                    },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#4A5568",
                    color: "#F1F5F9",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2D3748" : "#4A5568",
                    color: "#F1F5F9",
                    "&:hover": {
                      backgroundColor: "#2D3748",
                    },
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#F1F5F9",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#A0AEC0",
                  }),
                  input: (provided) => ({
                    ...provided,
                    color: "#F1F5F9",
                  }),
                }}
              />
              <div className="flex gap-4 mt-6">
                <motion.button
                  className="btnNormal bg-[#3B82F6] text-[#f9f1f1] flex-1"
                  onClick={createProj}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create"}
                </motion.button>
                <motion.button
                  className="btnNormal bg-gray-500 text-[#F1F5F9] flex-1"
                  onClick={() => setIsCreateModelShow(false)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {isEditModelShow && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={editModalRef}
              className="bg-[#2D3748] p-6 rounded-lg shadow-lg w-full max-w-md"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className="text-2xl text-[#F1F5F9] font-semibold mb-4">
                Edit Project
              </h2>
              <div className="inputBox">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <motion.button
                  className="btnNormal bg-[#3B82F6] text-[#F1F5F9] flex-1"
                  onClick={updateProj}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </motion.button>
                <motion.button
                  className="btnNormal bg-gray-500 text-[#F1F5F9] flex-1"
                  onClick={() => setIsEditModelShow(false)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="projects px-2 sm:px-6 md:px-[100px] mt-5 pb-10 w-full">
        {projects && projects.length > 0 ? (
          projects.map((project, index) => (
            <motion.div
              key={index}
              className="project w-full p-2 sm:p-[15px] flex flex-col sm:flex-row items-center justify-between bg-[#2D3748] rounded-lg shadow-md mb-4 gap-2 sm:gap-0"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={projectVariants}
            >
              <div
                onClick={() => navigate(`/editor/${project._id}`)}
                className="flex w-full items-center gap-2 sm:gap-[15px] cursor-pointer"
              >
                <div
                  className="w-20 h-16 sm:w-[130px] sm:h-[100px] rounded-md flex items-center justify-center shadow-lg border-2 border-opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${
                      getLanguageIcon(project.projLanguage).color
                    }20, ${getLanguageIcon(project.projLanguage).bgColor}20)`,
                    borderColor: getLanguageIcon(project.projLanguage).color,
                  }}
                >
                  <div className="text-center">
                    <div
                      className="mb-1 flex justify-center"
                      aria-label={project.projLanguage}
                    >
                      {React.createElement(
                        getLanguageIcon(project.projLanguage).icon,
                        {
                          className: "w-8 h-8 sm:w-12 sm:h-12",
                          style: {
                            color: getLanguageIcon(project.projLanguage).color,
                          },
                        }
                      )}
                    </div>
                    <div
                      className="text-xs sm:text-sm font-bold uppercase tracking-wider"
                      style={{
                        color: getLanguageIcon(project.projLanguage).color,
                      }}
                    >
                      {project.projLanguage === "cpp"
                        ? "C++"
                        : project.projLanguage}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl text-[#F1F5F9]">
                    {project.name}
                  </h3>
                  <p className="text-xs sm:text-[14px] text-[#94A3B8]">
                    {new Date(project.date).toDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-[15px] w-full sm:w-auto justify-end">
                <motion.button
                  className="btnNormal bg-[#3B82F6] text-[#F1F5F9] px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-md text-xs sm:text-base"
                  onClick={() => {
                    setIsEditModelShow(true);
                    setEditProjId(project._id);
                    setName(project.name);
                  }}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => deleteProject(project._id)}
                  className="btnNormal bg-red-500 text-[#F1F5F9] px-2 sm:px-4 py-1 sm:py-2 rounded-lg shadow-md text-xs sm:text-base"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.p
            className="text-[#F1F5F9] text-base sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No Project Found!
          </motion.p>
        )}
      </div>

      {/* About Section */}
      <motion.div
        className="w-full flex justify-center mt-12 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-4xl bg-gradient-to-r from-[#3B82F6] to-[#A855F7] text-[#F1F5F9] p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-4">About D CODE IDE</h2>
          <p className="text-lg leading-relaxed">
            <strong>[D CODE]</strong> is a versatile integrated development
            environment designed for developers of all levels. It supports
            multiple programming languages, including Python, JavaScript, Java,
            C++, and more.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            Key features include intelligent code completion, real-time
            collaboration, an integrated debugger, and a customizable interface.
            Enhance your workflow with our extensive plugin library and built-in
            terminal. Get started quickly with our comprehensive documentation
            and tutorials.
          </p>
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Home;
