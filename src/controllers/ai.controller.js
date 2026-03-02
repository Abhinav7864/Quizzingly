import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const { Groq } = require("groq-sdk");
import prisma from "../db/prisma.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

export const generateQuizAI = async (req, res) => {
  console.log("--- Generate Quiz AI Started ---");
  console.log("Available Env Keys:", Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("KEY")));
  console.log("Initializing Groq API...");
  const userId = req.user.id;
  const { prompt } = req.body;
  const file = req.file;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  if (!file) {
    return res.status(400).json({ message: "PDF file is required" });
  }

  try {
    console.log("Parsing PDF...");
    const dataBuffer = file.buffer;
    
    let pdfText = "";
    try {
      // For pdf-parse v2.4.5+, it's a class-based API
      if (pdf && pdf.PDFParse) {
        console.log("Using modern PDFParse class API");
        const parser = new pdf.PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        pdfText = result.text;
        // Clean up resources if needed
        if (parser.destroy) await parser.destroy();
      } else if (typeof pdf === 'function') {
        console.log("Using legacy functional PDF parse API");
        const pdfData = await pdf(dataBuffer);
        pdfText = pdfData.text;
      } else if (pdf && pdf.default && typeof pdf.default === 'function') {
        console.log("Using legacy functional PDF parse API (.default)");
        const pdfData = await pdf.default(dataBuffer);
        pdfText = pdfData.text;
      } else {
        throw new Error("No valid PDF parsing function found in module");
      }
    } catch (parseError) {
      console.error("PDF Parsing error:", parseError);
      return res.status(500).json({ message: "Failed to parse PDF content: " + parseError.message });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({ message: "Could not extract text from PDF (it might be empty or image-based)" });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({ message: "Could not extract text from PDF" });
    }

  console.log("Initializing Groq API...");
    let apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error("Groq API Key is missing!");
      return res.status(500).json({ message: "Groq API key not configured on server" });
    }

    if (typeof apiKey !== 'string') {
      apiKey = String(apiKey);
    }
    
    console.log("API Key type:", typeof apiKey);
    console.log("API Key length:", apiKey.length);
    console.log("Using API Key (first 5 chars):", apiKey.slice(0, 5));
    const groq = new Groq.Groq(apiKey);
    
    console.log("Getting generative model...");
    const model = "llama-3.1-8b-instant";

    console.log("Preparing AI Prompt with PDF text length:", pdfText.length);
    const aiPrompt = `
      Generate a quiz based on the following text extracted from a PDF:
      --- PDF TEXT START ---
      ${pdfText.substring(0, 15000)}
      --- PDF TEXT END ---

      User's additional instructions: ${prompt}

      Return the response strictly as a JSON object with the following structure:
      {
        "title": "Quiz Title (based on the content)",
        "questions": [
          {
            "text": "Question Text",
            "options": [
              { "text": "Option Text", "isCorrect": true },
              { "text": "Option Text", "isCorrect": false },
              { "text": "Option Text", "isCorrect": false },
              { "text": "Option Text", "isCorrect": false }
            ]
          }
        ]
      }
      
      Important: 
      - Provide exactly 4 options per question.
      - Ensure only one option is correct.
      - Return ONLY the JSON, no other text or formatting blocks.
    `;

    console.log("Calling Groq chat completion...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: aiPrompt }],
      model: model,
      temperature: 0.7,
      max_tokens: 4096,
    });
    console.log("Groq chat completion call completed.");
    
    let responseText;
    try {
      responseText = chatCompletion.choices[0]?.message?.content?.trim() || "";
      console.log("RAW Groq Response:", responseText);
    } catch (textError) {
      console.error("Groq response error:", textError);
      return res.status(500).json({ 
        message: "AI response failed. Try a different prompt." 
      });
    }

    console.log("AI Response received, parsing...");
    
    // Sometimes AI returns JSON wrapped in markdown code blocks
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    
    let quizData;
    try {
      quizData = JSON.parse(jsonString);
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid response format: Missing questions array");
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", jsonString);
      return res.status(500).json({ 
        message: "AI generated an invalid format. Please try again.",
        error: parseError.message 
      });
    }

    console.log(`Saving generated quiz "${quizData.title}" with ${quizData.questions.length} questions...`);
    try {
      const quiz = await prisma.quiz.create({
        data: {
          title: quizData.title || "AI Generated Quiz",
          creatorId: userId,
          questions: {
            create: quizData.questions.map((q) => ({
              text: q.text,
              options: {
                create: q.options.map((o) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                })),
              },
            })),
          },
        },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });

      console.log("Quiz generated and saved successfully!");
      res.status(201).json(quiz);
    } catch (dbError) {
      console.error("Database error saving AI quiz:", dbError);
      return res.status(500).json({ 
        message: "Error saving generated quiz to database.",
        error: dbError.message 
      });
    }

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "An error occurred during AI quiz generation" });
  }
};
