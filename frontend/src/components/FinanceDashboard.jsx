import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { FaMoneyBillWave, FaChartPie, FaBell, FaGraduationCap } from 'react-icons/fa';
import axios from 'axios';

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-gray-800 p-6 rounded-2xl shadow transition hover:shadow-lg">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      {icon} {title}
    </h2>
    {children}
  </div>
);

const FinancialDashboard = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      const accountId = localStorage.getItem('selectedAccountId');
      
      try {
        const res = await axios.post('http://localhost:3000/user/getAll', {
          accountId
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (res.data?.result?.length > 0) {
          setAccount(res.data.result[0]);
        }

        // Fetch AI stock suggestions
        const suggestionRes = await axios.post('http://localhost:3000/stocks/recommendations',{
          accountId
        },
           {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const parsed = JSON.parse(suggestionRes.data.suggestions.match(/\[.*\]/s)[0]);
        setStockSuggestions(parsed);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!account) return <div className="text-white p-6">No account data found.</div>;

  const balance = parseFloat(account.balance);
  const transactions = account.transactions || [];
  const credited = transactions.filter(t => t.type === 'CREDITED');
  const debited = transactions.filter(t => t.type === 'DEBITED');

  const categoryTotals = {};
  transactions.forEach(txn => {
    const cat = txn.category;
    const amt = parseFloat(txn.amount);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  const budgetVsActualData = Object.keys(categoryTotals).map(cat => ({
    category: cat,
    actual: categoryTotals[cat],
    budgeted: categoryTotals[cat] * 1.1,
  }));

  const investmentPerformance = credited.slice(0, 6).map((txn, idx) => ({
    month: new Date(txn.createdAt).toLocaleDateString('default', { month: 'short' }),
    value: parseFloat(txn.amount),
  }));

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 md:p-10">
      <h1 className="text-4xl font-bold mb-6 text-center">📊 Personal Finance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SectionCard title="Current Balance" icon={<FaMoneyBillWave />}>
          <p className="text-2xl font-bold text-green-400">₹{balance.toFixed(2)}</p>
        </SectionCard>

        <SectionCard title="Total Credited" icon={<FaChartPie />}>
          <p className="text-2xl font-bold text-yellow-400">
            ₹{credited.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
          </p>
        </SectionCard>

        <SectionCard title="Total Debited" icon={<FaBell />}>
          <p className="text-2xl font-bold text-red-400">
            ₹{debited.reduce((sum, t) => sum + parseFloat(t.amount), 0).toFixed(2)}
          </p>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Recent Transactions" icon={<FaMoneyBillWave />}>
          <ul className="text-sm space-y-1">
            {transactions.slice(0, 5).map((txn, idx) => (
              <li key={idx} className="border-b border-gray-700 py-1 flex justify-between">
                <span className="capitalize">{txn.category}</span>
                <span className="font-medium">₹{parseFloat(txn.amount).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Most Spent Categories" icon={<FaChartPie />}>
          <ul className="text-sm list-disc ml-5">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, amt]) => (
              <li key={cat}>{cat}: ₹{amt.toFixed(2)}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Learning Tip" icon={<FaGraduationCap />}>
          <p className="text-sm italic text-gray-300">📘 Track your recurring expenses and set saving goals every month!</p>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <SectionCard title="Spending by Category" icon={<FaChartPie />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetVsActualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="category" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="budgeted" fill="#fbbf24" />
              <Bar dataKey="actual" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Recent Credits (Performance)" icon={<FaChartPie />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={investmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Stock Suggestions Section */}
      <div className="mt-10">
        <SectionCard title="AI-Recommended Stock Options" icon={<FaChartPie />}>
          {stockSuggestions && stockSuggestions.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-200">
              {stockSuggestions.map((stock, idx) => (
                <li key={idx} className="border-b border-gray-700 pb-2">
                  <p className="font-semibold">{stock.name}</p>
                  <p className="text-gray-400 italic">{stock.reason}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    Risk: <span className="text-white">{stock.riskLevel}</span> | Type: <span className="text-white">{stock.type}</span> | Sector: <span className="text-white">{stock.sector}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-gray-400">No suggestions available right now.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default FinancialDashboard;




