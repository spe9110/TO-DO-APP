import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "spencernsituzola@gmail.com",
        pass: "ztwqdwaxeswkfaaa"
    },
    tls: {
        rejectUnauthorized: false // ⚠️ désactive la vérification SSL
    }
});

export const sendEmail = async (emailOptions) => {
  return transporter.sendMail(emailOptions);
};
