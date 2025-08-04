import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';

const Signin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered)
      setForm((f) => ({ ...f, email: remembered, remember: true }));
  }, []);

  const isValid = form.email && form.password;

  const handleChange = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/user/signin`,
        {
          email: form.email,
          password: form.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const { user, token } = res.data;

      localStorage.setItem("token", token);
      if (form.remember) localStorage.setItem("rememberedEmail", form.email);
      else localStorage.removeItem("rememberedEmail");

      toast.success("Signed in successfully");
      navigate("/accounts", {
        state: { accounts: res.data.user.accounts },
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Signin failed. Check credentials."
      );
      console.error("Signin error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#111827] px-4 py-10">
      <div className="w-full max-w-md">
        <div
          className="relative bg-[#1f2e50] rounded-2xl shadow-2xl ring-1 ring-white/10 p-8 space-y-6 overflow-hidden"
          style={{ boxShadow: "0 30px 60px -10px rgba(0,0,0,0.6)" }}
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-600 to-purple-500 opacity-10 blur-xl rounded-2xl" />
          <div className="relative z-10">
            <div className="text-center mb-3">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-sm text-gray-300 mt-1">
                Sign in to continue to your dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#2a3865] bg-[#0f1f3f] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="relative space-y-1">
                <label className="block text-xs font-medium text-gray-400">
                  Password
                </label>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#2a3865] bg-[#0f1f3f] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-9 text-xs font-medium text-gray-300 hover:text-white transition"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(e) =>
                      handleChange("remember", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-600 bg-[#0f1f3f] text-indigo-500 focus:ring-indigo-400"
                  />
                  <span className="text-gray-300">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-indigo-400 hover:underline font-medium"
                  onClick={() => {
                    /* you can hook forgot password modal/link here */
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold transition-transform ${
                  isValid
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-[1.02] shadow-lg text-white"
                    : "bg-[#2a3865] cursor-not-allowed text-gray-400"
                }`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-3">
              Don’t have an account?{" "}
              <a
                href="/signup"
                className="text-indigo-400 font-semibold hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
