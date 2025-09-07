import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESUME_PATH = path.join(__dirname, "../../data/resume.json");

export async function loadResume() {
  const raw = await fs.readFile(RESUME_PATH, "utf-8");
  return JSON.parse(raw);
}

function normalize(text) {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export function answerQuestion(resume, question) {
  const q = normalize(question);

  // Most common questions - add simple rule-based answers for reliability
  if (q.includes("last role") || q.includes("previous role") || q.includes("current role")) {
    const last = [...(resume.roles || [])]
      .sort((a,b)=> new Date(b.end || Date.now()) - new Date(a.end || Date.now()))[0];
    if (last) return `${last.title} at ${last.company} (${last.start} – ${last.end || "Present"})`;
  }
  if (q.includes("experience") && (q.includes("years") || q.includes("year"))) {
    // sum durations in years
    const totalMonths = (resume.roles || []).reduce((acc, r) => {
      const start = new Date(r.start);
      const end = r.end ? new Date(r.end) : new Date();
      const months = (end.getFullYear()-start.getFullYear())*12 + (end.getMonth()-start.getMonth());
      return acc + Math.max(0, months);
    }, 0);
    const years = (totalMonths/12).toFixed(1);
    return `${years} years total professional experience (approx).`;
  }
  if (q.includes("skills")) {
    return `Top skills: ${(resume.skills || []).slice(0, 15).join(", ")}`;
  }
  if (q.includes("education")) {
    return (resume.education || []).map(e => `${e.degree} – ${e.institution} (${e.start} – ${e.end})`).join("; ");
  }
  if (q.includes("projects")) {
    return (resume.projects || []).map(p => `${p.name}: ${p.summary}`).join(" | ");
  }

  // Fallback: keyword search across sections
  const hay = normalize(JSON.stringify(resume));
  // Return a short snippet near best match
  const terms = q.split(/\s+/).filter(Boolean);
  let bestIdx = -1, bestTerm = null;
  for (const t of terms) {
    const idx = hay.indexOf(t);
    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
      bestIdx = idx; bestTerm = t;
    }
  }
  if (bestIdx !== -1) {
    const start = Math.max(0, bestIdx - 120);
    const end = Math.min(hay.length, bestIdx + 180);
    const snippet = hay.slice(start, end).replace(/\s+/g, " ").trim();
    return `I found this relevant snippet around "${bestTerm}": “…${snippet}…”`;
  }
  return "I couldn't find a precise answer in the resume. Try rephrasing.";
}
