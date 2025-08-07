import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Exists' : 'Missing');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId, "to", to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
