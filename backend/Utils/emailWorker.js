import { emailQueue } from "./emailQueue.js";
import { sendEmail } from "./emailService.js";

emailQueue.process(async (job) => {
  const { to, firstName } = job.data;

  const html = `
    <h2>Welcome to To Do App 🎉</h2>
    <p>Hello <strong>${firstName}</strong>,</p>
    <p>We’re happy to have you on board.</p>
    <p>Start organizing your tasks and boost your productivity 🚀</p>
    <br/>
    <p>— To Do App Team</p>
  `;

  await sendEmail({
    from: `"To Do App" <${process.env.MAIL_USER}>`,
    to,
    subject: "Welcome to To Do App 🎉",
    html
  });
});

emailQueue.on("completed", (job) => {
  console.log(`✅ Welcome email sent to ${job.data.to}`);
});

emailQueue.on("failed", (job, err) => {
  console.error(`❌ Email failed for ${job.data.to}`, err.message);
});
