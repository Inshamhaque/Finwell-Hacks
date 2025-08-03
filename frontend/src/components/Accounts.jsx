import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Accounts = () => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const accounts = location.state?.accounts || [];

  useEffect(() => {
    if (accounts.length >= 0) {
      setLoading(false);
    }
  }, [accounts]);

  const handleAccountSelect = () => {
    if (!selected) return;
    const selectedAccount = accounts.find((acc) => acc.id === selected);
    // Redirect to dashboard or next step with selectedAccount
    navigate("/dashboard", { state: { account: selectedAccount } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-black px-4 py-10">
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-md space-y-6 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10 text-white">
        <h2 className="text-2xl font-bold">Select Your Account</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <h3 className="mt-1 text-lg font-bold">
                      {acc.type} Account
                    </h3>
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

        <div className="flex justify-end pt-4">
          <button
            onClick={handleAccountSelect}
            disabled={!selected}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              selected
                ? "bg-gradient-to-r from-green-400 to-indigo-500 hover:scale-[1.02] shadow-lg text-white"
                : "bg-slate-600 cursor-not-allowed text-gray-300"
            }`}
          >
            Confirm & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
