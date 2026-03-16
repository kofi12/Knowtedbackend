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
    if (!validateEmail(email)) { setEmailError("Please enter a valid email"); return; }
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
      ? /^(https?:)?\/\//i.test(configuredBackendUrl) ? configuredBackendUrl : `https://${configuredBackendUrl}`
      : "http://localhost:8080";
    window.location.href = `${backendUrl.replace(/\/+$/, "")}/oauth2/authorization/google`;
  };

  // Inputs get a visible border so they stand out from the card background
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 16px",
    border: "1.5px solid hsl(var(--color-border))",
    borderRadius: "8px",
    background: "hsl(var(--color-background))",
    color: "hsl(var(--color-foreground))",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const socialBtnStyle: React.CSSProperties = {
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1.5px solid hsl(var(--color-border))",
    borderRadius: "10px",
    background: "hsl(var(--color-card))",
    cursor: "pointer",
    transition: "background 0.15s",
  };

  // Shared gradient submit button used across all three modes
  const submitBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    background: "linear-gradient(to right, #4f46e5, #0d9488)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 600,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--color-muted)) 50%, hsl(var(--color-background)) 100%)",
    }}>
      <div style={{ width: "100%", maxWidth: "448px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #14b8a6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <GraduationCap style={{ width: "22px", height: "22px", color: "#ffffff" }} />
            </div>
            <h1 style={{
              fontSize: "22px", fontWeight: 700, margin: 0,
              background: "linear-gradient(to right, #4f46e5, #0d9488)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Know-ted
            </h1>
          </div>
          <p style={{ fontSize: "13px", color: "hsl(var(--color-muted-foreground))", margin: 0 }}>
            Your smart study companion
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "hsl(var(--color-card))",
          border: "1px solid hsl(var(--color-border))",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "32px",
          color: "hsl(var(--color-card-foreground))",
        }}>

          {/* ── INITIAL ── */}
          {mode === "initial" && (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 6px", color: "hsl(var(--color-foreground))" }}>
                  Log in or sign up
                </h2>
                <p style={{ fontSize: "13px", color: "hsl(var(--color-muted-foreground))", margin: 0 }}>
                  Get a Know-ted account and optimize your study journey
                </p>
              </div>

              <form onSubmit={handleInitialSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "hsl(var(--color-foreground))", marginBottom: "8px" }}>
                    Email address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "hsl(var(--color-muted-foreground))" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="you@example.com"
                      style={{ ...inputStyle, paddingLeft: "40px" }}
                      onFocus={e => (e.target.style.borderColor = "#6366f1")}
                      onBlur={e => (e.target.style.borderColor = "hsl(var(--color-border))")}
                    />
                  </div>
                  {emailError && <p style={{ fontSize: "12px", color: "hsl(var(--color-destructive))", marginTop: "4px" }}>{emailError}</p>}
                </div>
                <button type="submit" style={submitBtnStyle}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  Next step
                </button>
              </form>

              {authNotice && <p style={{ fontSize: "13px", color: "hsl(var(--color-destructive))", marginTop: "12px" }}>{authNotice}</p>}

              <p style={{ fontSize: "12px", textAlign: "center", color: "hsl(var(--color-muted-foreground))", margin: "24px 0" }}>
                Or log in with
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                <button onClick={handleGoogleLogin} title="Continue with Google" style={socialBtnStyle}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--color-muted))")}
                  onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--color-card))")}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button onClick={() => handleSocialLogin("Apple")} title="Continue with Apple" style={socialBtnStyle}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--color-muted))")}
                  onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--color-card))")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "hsl(var(--color-foreground))" }}>
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
                <button onClick={() => handleSocialLogin("Facebook")} title="Continue with Facebook" style={socialBtnStyle}
                  onMouseEnter={e => (e.currentTarget.style.background = "hsl(var(--color-muted))")}
                  onMouseLeave={e => (e.currentTarget.style.background = "hsl(var(--color-card))")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              </div>

              <p style={{ fontSize: "11px", textAlign: "center", color: "hsl(var(--color-muted-foreground))", marginTop: "24px" }}>
                By signing up or logging in, you acknowledge and agree to Know-ted's{" "}
                <a href="#" style={{ color: "#4f46e5", textDecoration: "none" }}>Terms of Use</a>{" "}and{" "}
                <a href="#" style={{ color: "#4f46e5", textDecoration: "none" }}>Privacy Policy</a>
              </p>
            </>
          )}

          {/* ── SIGNUP ── */}
          {mode === "signup" && (
            <>
              <div style={{ marginBottom: "24px" }}>
                <button onClick={() => setMode("initial")} style={{ fontSize: "13px", color: "#4f46e5", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "12px", display: "block" }}>
                  ← Back
                </button>
                <h2 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 6px", color: "hsl(var(--color-foreground))" }}>Create your account</h2>
                <p style={{ fontSize: "13px", color: "hsl(var(--color-muted-foreground))", margin: 0 }}>Welcome to Know-ted! Let's get you started.</p>
              </div>
              <form onSubmit={handleSignup}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "hsl(var(--color-foreground))", marginBottom: "8px" }}>Full name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "hsl(var(--color-border))")} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "hsl(var(--color-foreground))", marginBottom: "8px" }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "hsl(var(--color-border))")} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "hsl(var(--color-foreground))", marginBottom: "8px" }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "hsl(var(--color-border))")} />
                  <p style={{ fontSize: "11px", color: "hsl(var(--color-muted-foreground))", marginTop: "4px" }}>Must be at least 8 characters</p>
                </div>
                <button type="submit" style={submitBtnStyle}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  Create account
                </button>
              </form>
              {authNotice && <p style={{ fontSize: "13px", color: "hsl(var(--color-destructive))", marginTop: "12px" }}>{authNotice}</p>}
              <p style={{ fontSize: "13px", textAlign: "center", color: "hsl(var(--color-muted-foreground))", marginTop: "16px" }}>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} style={{ color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Log in</button>
              </p>
            </>
          )}

          {/* ── LOGIN ── */}
          {mode === "login" && (
            <>
              <div style={{ marginBottom: "24px" }}>
                <button onClick={() => setMode("initial")} style={{ fontSize: "13px", color: "#4f46e5", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "12px", display: "block" }}>
                  ← Back
                </button>
                <h2 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 6px", color: "hsl(var(--color-foreground))" }}>Welcome back</h2>
                <p style={{ fontSize: "13px", color: "hsl(var(--color-muted-foreground))", margin: 0 }}>Log in to continue your study journey</p>
              </div>
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "hsl(var(--color-foreground))", marginBottom: "8px" }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "hsl(var(--color-border))")} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "hsl(var(--color-foreground))", marginBottom: "8px" }}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#6366f1")} onBlur={e => (e.target.style.borderColor = "hsl(var(--color-border))")} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", marginBottom: "16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "hsl(var(--color-muted-foreground))" }}>
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" style={{ color: "#4f46e5", textDecoration: "none" }}>Forgot password?</a>
                </div>
                <button type="submit" style={submitBtnStyle}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  Log in
                </button>
              </form>
              {authNotice && <p style={{ fontSize: "13px", color: "hsl(var(--color-destructive))", marginTop: "12px" }}>{authNotice}</p>}
              <p style={{ fontSize: "13px", textAlign: "center", color: "hsl(var(--color-muted-foreground))", marginTop: "16px" }}>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} style={{ color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}>Sign up</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}