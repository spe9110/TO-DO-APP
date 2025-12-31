import winston, { format, transports } from "winston";
import os from "os";
import "winston-daily-rotate-file";

const { combine, timestamp, json, errors } = format;

/**
 * SENSITIVE KEYS
 * --------------
 * These keys are automatically redacted everywhere in the logs.
 * Prevents leaking secrets into long-term log storage.
 */
const SENSITIVE_KEYS = ["password", "token", "authorization", "api_key"];

/**
 * sanitize(obj)
 * ----------------
 * Recursively removes sensitive fields from any object.
 * Ensures even nested data never leaks confidential info.
 */
function sanitize(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };

  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clone[key] = "[REDACTED]";
    } else if (typeof clone[key] === "object") {
      clone[key] = sanitize(clone[key]);
    }
  }
  return clone;
}

/**
 * jsonFormat
 * -----------
 * Defines the JSON structured log format:
 *  - timestamp: required for log aggregation
 *  - errors({stack:true}): automatically includes stack trace
 *  - sanitize request bodies before logging them
 *  - JSON output for machine parsing
 */
const jsonFormat = combine(
  timestamp(),
  errors({ stack: true }),
  format((info) => {
    if (info.body) info.body = sanitize(info.body);
    return info;
  })(),
  json()
);

/**
 * logTransports
 * --------------
 * Defines output targets for logs.
 * In production: rotate daily into compressed files (14 days retention)
 * In development: also print colorized logs to the console
 */
const logTransports = [
  new transports.DailyRotateFile({
    filename: `${process.env.LOG_DIR || "logs"}/todo-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    level: process.env.LOG_LEVEL || "info",
  }),
];

// In dev: also show pretty logs in the console
if (process.env.NODE_ENV !== "production") {
  logTransports.push(
    new transports.Console({
      format: combine(format.colorize(), format.simple()),
    })
  );
}

/**
 * logger
 * -------
 * Base Winston logger instance.
 * All logs in the app go through this.
 * Injects service-level metadata into every log entry.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: {
    service: process.env.APP_NAME || "todo_app",
    environment: process.env.NODE_ENV || "development",
    host: os.hostname(),
  },
  format: jsonFormat,
  transports: logTransports,
});

/**
 * createRequestLogger(req)
 * -------------------------
 * Creates a CHILD LOGGER bound to this specific incoming request.
 *
 * Adds:
 *   - request_id       → correlation ID  
 *   - method           → GET, POST, etc  
 *   - route            → /api/users/:id  
 *   - user_id (masked) → "user_ab12cd…"  
 *   - ip               → origin IP  
 *
 * This ensures every log line belonging to this request
 * can be filtered together in Kibana/Grafana.
 */
export function createRequestLogger(req) {
  return logger.child({
    request_id: req.requestId,
    method: req.method,
    route: req.originalUrl,
    ip: req.ip,
    user_id: req.user?.id ? `user_${req.user.id.substring(0, 6)}…` : "anonymous",
  });
}

export default logger;
