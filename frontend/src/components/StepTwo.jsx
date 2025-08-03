import React from 'react';

const StepTwo = ({ nextStep, prevStep, formData, updateForm }) => {
  const isValid = formData.budgetPerMonth && formData.investmentSkill;

  return (
    <form
      className="w-full bg-white/5 backdrop-blur-md space-y-6 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 transition-all"
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) nextStep();
      }}
    >
      <h2 className="text-white text-2xl font-bold mb-1">
        Step 2: Financial Preferences
      </h2>
      <p className="text-sm text-gray-300">
        Help us tailor recommendations by letting us know your budget and skill level.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Budget per month
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="e.g., 15000"
              value={formData.budgetPerMonth}
              onChange={(e) => updateForm('budgetPerMonth', e.target.value)}
              required
              min={0}
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <span className="absolute right-3 top-3 text-xs text-gray-400">
              ₹
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Investment Skill
          </label>
          <select
            value={formData.investmentSkill}
            onChange={(e) => updateForm('investmentSkill', e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Select skill level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-2">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 mr-2 py-3 rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 transition text-white"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className={`flex-1 ml-2 py-3 rounded-xl font-semibold transition ${
            isValid
              ? 'bg-gradient-to-r from-green-500 to-indigo-500 hover:scale-[1.02] shadow-lg text-white'
              : 'bg-slate-600 cursor-not-allowed text-gray-200'
          }`}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default StepTwo;
