import { sendEmail } from "./emailBrevo.js";

export const sendWelcomeEmailAsync = async (user) => {
  const html = `
    <h2>Welcome to To Do App 🎉</h2>
    <p>Hello <strong>${user.firstName}</strong>,</p>
    <p>We’re happy to have you on board.</p>
    <p>Start organizing your tasks 🚀</p>
    <br/>
    <p>— To Do App Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to To Do App 🎉",
    html,
  });
};



/*
import { sendEmail } from "./emailService.js";

export const sendWelcomeEmailAsync = async (user) => {
  const html = `
    <h2>Welcome to To Do App 🎉</h2>
    <p>Hello <strong>${user.firstName}</strong>,</p>
    <p>We’re happy to have you on board.</p>
    <p>Start organizing your tasks 🚀</p>
    <br/>
    <p>— To Do App Team</p>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to To Do App 🎉",
    html,
  });
};

*/ 