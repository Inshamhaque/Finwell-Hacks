import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import userData from '../data';
import { FaMoneyBillWave, FaChartPie, FaBell, FaGraduationCap } from 'react-icons/fa';

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-gray-800 p-6 rounded-2xl shadow transition hover:shadow-lg">
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      {icon} {title}
    </h2>
    {children}
  </div>
);

const FinancialDashboard = () => {
  const { transactions, balance, investments, budgets, alerts, learning } = userData;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 md:p-10">
      <h1 className="text-4xl font-bold mb-6 text-center">📊 Personal Finance Dashboard</h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SectionCard title="Current Balance" icon={<FaMoneyBillWave />}>
          <p className="text-2xl font-bold text-green-400">₹{balance.toLocaleString()}</p>
        </SectionCard>

        <SectionCard title="Total Budgeted" icon={<FaChartPie />}>
          <p className="text-2xl font-bold text-yellow-400">
            ₹{budgets.categories.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
          </p>
        </SectionCard>

        <SectionCard title="Active Alerts" icon={<FaBell />}>
          <ul className="text-sm space-y-1 list-disc ml-5">
            {alerts.slice(0, 3).map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Mid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Recent Transactions" icon={<FaMoneyBillWave />}>
          <ul className="text-sm space-y-1">
            {transactions.slice(0, 5).map((txn, idx) => (
              <li key={idx} className="border-b border-gray-700 py-1 flex justify-between">
                <span className="capitalize">{txn.category}</span>
                <span className="font-medium">₹{txn.amount}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Investment Options" icon={<FaChartPie />}>
          <ul className="text-sm list-disc ml-5">
            {investments.options.map((opt, idx) => <li key={idx}>{opt}</li>)}
          </ul>
        </SectionCard>

        <SectionCard title="Today's Financial Learning" icon={<FaGraduationCap />}>
          <p className="text-sm italic text-gray-300">📘 {learning}</p>
        </SectionCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <SectionCard title="Investment Limits" icon={<FaChartPie />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={investments.limits}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Bar dataKey="limit" fill="#34d399" />
              <Bar dataKey="used" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Investment Performance" icon={<FaChartPie />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={investments.performance}>
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

      {/* Budget Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <SectionCard title="Custom Monthly Budgets" icon={<FaMoneyBillWave />}>
          <ul className="text-sm space-y-1">
            {budgets.categories.map((cat, idx) => (
              <li key={idx} className="flex justify-between border-b border-gray-700 py-1">
                <span>{cat.name}</span>
                <span className="font-semibold text-yellow-300">₹{cat.amount}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Budget vs Actual" icon={<FaChartPie />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgets.vsActuals}>
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
      </div>
    </div>
  );
};

export default FinancialDashboard;
