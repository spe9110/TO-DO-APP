import Brevo from "@getbrevo/brevo";
import logger from "../Config/logging.js";
import dotenv from "dotenv";

dotenv.config();

let brevoClient = null;

export const getBrevoClient = () => {
  if (!process.env.BREVO_API_KEY) {
    logger.warn("BREVO_API_KEY missing - emails disabled");
    return null;
  }

  if (!brevoClient) {
    const api = new Brevo.TransactionalEmailsApi();
    api.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
    brevoClient = api;
  }

  return brevoClient;
};

export const sendEmail = async ({ to, subject, html }) => {
  const client = getBrevoClient();
  if (!client) return;

  return client.sendTransacEmail(
    new Brevo.SendSmtpEmail({
      to: [{ email: to }],
      subject,
      htmlContent: html,
      sender: {
        email: "codewithspencer23@gmail.com", // must be verified in Brevo
        name: "To Do App",
      },
    })
  );
};
