import { sendEmail } from "./emailService.js";

export const sendWelcomeEmailAsync = (user) => {
  setImmediate(async () => {
    try {
      const html = `
        <h2>Welcome to To Do App 🎉</h2>
        <p>Hello <strong>${user.firstName}</strong>,</p>
        <p>We’re happy to have you on board.</p>
        <p>Start organizing your tasks 🚀</p>
        <br/>
        <p>— To Do App Team</p>
      `;

      await Promise.race([
        sendEmail({
          from: `"To Do App" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Welcome to To Do App 🎉",
          html
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SMTP timeout")), 5000)
        )
      ]);

    } catch (err) {
      console.warn("Welcome email skipped:", err.message);
    }
  });
};
