import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaMoneyBillWave,
  FaChartPie,
  FaBell,
  FaGraduationCap,
} from "react-icons/fa";
import axios from "axios";
import ChatBot from "./ChatBot";
import { MessageCircle } from "lucide-react";
import OCRReceiptScanner from "./OCRReceiptScanner";
import { FaCamera } from "react-icons/fa";
import { BACKEND_URL } from "../config";

const SectionCard = ({ title, icon, children, className = "" }) => (
  <div className={`bg-gray-800 p-6 rounded-2xl shadow transition hover:shadow-lg ${className}`}>
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
      {icon} {title}
    </h2>
    {children}
  </div>
);

// Colors for pie chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

const FinancialDashboard = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const token = localStorage.getItem("token");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatRef = useRef();
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef();

  // Click outside to close OCR modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scannerRef.current && !scannerRef.current.contains(event.target)) {
        setShowScanner(false);
      }
    };

    if (showScanner) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showScanner]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };

    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  useEffect(() => {
    const fetchData = async () => {
      const accountId = localStorage.getItem("selectedAccountId");

      try {
        console.log("here")
        const res = await axios.post(`${BACKEND_URL}/user/getAll`, {
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
        const suggestionRes = await axios.post(`${BACKEND_URL}/stocks/recommendations`,{
          accountId
        },
           {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const parsed = JSON.parse(
          suggestionRes.data.suggestions.match(/\[.*\]/s)[0]
        );
        setStockSuggestions(parsed);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen p-6 md:p-10 text-white space-y-10 animate-pulse">
        <h1 className="text-4xl font-bold mb-6 text-center">
          📊 Personal Finance Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 p-6 rounded-2xl shadow space-y-4"
            >
              <div className="h-5 bg-gray-700 rounded w-2/3"></div>
              <div className="h-8 bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 p-6 rounded-2xl shadow space-y-3"
            >
              <div className="h-5 bg-gray-700 rounded w-2/3 mb-4"></div>
              {[...Array(5)].map((__, j) => (
                <div key={j} className="h-4 bg-gray-700 rounded w-full"></div>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-2xl shadow">
              <div className="h-5 bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-[300px] bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow">
          <div className="h-5 bg-gray-700 rounded w-2/3 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-700 rounded w-full mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!account)
    return <div className="text-white p-6">No account data found.</div>;

  const balance = parseFloat(account.balance);
  const transactions = account.transactions || [];
  const credited = transactions.filter((t) => t.type === "CREDITED");
  const debited = transactions.filter((t) => t.type === "DEBITED");

  const categoryTotals = {};
  transactions.forEach((txn) => {
    const cat = txn.category;
    const amt = parseFloat(txn.amount);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  // Prepare data for pie chart
  const pieChartData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7) // Show top 7 categories
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }));

  const budgetVsActualData = Object.keys(categoryTotals).map((cat) => ({
    category: cat,
    actual: categoryTotals[cat],
    budgeted: categoryTotals[cat] * 1.1,
  }));

  const investmentPerformance = credited.slice(0, 6).map((txn) => ({
    month: new Date(txn.createdAt).toLocaleDateString("default", {
      month: "short",
    }),
    value: parseFloat(txn.amount),
  }));

  // Custom label function for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 md:p-10">
      <h1 className="text-4xl font-bold mb-6 text-center">
        📊 Personal Finance Dashboard
      </h1>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <SectionCard title="Current Balance" icon={<FaMoneyBillWave />}>
          <p className="text-2xl font-bold text-green-400">
            ₹{balance.toFixed(2)}
          </p>
        </SectionCard>

        <SectionCard title="Total Credited" icon={<FaChartPie />}>
          <p className="text-2xl font-bold text-yellow-400">
            ₹
            {credited
              .reduce((sum, t) => sum + parseFloat(t.amount), 0)
              .toFixed(2)}
          </p>
        </SectionCard>

        <SectionCard title="Total Debited" icon={<FaBell />}>
          <p className="text-2xl font-bold text-red-400">
            ₹
            {debited
              .reduce((sum, t) => sum + parseFloat(t.amount), 0)
              .toFixed(2)}
          </p>
        </SectionCard>
      </div>

      {/* Main Content Grid - Better Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-10">
        {/* Recent Transactions - Left Column */}
        <div className="xl:col-span-4">
          <SectionCard title="Recent Transactions" icon={<FaMoneyBillWave />} className="h-full">
            <div className="max-h-80 overflow-y-auto">
              <ul className="text-sm space-y-2">
                {transactions
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((txn, idx) => (
                    <li
                      key={idx}
                      className="border-b border-gray-700 py-2 flex justify-between items-center"
                    >
                      <div>
                        <div className="capitalize font-medium">{txn.category}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="font-medium">
                        ₹{parseFloat(txn.amount).toFixed(2)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </SectionCard>
        </div>

        {/* Pie Chart - Center Column */}
        <div className="xl:col-span-5">
          <SectionCard title="Most Spent Categories" icon={<FaChartPie />} className="h-full">
            {pieChartData.length > 0 ? (
              <div className="flex flex-col items-center h-full">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Compact Legend */}
                <div className="mt-2 text-xs grid grid-cols-2 gap-x-4 gap-y-1 w-full">
                  {pieChartData.slice(0, 6).map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="capitalize truncate text-xs">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-gray-400 text-center">
                No spending data available.
              </p>
            )}
          </SectionCard>
        </div>

        {/* Learning Tips & Quick Stats - Right Column */}
        <div className="xl:col-span-3 space-y-6">
          <SectionCard title="Learning Tip" icon={<FaGraduationCap />}>
            <div className="space-y-3">
              <p className="text-sm text-gray-300">
                📘 Track your recurring expenses and set saving goals every month!
              </p>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-xs text-gray-300 mb-1">💡 Quick Tip:</p>
                <p className="text-xs text-blue-300">
                  Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Quick Stats */}
          <SectionCard title="Quick Stats" icon={<FaChartPie />}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Transactions:</span>
                <span className="text-white font-medium">{transactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Categories:</span>
                <span className="text-white font-medium">{Object.keys(categoryTotals).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Transaction:</span>
                <span className="text-white font-medium">
                  ₹{transactions.length > 0 ? (transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / transactions.length).toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
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
              <Line
                type="monotone"
                dataKey="value"
                stroke="#60a5fa"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* AI Stock Recommendations */}
      <div className="mb-10">
        <SectionCard title="AI-Recommended Stock Options" icon={<FaChartPie />}>
          {stockSuggestions && stockSuggestions.length > 0 ? (
            <ul className="space-y-3 text-sm text-gray-200">
              {stockSuggestions.map((stock, idx) => (
                <li key={idx} className="border-b border-gray-700 pb-3">
                  <p className="font-semibold text-white">{stock.name}</p>
                  <p className="text-gray-300 italic mt-1">{stock.reason}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs">
                    <span className="text-gray-400">
                      Risk: <span className="text-white">{stock.riskLevel}</span>
                    </span>
                    <span className="text-gray-400">
                      Type: <span className="text-white">{stock.type}</span>
                    </span>
                    <span className="text-gray-400">
                      Sector: <span className="text-white">{stock.sector}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm italic text-gray-400">
              No suggestions available right now.
            </p>
          )}
        </SectionCard>
      </div>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Modal */}
      {isChatOpen && (
        <div
          ref={chatRef}
          className="fixed bottom-20 right-6 w-full max-w-md z-40 bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4">
            <ChatBot />
          </div>
        </div>
      )}

      {/* OCR Receipt Button */}
      {!showScanner && (
        <button
          onClick={() => setShowScanner(true)}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-green-600 to-lime-500 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:to-lime-600 transition-all duration-300 hover:scale-110 z-50"
        >
          <FaCamera className="w-6 h-6" />
        </button>
      )}

      {/* OCR Modal */}
      {showScanner && (
        <div
          ref={scannerRef}
          className="fixed bottom-20 left-6 w-full max-w-md z-50 bg-gray-900 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4">
            <OCRReceiptScanner />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;