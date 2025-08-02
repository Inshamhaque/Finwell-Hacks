import express from 'express';
import connectDB from './db/db.js';
import dotenv from 'dotenv';
import userRouter from './Routes/UserRouter.js';
import cors from "cors"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

connectDB();

app.use('/user',userRouter);

app.get('/', (req, res) => {
  res.send(' Server is running and DB is connected!');
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
