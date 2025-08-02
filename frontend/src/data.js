// data.js
const userData = {
  balance: 75230.45,
  transactions: [
    { category: 'Groceries', amount: 1345 },
    { category: 'Shopping', amount: 4500 },
    { category: 'Rent', amount: 18000 },
    { category: 'Utilities', amount: 2500 },
    { category: 'Dining Out', amount: 2200 },
    { category: 'Transport', amount: 1300 },
  ],
  investments: {
    options: ['Mutual Funds', 'Stocks', 'Gold ETFs', 'FDs'],
    limits: [
      { month: 'Jan', limit: 10000, used: 8000 },
      { month: 'Feb', limit: 10000, used: 7000 },
      { month: 'Mar', limit: 10000, used: 6000 },
    ],
    performance: [
      { month: 'Jan', value: 12000 },
      { month: 'Feb', value: 13000 },
      { month: 'Mar', value: 15000 },
    ],
  },
  budgets: {
    categories: [
      { name: 'Food', amount: 8000 },
      { name: 'Shopping', amount: 5000 },
      { name: 'Transport', amount: 3000 },
    ],
    vsActuals: [
      { category: 'Food', budgeted: 8000, actual: 7600 },
      { category: 'Shopping', budgeted: 5000, actual: 4700 },
      { category: 'Transport', budgeted: 3000, actual: 3500 },
    ]
  },
  alerts: [
    "You're 80% through your shopping budget",
    "Transport expenses exceeded by ₹500"
  ],
  learning: 'The 50/30/20 rule helps you allocate your income: 50% needs, 30% wants, 20% savings.'
};

export default userData;
