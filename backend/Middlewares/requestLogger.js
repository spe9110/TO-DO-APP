import { v4 as uuidv4 } from "uuid";
import { createRequestLogger } from "../Config/logging.js";
import {
  httpDuration,
  httpRequests,
  httpErrors,
  http5xxErrors,
} from "../Monitoring/requestMetrics.js";

export const requestLogger = (req, res, next) => {
  const start = process.hrtime();

  // Correlation ID
  req.requestId = uuidv4();

  // Request-scoped logger
  req.log = createRequestLogger(req);

  // Cardinality-safe route
  const route = req.route?.path || "unmatched";

  // Request start log
  req.log.info("HTTP request start", {
    method: req.method,
    route,
  });

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    const status = String(res.statusCode);

    // Prometheus metrics
    httpDuration.labels(req.method, route, status).observe(duration);
    httpRequests.labels(req.method, route, status).inc();

    if (res.statusCode >= 400) {
      httpErrors.labels(req.method, route).inc();
    }

    if (res.statusCode >= 500) {
      http5xxErrors.labels(req.method, route).inc();
    }

    // Request end log
    req.log.info("HTTP request end", {
      status_code: res.statusCode,
      duration_sec: Number(duration.toFixed(3)),
    });
  });

  next();
};
