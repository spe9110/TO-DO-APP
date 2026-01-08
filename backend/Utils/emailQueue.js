import Queue from "bull";

// Create the email queue
export const emailQueue = new Queue("emailQueue", {
  redis: {
    url: process.env.REDIS_URL,
    tls: {
      rejectUnauthorized: false // required for Upstash
    }
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});
