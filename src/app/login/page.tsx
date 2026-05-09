"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Fingerprint, Facebook, Linkedin, ShieldCheck, Eye, EyeOff, Chrome, Apple } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/Logo";


const COLORS = ["#6366f1", "#22d3ee", "#a855f7", "#f59e0b", "#ec4899", "#10b981"];

export default function LoginPage() {
  const router = useRouter();
  const { getInviteByEmail, getMemberByEmail, createWorkspace, joinWorkspace, setCurrentUser } = useStore();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const hasInvite = !!getInviteByEmail(email.trim());

  const handleSocialAuth = (provider: string) => {
    const mockEmail = `demo@${provider.toLowerCase()}.com`;
    const existingUser = getMemberByEmail(mockEmail);
    if (existingUser) {
      setCurrentUser(existingUser);
      router.push("/board");
      return;
    }
    
    // Simulate immediate sign up and workspace creation
    const newMemberBase = {
      id: `u_${Date.now()}`,
      name: `${provider} User`,
      email: mockEmail,
      role: "Workspace Admin",
      initials: provider[0].toUpperCase(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    
    createWorkspace(`${provider} Workspace`, newMemberBase);
    router.push("/board");
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    
    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long for security.");
        return;
      }
      if (!hasInvite && !workspaceName.trim()) {
        setError("Please enter a Workspace Name to create your new workspace.");
        return;
      }

      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const displayName = name.trim();
      const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
      
      const invite = getInviteByEmail(email.trim());

      const newMemberBase = {
        id: `u_${Date.now()}`,
        name: displayName,
        email: email.trim(),
        role: invite ? invite.role : "Workspace Admin",
        initials,
        color: randomColor
      };

      if (invite) {
        joinWorkspace(invite, newMemberBase);
      } else {
        createWorkspace(workspaceName.trim(), newMemberBase);
      }
      
      router.push("/board");
    } else {
      // Sign in
      const existingUser = getMemberByEmail(email.trim());
      if (!existingUser) {
        setError("No account found for this email. Please sign up.");
        return;
      }
      
      setCurrentUser(existingUser);
      router.push("/board");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] dark:bg-[#0a0f1e] flex items-center justify-center p-4 font-sans text-gray-900 dark:text-slate-100 relative transition-colors duration-300">
      {/* Decorative background stripes (optional, subtle) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-200 via-gray-100 to-transparent"></div>
      </div>

      <div className="z-10 max-w-5xl w-full bg-white dark:bg-[#111827] rounded-xl shadow-2xl flex overflow-hidden min-h-[600px] border border-gray-100 dark:border-white/10 transition-colors duration-300">
        
        {/* Left Side: Auth Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10 text-slate-900 dark:text-white">
            <Logo className="h-10 w-10" />
            <span className="text-3xl font-bold tracking-tight">
              teamdock
            </span>
          </div>

          <div className="flex-1 max-w-sm w-full mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {isSignUp ? "Sign up" : "Sign in"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {isSignUp ? "to create your workspace" : "to access TeamDock"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  />
                </div>
              )}
              
              {isSignUp && !hasInvite && (
                <div>
                  <input
                    type="text"
                    placeholder="New Workspace Name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full bg-[#007aff] hover:bg-blue-600 text-white font-bold py-3 rounded-md transition-colors text-sm shadow-sm mt-2"
              >
                {isSignUp ? "Sign Up" : "Next"}
              </button>
            </form>

            {/* Social Logins */}
            {!isSignUp && (
              <div className="mt-8">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3">Sign in using</p>
                <div className="flex gap-2">
                  <button onClick={() => handleSocialAuth('Google')} className="h-10 w-10 flex items-center justify-center rounded bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Sign in with Google">
                    <Chrome className="h-4 w-4 text-red-500" />
                  </button>
                  <button onClick={() => handleSocialAuth('Apple')} className="h-10 w-10 flex items-center justify-center rounded bg-black hover:bg-gray-800 transition-colors" title="Sign in with Apple">
                    <Apple className="h-4 w-4 text-white" />
                  </button>
                  <button onClick={() => handleSocialAuth('Facebook')} className="h-10 w-10 flex items-center justify-center rounded bg-[#1877f2] hover:bg-blue-700 transition-colors" title="Sign in with Facebook">
                    <Facebook className="h-4 w-4 text-white" />
                  </button>
                  <button onClick={() => handleSocialAuth('LinkedIn')} className="h-10 w-10 flex items-center justify-center rounded bg-[#0a66c2] hover:bg-blue-800 transition-colors" title="Sign in with LinkedIn">
                    <Linkedin className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? "Already have a TeamDock account? " : "Don't have a TeamDock account? "}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="text-[#007aff] hover:underline font-medium"
              >
                {isSignUp ? "Sign in" : "Sign up now"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Promo Graphic */}
        <div className="hidden md:flex w-1/2 bg-[#fafbfc] dark:bg-[#0d1117] border-l border-gray-100 dark:border-white/10 flex-col items-center justify-center p-12 text-center relative transition-colors duration-300">
          
          <div className="absolute top-8 right-8">
            <button className="flex items-center gap-2 bg-[#1b25d1] hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md transition-transform hover:scale-105">
              <Fingerprint className="h-4 w-4" /> Try smart sign-in
            </button>
          </div>

          <div className="relative w-64 h-64 mb-8">
            {/* Mockup Illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-40 bg-white border-2 border-gray-800 rounded-xl shadow-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-4 bg-gray-100 border-b-2 border-gray-800 flex items-center px-2 gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                
                <div className="flex flex-col items-center gap-2 mt-4">
                  <ShieldCheck className="h-10 w-10 text-[#007aff]" />
                  <div className="border border-[#007aff] text-[#007aff] px-3 py-1 rounded-full text-xs font-bold bg-blue-50">
                    user@teamdock.io
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg border border-gray-100 animate-bounce" style={{animationDuration: '3s'}}>
              <Fingerprint className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg border border-gray-100 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Passwordless sign-in</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed mb-6">
            Move away from risky passwords and experience one-tap access to TeamDock. Download and install OneAuth.
          </p>

          <button className="text-[#007aff] font-bold text-sm bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-6 py-2 rounded-full transition-colors">
            Learn more
          </button>

          {/* Carousel Indicators */}
          <div className="flex gap-2 mt-12">
            <div className="w-6 h-1.5 rounded-full bg-[#007aff]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>
        </div>

      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 w-full text-center text-xs text-gray-400">
        © 2026, TeamDock Inc. All Rights Reserved.
      </div>
    </div>
  );
}
