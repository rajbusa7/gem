import React, { useState } from 'react';
import { useAuth, type UserRole } from '@/lib/auth-context';
import { useLocation, Link } from 'wouter';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck2,
  BarChart3,
  KeyRound,
} from 'lucide-react';

export function LoginPage() {
  const { login, users, currentUser } = useAuth();
  const [, setLocation] = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier.trim()) {
      setError('Please enter your User ID, Username, or Email.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(identifier, password);
      setLoading(false);
      if (result.success) {
        // Redirect Admin directly to admin user panel, or others to overview
        const found = users.find(
          (u) =>
            u.username.toLowerCase() === identifier.trim().toLowerCase() ||
            u.id.toLowerCase() === identifier.trim().toLowerCase() ||
            u.email.toLowerCase() === identifier.trim().toLowerCase()
        );
        if (found?.role === 'Administrator') {
          setLocation('/admin/users');
        } else {
          setLocation('/');
        }
      } else {
        setError(result.error || 'Authentication failed. Please check your credentials.');
      }
    }, 400);
  };

  const handleQuickLogin = (userItem: typeof users[0]) => {
    setIdentifier(userItem.username);
    setPassword(userItem.password || 'admin123');
    setError(null);
    setLoading(true);
    setTimeout(() => {
      login(userItem.username, userItem.password);
      setLoading(false);
      if (userItem.role === 'Administrator') {
        setLocation('/admin/users');
      } else {
        setLocation('/');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand & Hackathon Info */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/60 relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/30">
                G
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                  GeM <span className="text-teal-400">PriceCompare</span>
                </div>
                <div className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase">
                  Procurement Intelligence Portal
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium mb-6">
              <Sparkles size={13} className="text-teal-400" />
              <span>Smart India Hackathon 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
              Transparent, Automated & Fair Public Procurement.
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Verify GeM listed prices against commercial e-marketplaces (Amazon Business, Flipkart, IndiaMART) with intelligent fuzzy matching.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={13} />
                </div>
                <span><strong>Role-Based Access:</strong> Separate workflows for Buyers, Financial Auditors & System Admins.</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 size={13} />
                </div>
                <span><strong>Admin Oversight:</strong> Manage department officers, track access logs & review audit queues.</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">CODENOX</span> · CHARUSAT
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Building2 size={13} /> GeM / SIH-CHA-112
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & Demo Accounts */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-slate-900/60">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Sign In to Workspace</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Enter your User ID / Username and Password to access your desk.
                </p>
              </div>
              {currentUser && (
                <Link
                  href="/"
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-lg"
                >
                  Active: {currentUser.avatarInitials} <ArrowRight size={12} />
                </Link>
              )}
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Authentication Error</strong>
                  <p className="mt-0.5 text-rose-300/90">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  User ID / Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin, riya, or BUY-204"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Demo default: <code className="text-teal-400">admin123</code> / <code className="text-teal-400">buyer123</code></span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-800 border-slate-700 text-teal-500 focus:ring-teal-500/30"
                  />
                  <span>Remember this terminal</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Mode: Use pre-seeded passwords (admin123, buyer123, audit123) or select a quick-login chip below.')}
                  className="text-xs text-teal-400 hover:text-teal-300 transition"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Authorize & Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Preset Chips for SIH Presentation */}
            <div className="mt-7 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <KeyRound size={13} className="text-amber-400" />
                  Quick-Demo Personas (1-Click Login)
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">SIH Demo Mode</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-teal-500/50 transition text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${u.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
                        {u.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white group-hover:text-teal-300 truncate">
                          {u.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {u.role} · <code className="text-slate-400">{u.username}</code>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/70 text-slate-300 font-mono shrink-0 ml-1">
                      {u.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={14} className="text-teal-400" /> Authorized Official Gateway
            </span>
            <span>v2.4.0 · Government e-Marketplace</span>
          </div>
        </div>
      </div>
    </div>
  );
}
