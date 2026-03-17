import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { Groq } from "groq-sdk";
import { Innertube } from 'youtubei.js';
import prisma from "../db/prisma.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Extract plain text from a PDF buffer */
async function parsePDF(buffer) {
  if (pdf && pdf.PDFParse) {
    const parser = new pdf.PDFParse({ data: buffer });
    const result = await parser.getText();
    if (parser.destroy) await parser.destroy();
    return result.text;
  } else if (typeof pdf === "function") {
    const data = await pdf(buffer);
    return data.text;
  } else if (pdf && pdf.default && typeof pdf.default === "function") {
    const data = await pdf.default(buffer);
    return data.text;
  }
  throw new Error("No valid PDF parsing function found in module");
}

/** Convert an image buffer to a base64 data-URI (for vision models) */
function imageToDataURI(buffer, mimetype) {
  return `data:${mimetype};base64,${buffer.toString("base64")}`;
}

/** Extract a video ID from a full YouTube URL or a bare ID */
function extractVideoId(urlOrId) {
  try {
    const parsed = new URL(urlOrId);
    // youtu.be/ID
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    // youtube.com/watch?v=ID
    return parsed.searchParams.get('v') || urlOrId;
  } catch {
    // Not a URL — assume it's already a raw video ID
    return urlOrId;
  }
}

