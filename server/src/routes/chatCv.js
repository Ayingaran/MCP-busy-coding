import express from "express";
import { loadResume, answerQuestion } from "../services/cvService.js";

export const chatRouter = express.Router();

// expose raw resume for transparency
chatRouter.get("/resume", async (req, res) => {
  try {
    const resume = await loadResume();
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: "Failed to load resume", details: String(err) });
  }
});

// Q&A endpoint
chatRouter.post("/chat-cv", async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing 'question' string in body" });
    }
    const resume = await loadResume();
    const answer = answerQuestion(resume, question);
    res.json({ question, answer });
  } catch (err) {
    res.status(500).json({ error: "Failed to answer question", details: String(err) });
  }
});
