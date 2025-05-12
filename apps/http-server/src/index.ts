import express from "express";
import cors from 'cors';
import { indexRouter } from "./routes/v1/index.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use("/api/v1/", indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});