// server/routes/user.js
import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import { verifyToken } from '../Middleware/auth.js';
import { generateToken } from '../Middleware/auth.js';
const userRouter = express.Router();

// 🔐 Signup Route
userRouter.post('/submit', async (req, res) => {
  const {
    name,
    email,
    password,
    googleId,
    budgetPerMonth,
    investmentSkill
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const bankRes = await axios.post('http://localhost:8080/link-bank', {
      name,
      email
    });

    const { accessToken, accounts, transactions } = bankRes.data;

    // Normalize: ensure transactions is an array
    const txs = Array.isArray(transactions) ? transactions : [];

    // Attach relevant transactions to each account
    const enrichedAccounts = (Array.isArray(accounts) ? accounts : []).map((acct) => {
      const related = txs.filter(
        (t) =>
          (t.fromAccountId && t.fromAccountId === acct.id) ||
          (t.toAccountId && t.toAccountId === acct.id)
      );
      return {
        ...acct,
        transactions: related,
      };
    });

    const newUser = new User({
      name,
      email,
      password: googleId ? undefined : password,
      googleId: googleId || undefined,
      authProvider: googleId ? 'google' : 'local',
      access_token: accessToken,
      accounts: enrichedAccounts,
      budgetPerMonth,
      investmentSkill,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'User signed up and bank linked successfully',
      user: newUser,
      token: token,
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});


// 🔐 Signin Route
userRouter.post('/signin',async (req, res) => {
const {email,password} = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: validate password if it's a local user
    if (user.authProvider === 'local' && user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      message: 'Signin successful, bank re-linked',
      user,
      token
    });
  } catch (err) {
    console.error('❌ Signin error:', err.message);
    res.status(500).json({ message: 'Signin failed', error: err.message });
  }
});

export default userRouter;
