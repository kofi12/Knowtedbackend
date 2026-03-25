import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, Mail } from "lucide-react";

export function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"initial" | "login" | "signup">("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [authNotice, setAuthNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reason = params.get("reason");
    if (reason === "auth-required") setAuthNotice("Please sign in to continue.");
    else if (reason === "logged-out") setAuthNotice("You have been logged out.");
  }, [location.search]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    setEmailError("");
    setMode("signup");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthNotice("Email/password login is not wired yet. Use Google Sign in.");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthNotice("Signup is not wired yet. Use Google Sign in.");
  };

  const handleSocialLogin = (provider: string) => {
    setAuthNotice(`${provider} login is not wired yet. Use Google Sign in.`);
  };

  const handleGoogleLogin = () => {
    const configuredBackendUrl = (import.meta.env.VITE_BACKEND_URL || "").trim();
    const backendUrl = configuredBackendUrl
      ? /^(https?:)?\/\//i.test(configuredBackendUrl)
        ? configuredBackendUrl
        : `https://${configuredBackendUrl}`
      : "http://localhost:8080";
    window.location.href = `${backendUrl.replace(/\/+$/, "")}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-muted to-background">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Know-ted
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Your smart study companion</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-sm">

          {/* INITIAL */}
          {mode === "initial" && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">Log in or sign up</h2>
                <p className="text-sm text-muted-foreground">
                  Get a Know-ted account and optimize your study journey
                </p>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">{emailError}</p>
                  )}
                </div>

                <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold hover:opacity-90 transition">
                  Next step
                </button>
              </form>

              {authNotice && (
                <p className="text-sm text-red-500 mt-3">{authNotice}</p>
              )}

              <p className="text-xs text-center text-muted-foreground my-6">
                Or log in with
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-12 h-12 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition shadow-sm"
                  title="Continue with Google"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialLogin("Apple")}
                  className="w-12 h-12 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition shadow-sm"
                  title="Continue with Apple"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "hsl(var(--color-foreground))" }}>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialLogin("Facebook")}
                  className="w-12 h-12 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition shadow-sm"
                  title="Continue with Facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-6">
                By signing up or logging in, you agree to Terms & Privacy Policy
              </p>
            </>
          )}

          {/* SIGNUP */}
          {mode === "signup" && (
            <>
              <button
                onClick={() => setMode("initial")}
                className="text-sm text-indigo-600 mb-4"
              >
                ← Back
              </button>

              <h2 className="text-xl font-semibold mb-1">Create your account</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Welcome to Know-ted! Let's get you started.
              </p>

              <form onSubmit={handleSignup} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                />

                <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold">
                  Create account
                </button>
              </form>

              {authNotice && (
                <p className="text-sm text-red-500 mt-3">{authNotice}</p>
              )}
            </>
          )}

          {/* LOGIN */}
          {mode === "login" && (
            <>
              <button
                onClick={() => setMode("initial")}
                className="text-sm text-indigo-600 mb-4"
              >
                ← Back
              </button>

              <h2 className="text-xl font-semibold mb-1">Welcome back</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Log in to continue
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                />

                <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-semibold">
                  Log in
                </button>
              </form>

              {authNotice && (
                <p className="text-sm text-red-500 mt-3">{authNotice}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
