import React from "react";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, RefreshCw } from "lucide-react";

export const Header = ({
  systemStatus = "OPERATIONAL",
  lastUpdated,
  autoRefresh,
  setAutoRefresh,
  countdown,
  onManualRefresh,
  isRefreshing,
  onOpenLanding,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onOpenLanding) {
      onOpenLanding();
    }
  };

  return (
    <header className="sticky top-0 z-50 min-h-[3.5rem] bg-[#121318]/95 border-b border-zinc-800 text-zinc-100 backdrop-blur-xl shadow-2xl shadow-black/80 px-4 sm:px-6">
      <div className="max-w-screen-2xl mx-auto py-2.5 sm:py-0 min-h-[3.5rem] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand Logo & System Status */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm border bg-zinc-900 border-zinc-700 text-white shadow-sm shrink-0">
              C
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono font-black text-lg tracking-tight uppercase text-white">
                CORTEX
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase rounded border ${
                  systemStatus === "CRITICAL"
                    ? "bg-red-950/80 text-red-400 border-red-800/60"
                    : systemStatus === "DEGRADED"
                      ? "bg-yellow-950/80 text-yellow-400 border-yellow-800/60"
                      : "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
                }`}
              >
                {systemStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[10px] text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold tracking-wide uppercase">
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="px-3 py-1.5 text-xs font-bold rounded-lg text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <span>← Guide</span>
            </button>
          )}

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 max-w-[150px] truncate">
                <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {user?.username || user?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/80 border border-zinc-800 hover:border-rose-800/60 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold tracking-wide uppercase">
              Live Connection
            </span>
          </div>

          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
