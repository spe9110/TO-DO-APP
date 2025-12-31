import client from "prom-client";

export const register = new client.Registry();

register.setDefaultLabels({
  service: "todo-backend",
  env: process.env.NODE_ENV || "dev",
});

client.collectDefaultMetrics({ register });
