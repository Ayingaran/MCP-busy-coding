import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, FROM_EMAIL
} = process.env;

// Create transporter on first use
let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: String(SMTP_SECURE).toLowerCase() === "true",
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  const info = await t.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to,
    subject,
    html
  });
  return info;
}
