import React, { useState } from "react";
import { HeroAiBackgroundCanvas } from "./HeroAiBackgroundCanvas";
import {
  Cpu,
  Database,
  Layers,
  Terminal,
  Zap,
  ShieldCheck,
  Bot,
  Trash2,
  BarChart3,
  Server,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  RefreshCw,
  Sun,
  Moon,
  ArrowDown,
  Activity,
  GitBranch,
  Network,
  TrendingUp,
  LineChart,
  Layout,
  Radio,
  FileSearch,
  KeyRound
} from "lucide-react";

export const LandingPage = ({ onLaunchApp }) => {
  const [activeTab, setActiveTab] = useState("ml");
  const [theme, setTheme] = useState("dark"); // "dark" | "light"

  const isDark = theme === "dark";

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 font-sans selection:bg-zinc-800 selection:text-white ${
        isDark ? "bg-[#050507] text-zinc-100" : "bg-[#F8F9FA] text-zinc-900"
      }`}
    >
      {/* ========================================================================= */}
      {/* HEADER / NAVIGATION BAR (Sleek h-14 = 3.5rem height)                      */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-50 h-14 border-b backdrop-blur-xl transition-colors ${
          isDark
            ? "bg-[#121318]/95 border-zinc-800 text-zinc-100 shadow-2xl shadow-black/80"
            : "bg-white/95 border-zinc-200 text-zinc-900 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-heading font-black text-sm border ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 text-white"
                  : "bg-zinc-900 border-zinc-900 text-white shadow-sm"
              }`}
            >
              C
            </div>
            <div className="flex items-center">
              <span className="font-heading font-black text-lg tracking-tight uppercase">
                CORTEX
              </span>
            </div>
          </div>

          {/* Minimal Actions (Theme Toggle + Launch Button) */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg border transition-all ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  : "bg-zinc-100 border-zinc-300 text-zinc-700 hover:text-black hover:border-zinc-400"
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onLaunchApp}
              className={`px-4 py-2 rounded-lg font-heading font-extrabold text-xs tracking-wide uppercase transition-all border flex items-center gap-2 shadow-lg ${
                isDark
                  ? "bg-white text-black border-white hover:bg-zinc-200"
                  : "bg-black text-white border-black hover:bg-zinc-800"
              }`}
            >
              <span>ENTER PLATFORM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION (TAKES 100% OF INITIAL WINDOW FOLD — h-[calc(100vh-3.5rem)])  */}
      {/* ========================================================================= */}
      <section className={`relative h-[calc(100vh-3.5rem)] flex flex-col justify-center overflow-hidden border-b ${
        isDark ? "border-zinc-800/80" : "border-zinc-200"
      }`}>
        {/* Subtle AI Fluid Wave Background Canvas */}
        <HeroAiBackgroundCanvas isDark={isDark} />

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto py-10 lg:py-16">
          <div className="max-w-4xl">
            {/* Minimal Mono Label */}
            <div className={`text-[11px] font-mono font-bold tracking-widest uppercase mb-4 ${
              isDark ? "text-zinc-500" : "text-zinc-600"
            }`}>
              AUTONOMOUS OBSERVABILITY & ROOT CAUSE ANALYSIS ENGINE
            </div>

            {/* Perfect Goldilocks Medium Headline Size */}
            <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[1.06] mb-6 sm:mb-8 ${
              isDark ? "text-zinc-100" : "text-zinc-950"
            }`}>
              Engineering observability that scales with intelligence.
            </h1>

            {/* Medium Sub-headline */}
            <p className={`text-base sm:text-xl font-normal leading-relaxed max-w-3xl mb-8 sm:mb-10 ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              Cortex continuously evaluates system health across microservices using 
              <strong className={isDark ? "text-zinc-200 font-bold font-heading" : "text-zinc-900 font-extrabold font-heading"}> smart trace tracking</strong>, 
              <strong className={isDark ? "text-zinc-200 font-bold font-heading" : "text-zinc-900 font-extrabold font-heading"}> 3 Machine Learning models for early issue detection</strong>, 
              <strong className={isDark ? "text-zinc-200 font-bold font-heading" : "text-zinc-900 font-extrabold font-heading"}> an AI Copilot for step-by-step fix guides</strong>, and an 
              <strong className={isDark ? "text-zinc-200 font-bold font-heading" : "text-zinc-900 font-extrabold font-heading"}> automated 140-point root cause scoring engine</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onLaunchApp}
                className={`px-8 py-4 rounded-lg font-heading font-extrabold text-xs tracking-wider uppercase transition-all flex items-center gap-3 ${
                  isDark
                    ? "bg-white text-black hover:bg-zinc-200 shadow-2xl"
                    : "bg-black text-white hover:bg-zinc-800 shadow-2xl"
                }`}
              >
                <span>Launch Live Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: QUANTITATIVE METRICS BANNER (Revealed on Scroll Below Hero)    */}
      {/* ========================================================================= */}
      <section
        className={`py-12 border-b relative z-10 ${
          isDark ? "bg-[#0B0C10] border-zinc-800/90" : "bg-white border-zinc-200 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className={`p-3 border-l-2 ${isDark ? "border-zinc-700" : "border-zinc-300"}`}>
              <div className={`text-2xl font-extrabold font-heading mb-1 tracking-tight ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                200,000
              </div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}>
                System Samples
              </div>
            </div>

            <div className={`p-3 border-l-2 ${isDark ? "border-zinc-700" : "border-zinc-300"}`}>
              <div className={`text-2xl font-extrabold font-heading mb-1 tracking-tight ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                3 MODELS
              </div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}>
                Machine Learning Pipeline
              </div>
            </div>

            <div className={`p-3 border-l-2 ${isDark ? "border-zinc-700" : "border-zinc-300"}`}>
              <div className={`text-2xl font-extrabold font-heading mb-1 tracking-tight ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                140 PTS
              </div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}>
                Root Cause Rubric Score
              </div>
            </div>

            <div className={`p-3 border-l-2 ${isDark ? "border-zinc-700" : "border-zinc-300"}`}>
              <div className={`text-2xl font-extrabold font-heading mb-1 tracking-tight ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                10 SERVICES
              </div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}>
                Microservices
              </div>
            </div>

            <div className={`p-3 border-l-2 ${isDark ? "border-zinc-700" : "border-zinc-300"}`}>
              <div className={`text-2xl font-extrabold font-heading mb-1 tracking-tight ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                3072D
              </div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}>
                AI Vector Search
              </div>
            </div>

            <div className={`p-3 border-l-2 ${isDark ? "border-zinc-700" : "border-zinc-300"}`}>
              <div className={`text-2xl font-extrabold font-heading mb-1 tracking-tight ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>
                1,000
              </div>
              <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                isDark ? "text-zinc-500" : "text-zinc-500"
              }`}>
                Auto Log Limit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: LINEAR STEP-BY-STEP PIPELINE ARCHITECTURE                     */}
      {/* ========================================================================= */}
      <section className={`py-20 border-b ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Subtitle */}
          <div className="max-w-3xl mb-16 text-center mx-auto">
            <div className={`text-[11px] font-mono font-bold tracking-widest uppercase mb-2 ${
              isDark ? "text-zinc-500" : "text-zinc-600"
            }`}>
              01. SYSTEM EXECUTION FLOW
            </div>
            <h2 className={`text-3xl sm:text-5xl font-heading font-extrabold tracking-tight mb-3 ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}>
              Pipeline Architecture
            </h2>
            <p className={`text-sm sm:text-base font-sans ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              A clean step-by-step execution flow from incoming requests to automated root cause discovery.
            </p>
          </div>

          {/* Sequential Linear Boxes (Step-by-Step) */}
          <div className="flex flex-col items-center gap-4">

            {/* STEP 01 */}
            <div className={`w-full p-6 sm:p-8 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              isDark
                ? "bg-[#0B0C10] border-zinc-800 hover:border-zinc-700 shadow-xl"
                : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                  isDark ? "bg-zinc-900 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-300 text-zinc-900"
                }`}>
                  01
                </div>
                <div>
                  <div className={`text-[10px] font-mono font-bold uppercase mb-0.5 ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}>STEP 01 — REQUEST INCOMING</div>
                  <h4 className={`font-heading font-extrabold text-base ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}>Client Request & Trace ID Generation</h4>
                  <p className={`text-xs font-sans mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}>Assigns a unique request ID and parent span ID to track execution speed across services.</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-3 py-1.5 rounded border font-bold shrink-0 ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-700"
              }`}>
                HTTP INGRESS
              </span>
            </div>

            {/* Arrow Connector Line */}
            <div className="flex justify-center my-[-2px]">
              <ArrowDown className={`w-5 h-5 animate-bounce ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
            </div>

            {/* STEP 02 */}
            <div className={`w-full p-6 sm:p-8 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              isDark
                ? "bg-[#0B0C10] border-zinc-800 hover:border-zinc-700 shadow-xl"
                : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                  isDark ? "bg-zinc-900 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-300 text-zinc-900"
                }`}>
                  02
                </div>
                <div>
                  <div className={`text-[10px] font-mono font-bold uppercase mb-0.5 ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}>STEP 02 — SERVICE NETWORK</div>
                  <h4 className={`font-heading font-extrabold text-base ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}>Microservice Execution Path</h4>
                  <p className={`text-xs font-sans mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}>Routes requests through User, Order, Payment, Auth, Search, Product, Inventory, Notification APIs, Redis, & PostgreSQL.</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-3 py-1.5 rounded border font-bold shrink-0 ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-700"
              }`}>
                10 SERVICES
              </span>
            </div>

            {/* Arrow Connector Line */}
            <div className="flex justify-center my-[-2px]">
              <ArrowDown className={`w-5 h-5 animate-bounce ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
            </div>

            {/* STEP 03 */}
            <div className={`w-full p-6 sm:p-8 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              isDark
                ? "bg-[#0B0C10] border-zinc-800 hover:border-zinc-700 shadow-xl"
                : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                  isDark ? "bg-zinc-900 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-300 text-zinc-900"
                }`}>
                  03
                </div>
                <div>
                  <div className={`text-[10px] font-mono font-bold uppercase mb-0.5 ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}>STEP 03 — SYSTEM ENGINE</div>
                  <h4 className={`font-heading font-extrabold text-base ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}>System Monitoring & 5 Background Workers</h4>
                  <p className={`text-xs font-sans mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}>Runs automated log recording, system metrics collection, latency tracking, and a 30-second 1,000-log cleanup worker.</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-3 py-1.5 rounded border font-bold shrink-0 ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-700"
              }`}>
                NODE EXPRESS
              </span>
            </div>

            {/* Arrow Connector Line */}
            <div className="flex justify-center my-[-2px]">
              <ArrowDown className={`w-5 h-5 animate-bounce ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
            </div>

            {/* STEP 04 */}
            <div className={`w-full p-6 sm:p-8 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              isDark
                ? "bg-[#0B0C10] border-zinc-800 hover:border-zinc-700 shadow-xl"
                : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                  isDark ? "bg-zinc-900 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-300 text-zinc-900"
                }`}>
                  04
                </div>
                <div>
                  <div className={`text-[10px] font-mono font-bold uppercase mb-0.5 ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}>STEP 04 — AI PREDICTION</div>
                  <h4 className={`font-heading font-extrabold text-base ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}>3 Machine Learning Models</h4>
                  <p className={`text-xs font-sans mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}>Evaluates incoming data to predict anomalies (100% accuracy), upcoming incident types (99.93%), and future resource trends.</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-3 py-1.5 rounded border font-bold shrink-0 ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-700"
              }`}>
                FASTAPI AI
              </span>
            </div>

            {/* Arrow Connector Line */}
            <div className="flex justify-center my-[-2px]">
              <ArrowDown className={`w-5 h-5 animate-bounce ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
            </div>

            {/* STEP 05 */}
            <div className={`w-full p-6 sm:p-8 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              isDark
                ? "bg-[#0B0C10] border-zinc-800 hover:border-zinc-700 shadow-xl"
                : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                  isDark ? "bg-zinc-900 border-zinc-700 text-white" : "bg-zinc-100 border-zinc-300 text-zinc-900"
                }`}>
                  05
                </div>
                <div>
                  <div className={`text-[10px] font-mono font-bold uppercase mb-0.5 ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}>STEP 05 — AI COPILOT REPAIR</div>
                  <h4 className={`font-heading font-extrabold text-base ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}>Neon Vector DB & Gemini AI Copilot</h4>
                  <p className={`text-xs font-sans mt-1 ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}>Searches company incident guides using vector similarity search to instantly suggest exact steps to fix issues.</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-3 py-1.5 rounded border font-bold shrink-0 ${
                isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-700"
              }`}>
                NEON VECTOR DB
              </span>
            </div>

            {/* Arrow Connector Line */}
            <div className="flex justify-center my-[-2px]">
              <ArrowDown className={`w-5 h-5 animate-bounce ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
            </div>

            {/* STEP 06 */}
            <div className={`w-full p-6 sm:p-8 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              isDark
                ? "bg-zinc-900 border-zinc-700 shadow-2xl"
                : "bg-black border-black text-white shadow-xl"
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white text-black font-mono font-black text-xs flex items-center justify-center shrink-0">
                  06
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase mb-0.5">STEP 06 — ROOT CAUSE & LIVE DASHBOARD</div>
                  <h4 className="font-heading font-extrabold text-base text-white">140-Point Root Cause Engine & Real-Time Stream</h4>
                  <p className="text-xs text-zinc-300 font-sans mt-1">Calculates exact fault location based on evidence and streams live system status and warnings directly to the UI.</p>
                </div>
              </div>
              <span className="text-[10px] font-heading font-extrabold px-3 py-1.5 rounded bg-white text-black uppercase tracking-wider shrink-0">
                LIVE STREAM
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: 3 MACHINE LEARNING MODELS & ENGINE MODULES                    */}
      {/* ========================================================================= */}
      <section id="components" className={`py-16 border-b ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className={`text-[11px] font-mono font-bold tracking-widest uppercase mb-2 ${
              isDark ? "text-zinc-500" : "text-zinc-600"
            }`}>
              02. MACHINE LEARNING ARCHITECTURE
            </div>
            <h2 className={`text-2xl sm:text-4xl font-heading font-extrabold tracking-tight mb-3 ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}>
              3 Machine Learning Models
            </h2>
            <p className={`leading-relaxed text-sm font-sans ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              Cortex uses three specialized Machine Learning models that analyze system metrics in real time to detect, predict, and prevent outages.
            </p>
          </div>

          {/* Component Selection Tabs */}
          <div className={`flex flex-wrap gap-2 mb-8 border-b pb-4 font-heading ${
            isDark ? "border-zinc-800" : "border-zinc-200"
          }`}>
            <button
              onClick={() => setActiveTab("ml")}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs tracking-wider uppercase transition-all border ${
                activeTab === "ml"
                  ? isDark
                    ? "bg-white text-black border-white shadow-md"
                    : "bg-black text-white border-black shadow-md"
                  : isDark
                  ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
              }`}
            >
              1. 3 Machine Learning Models
            </button>

            <button
              onClick={() => setActiveTab("rag")}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs tracking-wider uppercase transition-all border ${
                activeTab === "rag"
                  ? isDark
                    ? "bg-white text-black border-white shadow-md"
                    : "bg-black text-white border-black shadow-md"
                  : isDark
                  ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
              }`}
            >
              2. Neon RAG & Gemini Copilot
            </button>

            <button
              onClick={() => setActiveTab("workers")}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs tracking-wider uppercase transition-all border ${
                activeTab === "workers"
                  ? isDark
                    ? "bg-white text-black border-white shadow-md"
                    : "bg-black text-white border-black shadow-md"
                  : isDark
                  ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
              }`}
            >
              3. System Monitoring & Log Cleanup
            </button>

            <button
              onClick={() => setActiveTab("rca")}
              className={`px-4 py-2 rounded-lg font-extrabold text-xs tracking-wider uppercase transition-all border ${
                activeTab === "rca"
                  ? isDark
                    ? "bg-white text-black border-white shadow-md"
                    : "bg-black text-white border-black shadow-md"
                  : isDark
                  ? "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-zinc-900"
              }`}
            >
              4. 140-Point Root Cause Scoring
            </button>
          </div>

          {/* Tab Content Display */}
          <div
            className={`p-8 rounded-xl border ${
              isDark ? "bg-[#0B0C10] border-zinc-800/90" : "bg-white border-zinc-200 shadow-sm"
            }`}
          >
            {/* TAB 1: 3 ML MODELS */}
            {activeTab === "ml" && (
              <div>
                <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}>
                  <div>
                    <h4 className={`text-lg font-heading font-extrabold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      3-Model Machine Learning Engine
                    </h4>
                    <p className={`text-xs font-sans ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Tested on 200,000 real-time system samples with sub-3.2ms response speeds.
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded border font-bold ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                  }`}>
                    FASTAPI PORT 8000
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs leading-relaxed font-sans">
                  {/* Model 1 */}
                  <div className={`p-5 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold text-sm mb-1 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>MODEL 1 — ANOMALY DETECTION</div>
                    <div className="text-[10px] font-mono text-zinc-500 font-bold mb-3 uppercase">Target: Anomaly (Yes / No)</div>
                    <p className={`text-xs leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Detects if system behavior starts deviating from expected normal patterns before failure occurs. Achieved <strong>100.00% accuracy</strong> on benchmark testing.
                    </p>
                  </div>

                  {/* Model 2 */}
                  <div className={`p-5 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold text-sm mb-1 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>MODEL 2 — INCIDENT PREDICTION</div>
                    <div className="text-[10px] font-mono text-zinc-500 font-bold mb-3 uppercase">Target: CPU, Memory, or Log Spikes</div>
                    <p className={`text-xs leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Predicts the exact upcoming incident category (CPU bottleneck, Memory leak, or Log error flood) with <strong>99.93% accuracy</strong>.
                    </p>
                  </div>

                  {/* Model 3 */}
                  <div className={`p-5 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold text-sm mb-1 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>MODEL 3 — RESOURCE FORECASTING</div>
                    <div className="text-[10px] font-mono text-zinc-500 font-bold mb-3 uppercase">Target: Future CPU, RAM, & Latency</div>
                    <p className={`text-xs leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Forecasts future infrastructure load, predicting expected CPU usage, RAM footprint, and response latency for the next operational window.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RAG COPILOT */}
            {activeTab === "rag" && (
              <div>
                <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}>
                  <div>
                    <h4 className={`text-lg font-heading font-extrabold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      Cortex Copilot — Neon Vector AI Engine
                    </h4>
                    <p className={`text-xs font-sans ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Combines PostgreSQL vector search with Google Gemini AI for instant incident diagnosis.
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded border font-bold ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                  }`}>
                    NEON VECTOR DB
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed font-sans">
                  <div className="space-y-4">
                    <p className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                      Cortex converts engineering incident guidebooks into smart searchable AI vectors stored inside Neon PostgreSQL database.
                    </p>
                    <div className={`p-4 rounded-lg border font-mono text-[11px] ${
                      isDark ? "bg-[#050507] border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-800"
                    }`}>
                      <span className={isDark ? "text-zinc-400 font-bold" : "text-zinc-500 font-bold"}>// Vector Similarity Search Query</span>
                      <br />
                      SELECT title, content, 1 - (embedding &lt;=&gt; $1::vector) AS similarity
                      <br />
                      FROM runbooks ORDER BY embedding &lt;=&gt; $1::vector LIMIT 1;
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className={`font-heading font-extrabold text-sm ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      Offline Mode Support
                    </h5>
                    <p className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                      If the external AI key is missing or quota limit is reached, Cortex smoothly switches to a local vector simulation engine to ensure continuous demonstration review.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WORKERS & CLEANUP */}
            {activeTab === "workers" && (
              <div>
                <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}>
                  <div>
                    <h4 className={`text-lg font-heading font-extrabold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      5 Background System Workers
                    </h4>
                    <p className={`text-xs font-sans ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Automated System Monitoring & Log Cleanup Heartbeat
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded border font-bold ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                  }`}>
                    30S AUTO CLEANUP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
                  <div className={`p-5 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold mb-2 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      Log Cleanup Worker (30s Interval)
                    </div>
                    <p className={`leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Monitors log storage table. When log entries exceed <strong>1,000 records</strong>, automatically deletes older rows to maintain fast database response times.
                    </p>
                  </div>

                  <div className={`p-5 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold mb-2 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      Trace Log Generator (3s Interval)
                    </div>
                    <p className={`leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Generates request traces connecting user API calls, status codes, and execution times across all services in real time.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RCA SCORING */}
            {activeTab === "rca" && (
              <div>
                <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}>
                  <div>
                    <h4 className={`text-lg font-heading font-extrabold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      140-Point Root Cause Scoring Engine
                    </h4>
                    <p className={`text-xs font-sans ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Automated Evidence Scoring Rules for Pinpointing System Faults
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded border font-bold ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                  }`}>
                    140 PTS RUBRIC
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className={`p-4 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold mb-1 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      1. First to Fail (+30 PTS)
                    </div>
                    <p className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Awarded to the service that logged the chronologically earliest error.
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold mb-1 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      2. Upstream Network Depth (+25 PTS)
                    </div>
                    <p className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Awarded to deep underlying database or core infrastructure services.
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold mb-1 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      3. Downstream Error Blast Radius (+40 PTS)
                    </div>
                    <p className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Awarded when failure spreads upward and breaks connecting services.
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    isDark ? "bg-[#050507] border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}>
                    <div className={`font-heading font-extrabold mb-1 ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}>
                      4. Latency Spike Multiplier (+25+20 PTS)
                    </div>
                    <p className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      Awarded when execution latency spikes to over double the normal baseline.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: TELEMETRY MATRIX & DATA ANALYZED                              */}
      {/* ========================================================================= */}
      <section className={`py-16 border-b ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className={`text-[11px] font-mono font-bold tracking-widest uppercase mb-2 ${
              isDark ? "text-zinc-500" : "text-zinc-600"
            }`}>
              03. SYSTEM PERFORMANCE METRICS
            </div>
            <h2 className={`text-2xl sm:text-4xl font-heading font-extrabold tracking-tight mb-3 ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}>
              44 System Performance Indicators
            </h2>
            <p className={`leading-relaxed text-sm font-sans ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              Every monitoring window collects 44 performance indicators including traffic volume, CPU load, memory usage, latency spikes, and error counts.
            </p>
          </div>

          {/* Telemetry Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono text-xs">
            <div className={`p-6 rounded-xl border transition-all ${
              isDark ? "bg-[#0B0C10] border-zinc-800/80 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <h4 className={`font-heading font-extrabold text-sm mb-3 uppercase ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>Traffic & Volume</h4>
              <ul className={`space-y-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                <li>• request_volume</li>
                <li>• successful_requests</li>
                <li>• failed_requests</li>
                <li>• success_rate (%)</li>
                <li>• error_rate (%)</li>
              </ul>
            </div>

            <div className={`p-6 rounded-xl border transition-all ${
              isDark ? "bg-[#0B0C10] border-zinc-800/80 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <h4 className={`font-heading font-extrabold text-sm mb-3 uppercase ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>Resources & Latency</h4>
              <ul className={`space-y-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                <li>• cpu_usage (%)</li>
                <li>• memory_usage (MB)</li>
                <li>• average_latency (ms)</li>
                <li>• p95_latency (ms)</li>
                <li>• p99_latency (ms)</li>
              </ul>
            </div>

            <div className={`p-6 rounded-xl border transition-all ${
              isDark ? "bg-[#0B0C10] border-zinc-800/80 hover:border-zinc-700" : "bg-white border-zinc-300 shadow-sm"
            }`}>
              <h4 className={`font-heading font-extrabold text-sm mb-3 uppercase ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>Logs & Parameters</h4>
              <ul className={`space-y-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                <li>• info_log_count</li>
                <li>• warn_log_count</li>
                <li>• error_log_count</li>
                <li>• retry_count</li>
                <li>• queue_length</li>
              </ul>
            </div>

            <div className={`p-6 rounded-xl border transition-all ${
              isDark ? "bg-[#0B0C10] border-zinc-800/80 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
            }`}>
              <h4 className={`font-heading font-extrabold text-sm mb-3 uppercase ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>Trends & Topology</h4>
              <ul className={`space-y-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                <li>• cpu_trend (Δ %)</li>
                <li>• memory_trend (Δ MB)</li>
                <li>• latency_trend (Δ ms)</li>
                <li>• affected_services_count</li>
                <li>• propagation_depth</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: MICROSERVICES & SCENARIO MATRIX                                 */}
      {/* ========================================================================= */}
      <section className={`py-16 border-b ${isDark ? "border-zinc-800/80" : "border-zinc-200"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className={`text-[11px] font-mono font-bold tracking-widest uppercase mb-2 ${
              isDark ? "text-zinc-500" : "text-zinc-600"
            }`}>
              04. TOPOLOGY & WORKFLOWS
            </div>
            <h2 className={`text-2xl sm:text-4xl font-heading font-extrabold tracking-tight mb-3 ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}>
              10 Monitored Microservices & Storage Engines
            </h2>
            <p className={`leading-relaxed text-sm font-sans ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              Cortex simulates 5 core business workflows and 11 failure scenarios across microservices, relational databases, and Redis key-value cache clusters.
            </p>
          </div>

          {/* Microservices Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "User Service", category: "Gateway API" },
              { name: "Order Service", category: "Domain API" },
              { name: "Payment Service", category: "Financial API" },
              { name: "Search Service", category: "Discovery API" },
              { name: "Auth Service", category: "Identity API" },
              { name: "Product Service", category: "Catalog API" },
              { name: "Inventory Service", category: "Stock API" },
              { name: "Notification Service", category: "Utility API" },
              { name: "Redis Cluster", category: "Cache Engine" },
              { name: "PostgreSQL DB", category: "Relational DB" }
            ].map((svc, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border font-mono text-xs transition-all ${
                  isDark ? "bg-[#0B0C10] border-zinc-800/80 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                }`}
              >
                <div className={`font-heading font-bold mb-1 ${
                  isDark ? "text-zinc-100" : "text-zinc-900"
                }`}>{svc.name}</div>
                <div className="text-[10px] text-zinc-500">{svc.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER & LAUNCH CALL TO ACTION                                            */}
      {/* ========================================================================= */}
      <footer className={`py-14 ${isDark ? "bg-[#121318]" : "bg-zinc-900 text-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold mb-3 tracking-tight">
              Ready to Explore Cortex Observability Platform?
            </h3>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
              Experience real-time microservice topology maps, 3 Machine Learning incident predictions, Neon vector RAG AI chat, and automated 140-point root cause diagnostics.
            </p>

            <button
              onClick={onLaunchApp}
              className="px-8 py-3.5 rounded-lg font-heading font-extrabold text-xs tracking-wider uppercase transition-all shadow-2xl inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200"
            >
              <span>ENTER LIVE DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 font-mono gap-4">
            <div>Cortex Autonomous Observability Platform v2.4</div>
            <div>Built with React, Express, Neon pgvector, Python FastAPI, & 3 Machine Learning Models</div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-zinc-300 transition-colors"
            >
              Back to Top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
