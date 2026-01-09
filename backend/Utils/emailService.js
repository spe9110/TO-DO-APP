import { Resend } from "resend";
import logger from "../Config/logging.js";

let resendClient = null;

export const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY missing - emails disabled");
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
};

export const sendEmail = async ({ to, subject, html }) => {
  const resend = getResendClient();
  if (!resend) return;

  return resend.emails.send({
    from: "To Do App <onboarding@resend.dev>",
    to: [to],
    subject,
    html,
  });
};
