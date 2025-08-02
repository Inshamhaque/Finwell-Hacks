import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/db';

const StepThree = ({ formData, prevStep }) => {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const registerUser = async () => {
      try {
        const res = await axios.post(`${BACKEND_URL}/user/submit`, formData);
        const { user, token } = res.data;

        setAccounts(user.accounts);
        setToken(token); // store token locally if needed
        localStorage.setItem("token", token);

        toast.success("Signup successful! Choose an account");
      } catch (err) {
        toast.error("Signup failed.");
        console.error(err);
      }
    };

    registerUser();
  }, [formData]);

  const handleAccountSelect = () => {
    if (!selected) {
      toast.error("Please select an account.");
      return;
    }

    // Save the selected account for session
    localStorage.setItem("selectedAccountId", selected);
    toast.success("Account selected successfully!");

    // Navigate or finalize signup
    // e.g., navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white/10 p-8 rounded-xl text-white">
      <h2 className="text-xl font-semibold mb-4">Step 3: Select Your Account</h2>
      {accounts.length === 0 ? (
        <p className="text-sm text-gray-300">Loading accounts...</p>
      ) : (
        <ul className="space-y-3">
          {accounts.map((acc) => (
            <li
              key={acc.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selected === acc.id ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
              onClick={() => setSelected(acc.id)}
            >
              <p className="font-medium">{acc.bankName}</p>
              <p className="text-sm text-gray-300">Type: {acc.type} | ₹{parseFloat(acc.balance).toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-between mt-4">
        <button onClick={prevStep} className="bg-gray-600 text-white py-2 px-4 rounded-lg">
          Back
        </button>
        <button onClick={handleAccountSelect} className="bg-indigo-600 text-white py-2 px-4 rounded-lg">
          Confirm
        </button>
      </div>
    </div>
  );
};

export default StepThree;
