import React, { useEffect, useState, useRef } from "react";
import NavbarNew from "../components/NavbarNew";
import Editor2 from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";
import { api_base_url, makeApiCall } from "../helper";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Editor = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("dcode-darkmode");
    return stored ? JSON.parse(stored) : true;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dcode-darkmode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Live animated background effect for Editor page
  useEffect(() => {
    const canvas = document.getElementById("bg-animated-editor");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    let dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      color: darkMode
        ? `rgba(168,85,247,${Math.random() * 0.3 + 0.1})`
        : `rgba(59,130,246,${Math.random() * 0.2 + 0.1})`,
    }));
    let animationId;
    function animate() {
      ctx.clearRect(0, 0, w, h);
      for (let dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI);
        ctx.fillStyle = dot.color;
        ctx.fill();
        dot.x += dot.dx;
        dot.y += dot.dy;
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

  const [code, setCode] = useState("");
  const { id } = useParams();
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [editorWidth, setEditorWidth] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const dividerRef = useRef(null);
  const isResizing = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to access the editor!");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadProject = async () => {
      setIsLoading(true);
      try {
        const data = await makeApiCall("/getProject", {
          method: "POST",
          body: JSON.stringify({
            token: token,
            projectId: id,
          }),
        });

        if (data.success) {
          setCode(data.project.code || "");
          setData(data.project);
        } else {
          toast.error(data.msg);
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        toast.error("Failed to load project.");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const saveProject = async () => {
    setIsSaving(true);
    try {
      const data = await makeApiCall("/saveProject", {
        method: "POST",
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          projectId: id,
          code: code.trim(),
        }),
      });

      if (data.success) {
        toast.success(data.msg);
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error("Failed to save project:", error);
      toast.error("Failed to save the project.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleSaveShortcut = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsAIModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [code]);

  // Judge0 CE language ID mapping
  const getJudge0LanguageId = (language) => {
    const languageMap = {
      python: 100, // Python 3.12.5
      javascript: 102, // Node.js 22.08.0
      java: 91, // Java JDK 17.0.6
      cpp: 105, // C++ GCC 14.1.0
      c: 103, // C GCC 14.1.0
      go: 107, // Go 1.23.5
      bash: 46, // Bash 5.0.0
    };
    return languageMap[language] || 100;
  };

  const runProject = () => {
    if (!data) {
      toast.error("Project data not loaded yet!");
      return;
    }

    setIsRunning(true);

    const languageId = getJudge0LanguageId(data.projLanguage);

    // Submit code to Judge0 CE
    fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: "",
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.stdout) {
          setOutput(result.stdout);
          setError(false);
        } else if (result.stderr) {
          setOutput(result.stderr);
          setError(true);
        } else if (result.compile_output) {
          setOutput(result.compile_output);
          setError(true);
        } else if (result.message) {
          setOutput(result.message);
          setError(true);
        } else {
          setOutput("No output");
          setError(false);
        }
      })
      .catch(() => setOutput("Error executing code."))
      .finally(() => setIsRunning(false));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    setIsDragging(true);

    const handleMouseMove = (event) => {
      if (isResizing.current) {
        const newWidth = (event.clientX / window.innerWidth) * 100;
        if (newWidth > 30 && newWidth < 70) {
          setEditorWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleAskAI = async () => {
    setAiLoading(true);
    setAiError("");
    setAiResponse("");

    try {
      const result = await makeApiCall("/askAI", {
        method: "POST",
        body: {
          code: code,
          question: aiQuestion,
          language: data?.projLanguage || "javascript",
          projectId: id,
        },
      });

      if (result.success) {
        setAiResponse(result.response);
      } else {
        setAiError(result.msg);
      }
    } catch (err) {
      console.error("AI request failed:", err);
      setAiError("Failed to connect to AI service. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCloseAIModal = () => {
    setIsAIModalOpen(false);
    setAiError("");
    setAiResponse("");
  };

  return (
    <>
      <NavbarNew darkMode={darkMode} setDarkMode={setDarkMode} />
      <motion.div className="flex flex-col min-h-screen bg-[#0F172A] pt-20">
        <div className="bg-[#1E293B] text-[#E2E8F0] text-lg font-semibold p-4 text-center shadow-md">
          {data ? data.name : "Loading..."}
        </div>

        <div className="flex-1 flex px-6 py-2">
          <div
            className={`flex-1 rounded-2xl shadow-2xl p-2 md:p-4 flex min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] border-4 bg-clip-padding transition-colors duration-500 ${
              darkMode
                ? "bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-transparent"
                : "bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] border-[#c7d2fe]"
            }`}
            style={
              darkMode
                ? { boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }
                : { boxShadow: "0 8px 32px 0 rgba(200, 220, 255, 0.18)" }
            }
          >
            <div
              className="h-full flex flex-col"
              style={{ width: `${editorWidth}%` }}
            >
              <h2
                className={`text-2xl sm:text-3xl font-extrabold bg-clip-text drop-shadow-lg mb-2 pl-2 animate-pulse ${
                  darkMode
                    ? "text-transparent bg-gradient-to-r from-[#a855f7] via-[#818cf8] to-[#38bdf8]"
                    : "text-transparent bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#818cf8]"
                }`}
              >
                Input
              </h2>
              <div
                className={`h-full rounded-xl border-2 shadow-xl overflow-hidden flex-1 transition-colors duration-500 ${
                  darkMode
                    ? "border-[#3B82F6] bg-[#111827]/80"
                    : "border-[#818cf8] bg-white/80"
                }`}
              >
                <Editor2
                  onChange={(newCode) => setCode(newCode || "")}
                  theme={darkMode ? "vs-dark" : "light"}
                  height="100%"
                  language={data?.projLanguage || "python"}
                  value={code}
                  options={{
                    fontSize: 18,
                    minimap: { enabled: true },
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    fontFamily: "Fira Mono, monospace",
                    smoothScrolling: true,
                  }}
                />
              </div>
            </div>
            <div
              ref={dividerRef}
              onMouseDown={handleMouseDown}
              className={`w-2 cursor-ew-resize mx-1 md:mx-3 rounded-md shadow-lg transition-colors duration-500 ${
                darkMode
                  ? "bg-gradient-to-b from-[#a855f7] to-[#38bdf8]"
                  : "bg-gradient-to-b from-[#818cf8] to-[#6366f1]"
              }`}
            ></div>
            <div
              className="flex flex-col h-full"
              style={{ width: `${100 - editorWidth}%` }}
            >
              <h2
                className={`text-2xl sm:text-3xl font-extrabold bg-clip-text drop-shadow-lg mb-2 pl-2 animate-pulse ${
                  darkMode
                    ? "text-transparent bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#a855f7]"
                    : "text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#38bdf8]"
                }`}
              >
                Output
              </h2>
              <pre
                className={`flex-1 p-4 text-base font-mono rounded-xl shadow-inner border-2 transition-colors duration-500 overflow-auto ${
                  error
                    ? "text-[#F87171]"
                    : darkMode
                      ? "text-[#34D399]"
                      : "text-[#059669]"
                } ${
                  darkMode
                    ? "bg-[#1E293B]/90 border-[#818cf8]"
                    : "bg-[#f1f5f9]/90 border-[#c7d2fe]"
                }`}
              >
                {output || "Run code to see output..."}
              </pre>
              <div className="mt-4 flex gap-3 px-2 pb-2">
                <motion.button
                  className={`font-semibold py-2 px-6 rounded-lg shadow-lg transition-all animate-pulse text-base sm:text-lg ${
                    darkMode
                      ? "bg-[#a855f7] hover:bg-[#7c3aed] text-white"
                      : "bg-[#6366f1] hover:bg-[#818cf8] text-white"
                  }`}
                  onClick={runProject}
                  disabled={isRunning}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRunning ? "Running..." : "Run Code"}
                </motion.button>
                <motion.button
                  className={`font-semibold py-2 px-6 rounded-lg shadow-lg transition-all text-base sm:text-lg ${
                    darkMode
                      ? "bg-[#22D3EE] hover:bg-[#0E7490] text-[#0F172A]"
                      : "bg-[#818cf8] hover:bg-[#6366f1] text-[#0F172A]"
                  }`}
                  onClick={saveProject}
                  disabled={isSaving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSaving ? "Saving..." : "Save Code"}
                </motion.button>
                <motion.button
                  className={`font-semibold py-2 px-6 rounded-lg shadow-lg transition-all text-base sm:text-lg ${
                    darkMode
                      ? "bg-[#6366F1] hover:bg-[#4338CA] text-white"
                      : "bg-[#38bdf8] hover:bg-[#818cf8] text-white"
                  }`}
                  onClick={() => setIsAIModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ASK AI
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Modal */}
        <Dialog
          open={isAIModalOpen}
          onClose={handleCloseAIModal}
          className="fixed z-50 inset-0 overflow-y-auto"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="relative bg-[#1E293B] rounded-xl shadow-2xl max-w-2xl w-full mx-auto p-8 z-50 border border-[#3B82F6]">
              <button
                className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#3B82F6] transition-colors"
                onClick={handleCloseAIModal}
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-[#E2E8F0] mb-6">
                Ask AI for Code Analysis
              </h2>
              <div className="mb-6">
                <label className="block text-[#94A3B8] text-sm mb-2 font-medium">
                  Your Question (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded bg-[#0F172A] border border-[#334155] text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] min-h-[80px] resize-none"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="💭 Ask me anything about your code! Try:&#10;• 'Explain how this works'&#10;• 'Find bugs or improvements'&#10;• 'Optimize performance'&#10;• 'Add error handling'&#10;• 'Convert to async/await'&#10;&#10;Leave empty for comprehensive analysis!"
                />
                <p className="text-xs text-[#64748B] mt-1">
                  💡 Leave empty for automatic code analysis, or ask specific
                  questions about your code
                </p>
              </div>
              <button
                className="w-full bg-gradient-to-r from-[#3B82F6] to-[#6366F1] hover:from-[#2563EB] hover:to-[#4338CA] text-white font-semibold py-3 rounded-lg transition-all duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                onClick={handleAskAI}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing Code...
                  </span>
                ) : (
                  "✨ Analyze with Claude AI"
                )}
              </button>
              {aiError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <svg
                      className="h-5 w-5 text-red-400 mt-0.5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-200 text-sm">{aiError}</span>
                  </div>
                </div>
              )}
              {aiResponse && (
                <div className="bg-[#0F172A] border border-[#334155] rounded-lg p-4 mt-2 max-h-80 overflow-y-auto">
                  <div className="flex items-center mb-3 pb-2 border-b border-[#334155]">
                    <svg
                      className="h-5 w-5 text-[#3B82F6] mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L3 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-1.254.145a1 1 0 11-.992-1.736L14.984 6l-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.723V12a1 1 0 11-2 0v-1.277l-1.246-.855a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.277l1.246.855a1 1 0 01.372 1.364l-1.75 1A.996.996 0 013 16v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a.996.996 0 01-.52.878l-1.75 1a1 1 0 11-.992-1.736L16 14.723V12a1 1 0 011-1zm-9.618 4.504a1 1 0 01.372-1.364L9 13.848l1.254.716a1 1 0 11-.992 1.736l-1.75-1a1 1 0 01-.372-1.364z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-[#3B82F6] font-semibold text-base">
                      🤖 Claude AI Analysis
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiResponse)}
                      className="ml-auto text-[#64748B] hover:text-[#3B82F6] transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div
                    className="text-[#E2E8F0] whitespace-pre-wrap text-sm leading-relaxed font-mono"
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      lineHeight: "1.6",
                    }}
                  >
                    {aiResponse}
                  </div>
                </div>
              )}
              <div className="text-xs text-[#64748B] mt-3 flex items-center">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Powered by Anthropic Claude AI. Ready to analyze your code
                instantly!
              </div>
            </div>
          </div>
        </Dialog>

        <div className="h-16 bg-[#1E293B] text-[#E2E8F0] flex items-center justify-center text-sm mt-6">
          © 2025 D CODE IDE. All rights reserved.
        </div>
      </motion.div>

      {/* Live Animated Background for the entire editor page */}
      <canvas
        id="bg-animated-editor"
        className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      />
    </>
  );
};

export default Editor;
