import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/db";

const StepThree = ({
  formData,
  prevStep,
  preloadedAccounts,
  preloadedToken,
  fromSignin = false, // explicit indicator
}) => {
  const [accounts, setAccounts] = useState(preloadedAccounts || []);
  const [selected, setSelected] = useState(null);
  const [token, setToken] = useState(preloadedToken || "");
  const [loading, setLoading] = useState(
    fromSignin || Array.isArray(preloadedAccounts) ? false : true
  );

  useEffect(() => {
    if (fromSignin || (preloadedAccounts && preloadedAccounts.length)) {
      return;
    }

    const registerUser = async () => {
      try {
        const res = await axios.post(`${BACKEND_URL}/user/submit`, formData);
        const { user, token } = res.data;

        setAccounts(user.accounts || []);
        setToken(token);
        localStorage.setItem("token", token);
        toast.success("Signup successful! Choose an account");
      } catch (err) {
        toast.error("Signup failed.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    registerUser();
  }, [formData, preloadedAccounts, fromSignin]);

  const handleAccountSelect = () => {
    if (!selected) {
      toast.error("Please select an account.");
      return;
    }
    console.log("selected successfully")
    localStorage.setItem("selectedAccountId", selected);
    toast.success("Account selected successfully!");
    // proceed to dashboard or next step
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-md space-y-6 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 text-white transition-all">
      <h2 className="text-2xl font-bold">Step 3: Select Your Account</h2>
      <p className="text-sm text-gray-300">
        We’ve linked your bank. Pick which account to proceed with.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-pulse space-y-2 w-full">
            <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto" />
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-gray-300">
          No accounts found. Try again later.
        </p>
      ) : (
        <div className="grid gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setSelected(acc.id)}
              className={`relative flex flex-col p-5 rounded-2xl cursor-pointer transition shadow-xl ring-1 ring-white/10 ${
                selected === acc.id
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-offset-2 ring-offset-slate-900"
                  : "bg-slate-800 hover:scale-[1.01]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-300 font-medium">
                    {acc.bankName}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{acc.type} Account</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="text-xl font-semibold">
                    ₹{parseFloat(acc.balance || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {acc.transactions && acc.transactions.length > 0 ? (
                  <span className="text-xs bg-green-700/30 px-2 py-1 rounded">
                    {acc.transactions.length} txn
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-700/30 px-2 py-1 rounded">
                    No recent txn
                  </span>
                )}
              </div>
              {selected === acc.id && (
                <div className="absolute top-2 right-2">
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="flex-1 mr-2 py-3 rounded-xl font-semibold bg-gray-700 hover:bg-gray-600 transition text-white"
        >
          Back
        </button>
        <button
          onClick={handleAccountSelect}
          className="flex-1 ml-2 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-indigo-500 hover:scale-[1.02] shadow-lg text-white transition"
        >
          Confirm & Continue
        </button>
      </div>
    </div>
  );
};

export default StepThree;
