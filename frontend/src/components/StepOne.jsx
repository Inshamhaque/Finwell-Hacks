// StepOne.jsx
import React from "react";

const StepOne = ({ nextStep, formData, updateForm }) => {
  const isValid = formData.name && formData.email && formData.password;

  return (
    <form
      className="w-full bg-[#1f2e50] relative overflow-hidden backdrop-blur-md space-y-6 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 transition-all"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) nextStep();
      }}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-indigo-600 to-purple-500 opacity-10 blur-xl rounded-2xl" />
      <div className="relative z-10">
        <h2 className="text-white text-2xl font-bold mb-1">Step 1: Basic Info</h2>
        <p className="text-sm text-gray-300">
          Tell us who you are. This helps personalize your experience.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => updateForm("name", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#2a3865] bg-[#0f1f3f] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => updateForm("email", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#2a3865] bg-[#0f1f3f] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => updateForm("password", e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-[#2a3865] bg-[#0f1f3f] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold transition-transform ${
            isValid
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-[1.02] shadow-lg text-white"
              : "bg-[#2a3865] cursor-not-allowed text-gray-400"
          }`}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default StepOne;
