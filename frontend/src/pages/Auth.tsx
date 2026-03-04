import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { GraduationCap, Mail } from "lucide-react";

export function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"initial" | "login" | "signup">("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [emailError, setEmailError] = useState("");

  // Check for redirect back from backend after Google login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loggedIn = params.get("loggedIn");
    const token = params.get("token"); // if you later return JWT

    if (loggedIn === "true" || token) {
      // Success! Store token if present, then go to dashboard
      if (token) {
        localStorage.setItem("token", token);
        // Optional: set axios/fetch default header
        // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      navigate("/dashboard", { replace: true });
    }
  }, [location.search, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
    // Mock or real login
    navigate("/dashboard");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock or real signup
    navigate("/dashboard");
  };

  const handleSocialLogin = (provider: string) => {
    // Mock social login
    console.log(`Login with ${provider}`);
    navigate("/");
  };

  const handleGoogleLogin = () => {
    // Backend URL — use env var in production
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

    // Trigger Google SSO flow
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-teal-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Know-ted
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your smart study companion
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg p-6 md:p-8">
          {mode === "initial" && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Log in or sign up
                </h2>
                <p className="text-sm text-muted-foreground">
                  Get a Know-ted account and optimize your study journey
                </p>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">{emailError}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Next step
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">
                    Or log in with
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleGoogleLogin()}
                  className="w-12 h-12 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Continue with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialLogin("Apple")}
                  className="w-12 h-12 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Continue with Apple"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialLogin("Facebook")}
                  className="w-12 h-12 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Continue with Facebook"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-6">
                By signing up or logging in, you acknowledge and agree to
                Know-ted's{" "}
                <a href="#" className="text-indigo-600 hover:underline">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </>
          )}

          {mode === "signup" && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setMode("initial")}
                  className="text-sm text-indigo-600 hover:underline mb-4"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-semibold mb-2">
                  Create your account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Welcome to Know-ted! Let's get you started.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Create account
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground mt-4">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Log in
                </button>
              </p>
            </>
          )}

          {mode === "login" && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => setMode("initial")}
                  className="text-sm text-indigo-600 hover:underline mb-4"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Log in to continue your study journey
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-indigo-600 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Log in
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground mt-4">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
