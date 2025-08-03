import express from 'express';
import connectDB from './db/db.js';
import dotenv from 'dotenv';
import userRouter from './routes/UserRouter.js';
import cors from "cors"
import OcrRouter from './Routes/OcrRouter.js';
import stockRouter from './routes/stock.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

connectDB();

app.use('/user',userRouter);
app.use('/ocr', OcrRouter);
app.use('/stocks',stockRouter);

app.get('/', (req, res) => {
  res.send(' Server is running and DB is connected!');
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
