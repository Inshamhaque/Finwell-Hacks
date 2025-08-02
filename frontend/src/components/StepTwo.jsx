import React from 'react';

const StepTwo = ({ nextStep, prevStep, formData, updateForm }) => {
  return (
    <form
      className="w-full max-w-md space-y-6 bg-white/10 p-8 rounded-xl"
      onSubmit={(e) => {
        e.preventDefault();
        nextStep();
      }}
    >
      <h2 className="text-white text-xl font-semibold mb-4">Step 2: Financial Preferences</h2>
      <input
        type="number"
        placeholder="Budget per month"
        value={formData.budgetPerMonth}
        onChange={(e) => updateForm('budgetPerMonth', e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white"
      />
      <select
        value={formData.investmentSkill}
        onChange={(e) => updateForm('investmentSkill', e.target.value)}
        required
        className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-slate-800 text-white"
      >
        <option value="">Select investment skill</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-600 text-white py-2 px-4 rounded-lg"
        >
          Back
        </button>
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default StepTwo;
