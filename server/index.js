import express from 'express';
import connectDB from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send('🚀 Server is running and DB is connected!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
