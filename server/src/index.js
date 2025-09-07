import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { chatRouter } from "./routes/chatCv.js";
import { emailRouter } from "./routes/email.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// MCP: describe capabilities
app.get("/mcp/describe", (req, res) => {
  res.json({
    name: "mcp-cv-email-server",
    version: "1.0.0",
    capabilities: {
      tools: [
        { name: "chat-cv", description: "Q&A over resume.json", path: "/api/chat-cv", method: "POST" },
        { name: "send-email", description: "Send email via SMTP", path: "/api/send-email", method: "POST" }
      ],
      models: [],
      resources: [{ name: "resume", type: "application/json", path: "/api/resume" }]
    },
    ui: { playground: "/" }
  });
});

// Static playground
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api", chatRouter);
app.use("/api", emailRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`MCP server listening on http://localhost:${PORT}`);
});
