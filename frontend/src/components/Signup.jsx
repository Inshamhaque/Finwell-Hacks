import React, { useState } from 'react';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';

const SignupWrapper = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    budgetPerMonth: '',
    investmentSkill: '',
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {step === 1 && <StepOne nextStep={nextStep} updateForm={updateForm} formData={formData} />}
      {step === 2 && <StepTwo nextStep={nextStep} prevStep={prevStep} updateForm={updateForm} formData={formData} />}
      {step === 3 && <StepThree formData={formData} prevStep={prevStep} />}
    </div>
  );
};

export default SignupWrapper;
