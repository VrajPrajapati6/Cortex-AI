import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lock, Mail, User, ArrowRight, X, Sparkles, AlertCircle } from "lucide-react";

export const AuthModal = ({ isOpen, onClose, onSuccess, isDark = true }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(formData.email, formData.password);
      } else {
        if (!formData.username.trim()) {
          throw new Error("Username is required.");
        }
        await register(formData.username, formData.email, formData.password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all relative ${
          isDark
            ? "bg-[#0B0C10] border-zinc-800 text-zinc-100 shadow-black/80"
            : "bg-white border-zinc-200 text-zinc-900 shadow-xl"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg border transition-all ${
            isDark
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black"
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700 text-[10px] font-mono font-bold tracking-widest uppercase mb-3 text-zinc-300">
            <Sparkles className="w-3 h-3 text-white" />
            <span>CORTEX AUTHENTICATION</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading font-black tracking-tight mb-1">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h3>
          <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {mode === "login"
              ? "Sign in to access the Cortex Observability Platform"
              : "Sign up to monitor microservices and ML predictions"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          className={`flex rounded-xl p-1 mb-6 border ${
            isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-zinc-100 border-zinc-200"
          }`}
        >
          <button
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-heading font-extrabold uppercase rounded-lg transition-all ${
              mode === "login"
                ? isDark
                  ? "bg-white text-black shadow-md"
                  : "bg-black text-white shadow-md"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-heading font-extrabold uppercase rounded-lg transition-all ${
              mode === "register"
                ? isDark
                  ? "bg-white text-black shadow-md"
                  : "bg-black text-white shadow-md"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className={`block text-[11px] font-mono font-bold uppercase mb-1.5 ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}>
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. Alex SRE"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-xs font-sans border outline-none transition-all ${
                    isDark
                      ? "bg-[#050507] border-zinc-800 text-zinc-100 focus:border-zinc-500"
                      : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-black"
                  }`}
                  required={mode === "register"}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-[11px] font-mono font-bold uppercase mb-1.5 ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-zinc-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-xs font-sans border outline-none transition-all ${
                  isDark
                    ? "bg-[#050507] border-zinc-800 text-zinc-100 focus:border-zinc-500"
                    : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-black"
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-[11px] font-mono font-bold uppercase mb-1.5 ${
              isDark ? "text-zinc-400" : "text-zinc-600"
            }`}>
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-zinc-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-xs font-sans border outline-none transition-all ${
                  isDark
                    ? "bg-[#050507] border-zinc-800 text-zinc-100 focus:border-zinc-500"
                    : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-black"
                }`}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-heading font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg mt-2 ${
              isDark
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-black text-white hover:bg-zinc-800"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <span>{loading ? "AUTHENTICATING..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
