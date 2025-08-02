import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import { BACKEND_URL } from '../utils/DB';

const Signup = () => {
  const navigate = useNavigate();
  const [Userdetail, setUserdetail] = useState({
    firstname: "",
    email: "",
    password: "",
  });

  const handleclick = async (e) => {
    e.preventDefault();
    try {
      const UserResponse = await axios.post(
        `${BACKEND_URL}/api/v1/user/signup`,
        Userdetail
      );

      if (UserResponse.data.message) {
        toast.success(UserResponse.data.message);
        localStorage.setItem('token', UserResponse.data.token);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setUserdetail({ firstname: '', email: '', password: '' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white">
          💸 Create Your Finance Account
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Track. Save. Invest. All in one place.
        </p>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-700">
        <button
          className="w-full flex items-center justify-center px-2 py-2 border border-slate-300 text-sm font-medium rounded-lg bg-white text-gray-800 hover:bg-gray-100 transition"
        >
          <img
            className="h-5 w-5 mr-2"
            src="https://logos-world.net/wp-content/uploads/2020/09/Google-Symbol.png"
            alt="Google logo"
          />
          Sign up with Google
        </button>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-500"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-gray-400">
              Or sign up with email
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleclick}>
          <input
            type="text"
            placeholder="First Name"
            value={Userdetail.firstname}
            onChange={(e) =>
              setUserdetail({ ...Userdetail, firstname: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={Userdetail.email}
            onChange={(e) =>
              setUserdetail({ ...Userdetail, email: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={Userdetail.password}
            onChange={(e) =>
              setUserdetail({ ...Userdetail, password: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Sign up
          </button>
        </form>

        <div className="text-center text-sm text-gray-400 mt-6">
          Already have an account?
          <button
            onClick={() => navigate('/signin')}
            className="text-indigo-400 hover:underline ml-1"
          >
            Sign in
          </button>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default Signup;