/** Fetch a YouTube transcript using youtubei.js (Innertube API) */
async function fetchYouTubeTranscript(url) {
  try {
    const videoId = extractVideoId(url);
    const yt = await Innertube.create({ generate_session_locally: true });
    const info = await yt.getInfo(videoId);

    const transcriptData = await info.getTranscript();
    const segments = transcriptData?.transcript?.content?.body?.initial_segments;

    if (!segments || segments.length === 0) {
      throw new Error('No transcript available for this video.');
    }

    const fullText = segments
      .map(s => s?.snippet?.text || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return `YouTube Video Transcript (truncated):\n${fullText.substring(0, 15000)}`;
  } catch (error) {
    console.error('YouTube transcript fetch failed:', error);
    const msg = error?.message || '';

    if (msg.includes('No transcript')) {
      throw new Error(
        'This YouTube video does not have a transcript available. ' +
        'Try a video that has captions/subtitles enabled.'
      );
    }

    throw new Error('Failed to fetch YouTube transcript: ' + msg);
  }
}

// ── main handler ──────────────────────────────────────────────────────────────

export const generateQuizAI = async (req, res) => {
  console.log("--- Generate Quiz AI Started ---");
  const userId = req.user.id;
  const { prompt, youtubeUrl, timeLimit, numQuestions } = req.body;
  const resolvedTimeLimit = parseInt(timeLimit) || 15;
  const resolvedNumQuestions = Math.min(parseInt(numQuestions) || 25, 50);

  const files = req.files || {};
  const pdfFile = files.pdf?.[0] || null;
  const imageFile = files.image?.[0] || null;

  // Validate: must provide at least one source
  if (!prompt && !youtubeUrl && !pdfFile && !imageFile) {
    return res.status(400).json({ message: "Please provide at least a prompt, a PDF, an image, or a YouTube URL." });
  }

  // ── Build context string ──────────────────────────────────────────────────
  let contextParts = [];
  let imageDataURI = null;

  // 1) PDF
  if (pdfFile) {
    try {
      const pdfText = await parsePDF(pdfFile.buffer);
      if (pdfText && pdfText.trim().length > 0) {
        contextParts.push(`=== PDF CONTENT ===\n${pdfText.substring(0, 20000)}`);
      } else {
        return res.status(400).json({ message: "Could not extract text from PDF (it may be empty or image-based)." });
      }
    } catch (err) {
      console.error("PDF parsing error:", err);
      return res.status(500).json({ message: "Failed to parse PDF: " + err.message });
    }
  }

  // 2) Image → pass as base64 to vision-capable model
  if (imageFile) {
    imageDataURI = imageToDataURI(imageFile.buffer, imageFile.mimetype);
    contextParts.push("=== IMAGE ===\n[An image has been provided. Use its content to generate questions.]");
  }

  // 3) YouTube URL
  if (youtubeUrl) {
    try {
      const ytContext = await fetchYouTubeTranscript(youtubeUrl);
      contextParts.push(`=== YOUTUBE VIDEO ===\n${ytContext}`);
    } catch (err) {
      console.error("YouTube URL error:", err);
      return res.status(400).json({ message: err.message });
    }
  }

  // 4) Prompt / topic
  if (prompt) {
    contextParts.push(`=== USER INSTRUCTIONS / TOPIC ===\n${prompt}`);
  }

  const context = contextParts.join("\n\n");

  // ── Groq setup ────────────────────────────────────────────────────────────
  let apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ message: "Groq API key not configured on server." });
  if (typeof apiKey !== "string") apiKey = String(apiKey);

  const groq = new Groq.Groq(apiKey);

  // Choose model: use vision model only when an image is present
  const model = imageDataURI ? "meta-llama/llama-4-scout-17b-16e-instruct" : "llama-3.1-8b-instant";

  // ── Build AI prompt ───────────────────────────────────────────────────────
  const systemPrompt = `You are an expert quiz creator. Your job is to generate comprehensive, accurate, and engaging multiple-choice quiz questions from the provided source material.

CRITICAL CONSTRAINT: 
- You MUST generate EXACTLY ${resolvedNumQuestions} questions. No more, no less.
- Count the questions carefully before returning the response.

Rules:
- Each question must have EXACTLY 4 answer options.
- Exactly ONE option per question must be correct (isCorrect: true); the other three must be false.
- Questions must cover the breadth of the material provided — do not repeat topics.
- Return ONLY a valid JSON object with no markdown fences, no commentary, no extra text.

JSON structure:
{
  "title": "Quiz Title",
  "questions": [
    {
      "text": "Question?",
      "options": [
        { "text": "Correct", "isCorrect": true },
        { "text": "Wrong", "isCorrect": false },
        { "text": "Wrong", "isCorrect": false },
        { "text": "Wrong", "isCorrect": false }
      ]
    }
  ]
}`;

  const userMessage = `Generate a quiz with EXACTLY ${resolvedNumQuestions} questions from the following source material. Ensure the question count is strictly ${resolvedNumQuestions}:\n\n${context}`;

  // ── Messages array (supports vision) ─────────────────────────────────────
  let messages;
  if (imageDataURI) {
    messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userMessage },
          { type: "image_url", image_url: { url: imageDataURI } },
        ],
      },
    ];
  } else {
    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];
  }

  try {
    console.log(`Calling Groq (model: ${model}) with context length: ${context.length}`);
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.6,
      max_tokens: 8192,
    });

    let responseText = chatCompletion.choices[0]?.message?.content?.trim() || "";
    console.log("Raw Groq response length:", responseText.length);

    // Strip any accidental markdown fences
    const jsonString = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

    let quizData;
    try {
      quizData = JSON.parse(jsonString);
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Missing questions array in AI response.");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", jsonString.slice(0, 500));
      return res.status(500).json({ message: "AI generated an invalid format. Please try again.", error: parseError.message });
    }

    console.log(`Saving quiz "${quizData.title}" with exactly ${resolvedNumQuestions} questions (trimmed if necessary)...`);

    // STRICT ENFORCEMENT: Slice the array to match user's requested count exactly
    const finalQuestions = quizData.questions.slice(0, resolvedNumQuestions);

    const quiz = await prisma.quiz.create({
      data: {
        title: quizData.title || "AI Generated Quiz",
        creatorId: userId,
        questions: {
          create: finalQuestions.map((q) => ({
            text: q.text,
            timeLimit: resolvedTimeLimit,
            options: {
              create: q.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });

    console.log("Quiz saved successfully:", quiz.id);
    res.status(201).json(quiz);
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "An error occurred during AI quiz generation: " + error.message });
  }
};
