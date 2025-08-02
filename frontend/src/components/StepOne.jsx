import React from 'react';

const StepOne = ({ nextStep, formData, updateForm }) => {
  return (
    <form
      className="w-full max-w-md space-y-6 bg-white/10 p-8 rounded-xl"
      onSubmit={(e) => {
        e.preventDefault();
        nextStep();
      }}
    >
      <h2 className="text-white text-xl font-semibold mb-4">Step 1: Basic Info</h2>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => updateForm('name', e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => updateForm('email', e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white"
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => updateForm('password', e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white"
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-lg"
      >
        Continue
      </button>
    </form>
  );
};

export default StepOne;
