import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { BACKEND_URL } from '../utils/db';

const steps = ['Basic Info', 'Preferences', 'Choose Account'];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    budgetPerMonth: '',
    investmentSkill: '',
  });
  const [prefilled, setPrefilled] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]);
  const [token, setToken] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const startStep = parseInt(searchParams.get('startStep') || '1', 10);
    const storedToken = localStorage.getItem('token');
    if (startStep === 3 && storedToken) {
      setStep(3);
      setToken(storedToken);
      fetchProfileAndPrefill(storedToken);
    }
  }, []);

  const fetchProfileAndPrefill = async (jwt) => {
    setLoadingProfile(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/user/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const { user } = res.data;

      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        budgetPerMonth: user.budgetPerMonth || '',
        investmentSkill: user.investmentSkill || '',
      });
      setUserAccounts(user.accounts || []);
      setPrefilled(true);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Session expired or failed to load account. Please signin again.');
      navigate('/signin');
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-black px-4 py-10">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-1 text-sm text-gray-300">
            {steps.map((label, idx) => (
              <div key={label} className="flex-1 text-center">
                <div
                  className={`inline-block px-3 py-1 rounded-full ${
                    step === idx + 1
                      ? 'bg-indigo-500 text-white font-semibold'
                      : idx + 1 < step
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-gray-400'
                  }`}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="h-1 relative bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="relative">
          {step === 1 && (
            <StepOne
              nextStep={nextStep}
              updateForm={updateForm}
              formData={formData}
            />
          )}
          {step === 2 && (
            <StepTwo
              nextStep={nextStep}
              prevStep={prevStep}
              updateForm={updateForm}
              formData={formData}
            />
          )}
          {step === 3 && (
            <StepThree
              formData={formData}
              prevStep={prevStep}
              preloadedAccounts={prefilled ? userAccounts : undefined}
              preloadedToken={prefilled ? token : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
