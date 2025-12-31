import client from "prom-client";
import { register } from "./prometheus.js";

export const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const httpErrors = new client.Counter({
  name: "http_requests_errors_total",
  help: "4xx and 5xx responses",
  labelNames: ["method", "route"],
  registers: [register],
});

export const http5xxErrors = new client.Counter({
  name: "http_requests_5xx_total",
  help: "5xx responses",
  labelNames: ["method", "route"],
  registers: [register],
});
