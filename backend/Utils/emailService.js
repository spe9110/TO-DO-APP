import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = ({ to, subject, html }) => {
  return resend.emails.send({
    from: "To Do App <onboarding@resend.dev>",
    to: [to],
    subject,
    html
  });
};
