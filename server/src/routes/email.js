import express from "express";
import { sendEmail } from "../services/emailService.js";

export const emailRouter = express.Router();

emailRouter.post("/send-email", async (req, res) => {
  try {
    const { to, subject, body } = req.body || {};
    if (!to || !subject || typeof body !== "string") {
      return res.status(400).json({ error: "Required fields: to, subject, body" });
    }
    const info = await sendEmail({ to, subject, html: body });
    res.json({ status: "sent", messageId: info.messageId, envelope: info.envelope });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email", details: String(err) });
  }
});
