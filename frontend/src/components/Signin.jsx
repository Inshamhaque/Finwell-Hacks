import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../utils/db';

const Signin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
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
      // 1. Sign in
      const res = await axios.post(`${BACKEND_URL}/user/signin`, {
        email: form.email,
        password: form.password,
      });
      const { user, token } = res.data;

      // 2. Persist token / remember
      localStorage.setItem('token', token);
      if (form.remember) localStorage.setItem('rememberedEmail', form.email);
      else localStorage.removeItem('rememberedEmail');

      toast.success('Signed in successfully');

      // 3. Redirect to signup wrapper at step 3 with preloaded data
      navigate('/signup?startStep=3', {
        replace: true,
        state: { preloadedUser: user, preloadedToken: token },
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Signin failed. Check credentials.'
      );
      console.error('Signin error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-black px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl ring-1 ring-white/10 p-8 space-y-6">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-sm text-gray-300 mt-1">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-9 text-sm text-gray-300"
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => handleChange('remember', e.target.checked)}
                  className="form-checkbox h-4 w-4 text-indigo-500 rounded bg-slate-800 border-gray-600"
                />
                <span className="text-gray-300">Remember me</span>
              </label>
              <button type="button" className="text-indigo-400 hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={!isValid || loading}
              className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold transition ${
                isValid
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-[1.02] shadow-lg text-white'
                  : 'bg-slate-600 cursor-not-allowed text-gray-200'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-2">
            Don’t have an account?{' '}
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
  );
};

export default Signin;
