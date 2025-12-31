import client from "prom-client";
import mongoose from "mongoose";
import { register } from "./prometheus.js";
import { activeUsersTTL } from "../Services/activeUsers.js";

export const appUp = new client.Gauge({
  name: "app_up",
  help: "Application availability",
  registers: [register],
});

export const activeUsers = new client.Gauge({
  name: "active_users",
  help: "Currently active users",
  registers: [register],
});

export const dbUp = new client.Gauge({
  name: "db_up",
  help: "Database connectivity (1 = up, 0 = down)",
  registers: [register],
});

export const dbLatency = new client.Histogram({
  name: "db_ping_latency_ms",
  help: "MongoDB ping latency",
  buckets: [5, 10, 20, 50, 100, 200, 500],
  registers: [register],
});

/* ---------- Init ---------- */

appUp.set(1);

setInterval(() => {
  activeUsers.set(activeUsersTTL.countActive());
}, 5000);

mongoose.connection.on("connected", () => dbUp.set(1));
mongoose.connection.on("disconnected", () => dbUp.set(0));
