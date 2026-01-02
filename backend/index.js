import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDB } from "./Config/DB.js";
import { errorHandler } from "./Middlewares/errorHandler.js";
import { requestLogger } from "./Middlewares/requestLogger.js";
import authRoutes from "./Routes/auth_route.js";
import userRoute from "./Routes/user_route.js";
import todoRoute from "./Routes/todo_route.js";
import metricsRoute from "./Routes/metrics_route.js";
import "./Monitoring/systemMetrics.js"; // initializes gauges

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- Core Middleware ---------- */

app.use(cors({
  origin: "https://spe9110.github.io",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

app.use(requestLogger);

/* ---------- Routes ---------- */

app.use("/api/v1/auth/users", authRoutes);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/todo", todoRoute);
app.use("/api/metrics", metricsRoute);

app.get("/", (req, res) => {
  res.send("Todo backend running");
});

/* ---------- Errors ---------- */

// 404 handler
app.use(('*', (req, res) => {
    res.status(404).json({ message: 'Page not found' });
}))

// Error handler
app.use(errorHandler);

/* ---------- Startup ---------- */

const server = app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

mongoose.connect(process.env.MONGO_URI);

export default server;
