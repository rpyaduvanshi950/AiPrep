import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());


// Always resolve data files relative to this file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const questionsFile = '/home/pushpender/Documents/GitHub/AiPrep/server/questions.json';
const answersFile = '/home/pushpender/Documents/GitHub/AiPrep/server/answers.json';

// In-memory data stores
let questions = [];
let answers = [];

// Load from file if present
if (fs.existsSync(questionsFile)) {
  try {
    questions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8'));
  } catch (e) {
    console.error('Failed to load questions.json:', e);
  }
}
if (fs.existsSync(answersFile)) {
  try {
    answers = JSON.parse(fs.readFileSync(answersFile, 'utf-8'));
  } catch (e) {
    console.error('Failed to load answers.json:', e);
  }
}

function saveQuestions() {
  fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));
}
function saveAnswers() {
  fs.writeFileSync(answersFile, JSON.stringify(answers, null, 2));
}

// SSE clients
const clients = new Set();

function sendEvent(type, payload) {
  const data = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}

// Demo LLM canned responses
const demoLLM = {
  "Explain Newton’s First Law of Motion": {
    text: "Newton’s First Law states that an object will remain at rest or move in a straight line at constant speed unless acted upon by an external force.",
    visualization: {
      id: "vis_newton1",
      duration: 4000,
      fps: 30,
      layers: [
        {
          id: "circle1",
          type: "circle",
          props: { x: 100, y: 200, r: 20, fill: "#3498db" },
          animations: [
            { property: "x", from: 100, to: 400, start: 0, end: 3000 }
          ]
        }
      ]
    }
  },
  "Explain Photosynthesis": {
    text: "Photosynthesis is the process by which green plants use sunlight to make food from carbon dioxide and water, producing oxygen as a byproduct.",
    visualization: {
      id: "vis_photosyn",
      duration: 4000,
      fps: 30,
      layers: [
        {
          id: "rect1",
          type: "rect",
          props: { x: 150, y: 180, width: 100, height: 40, fill: "#27ae60" },
          animations: [
            { property: "pulse", from: 1, to: 1.2, start: 0, end: 2000 }
          ]
        },
        {
          id: "arrow1",
          type: "arrow",
          props: { x: 200, y: 100, dx: 0, dy: 80, stroke: "#f1c40f" },
          animations: [
            { property: "pulse", from: 1, to: 1.1, start: 0, end: 2000 }
          ]
        }
      ]
    }
  },
  "Explain the Solar System": {
    text: "The Solar System consists of the Sun and the objects that orbit it, including planets, moons, asteroids, and comets.",
    visualization: {
      id: "vis_solar",
      duration: 4000,
      fps: 30,
      layers: [
        {
          id: "circle_sun",
          type: "circle",
          props: { x: 250, y: 200, r: 30, fill: "#f39c12" }
        },
        {
          id: "circle_planet",
          type: "circle",
          props: { x: 350, y: 200, r: 10, fill: "#2980b9" },
          animations: [
            { property: "orbit", cx: 250, cy: 200, r: 100, start: 0, end: 4000 }
          ]
        }
      ]
    }
  }
};

// LLM service (demo + Gemini + optional OpenAI integration)
async function callLLM(question) {
  if (demoLLM[question]) {
    // Return canned response
    return demoLLM[question];
  }

  // --- Gemini API integration ---
  if (process.env.GEMINI_API_KEY) {
    try {
      const fetch = (await import('node-fetch')).default;
      const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const prompt = `Respond ONLY with a JSON object with two keys: \\"text\\" (a simple explanation of the following question) and \\"visualization\\" (an object with id, duration, fps, and layers as described below). Do not include any extra text, markdown, or formatting.\n\nThe \\"visualization\\" object should have:\n- id: a string\n- duration: number (ms)\n- fps: number\n- layers: array of objects with id, type (circle, rect, arrow, text), props, and animations.\n\nQuestion: ${question}`;
      const geminiBody = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify(geminiBody)
      });
      const data = await response.json();
      let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (raw) {
        console.log('\nGemini raw response:\n', raw.trim());
        let parsed;
        // Try direct JSON parse
        try {
          parsed = JSON.parse(raw);
          console.log('\nParsed JSON:', parsed);
        } catch (e) {
          // Try to extract JSON from Markdown code block
          const match = raw.match(/```json[\s\S]*?({[\s\S]*})[\s\S]*?```/);
          if (match) {
            try {
              parsed = JSON.parse(match[1]);
              console.log('\nParsed JSON from Markdown block:', parsed);
            } catch (e2) {
              console.log('\nFailed to parse JSON from Markdown block. Returning plain text.');
              return {
                text: raw.trim(),
                visualization: {
                  id: "vis_gemini_text",
                  duration: 2000,
                  fps: 30,
                  layers: []
                }
              };
            }
          } else {
            console.log('\nCould not parse as JSON. Returning plain text.');
            return {
              text: raw.trim(),
              visualization: {
                id: "vis_gemini_text",
                duration: 2000,
                fps: 30,
                layers: []
              }
            };
          }
        }
        if (parsed && parsed.text && parsed.visualization) {
          return parsed;
        }
      }
      // If Gemini response is not usable, fallback
      return {
        text: "Sorry, Gemini could not generate a valid response.",
        visualization: {
          id: "vis_gemini_error",
          duration: 2000,
          fps: 30,
          layers: []
        }
      };
    } catch (err) {
      console.error('Gemini API error:', err);
      return {
        text: "Sorry, Gemini API error.",
        visualization: {
          id: "vis_gemini_error",
          duration: 2000,
          fps: 30,
          layers: []
        }
      };
    }
  }

  // --- Optional: OpenAI integration (uncomment to use) ---
  /*
  if (process.env.OPENAI_API_KEY) {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }]
      })
    });
    const data = await response.json();
    // You would need to parse and format the response to match the expected output
    return {
      text: data.choices[0].message.content,
      visualization: {
        id: "vis_generated",
        duration: 4000,
        fps: 30,
        layers: []
      }
    };
  }
  */
  // Default fallback
  return {
    text: "Sorry, I don't have an answer for that yet.",
    visualization: {
      id: "vis_default",
      duration: 2000,
      fps: 30,
      layers: []
    }
  };
}

// POST /api/questions
app.post('/api/questions', async (req, res) => {
  const { userId, question } = req.body || {};
  if (!userId || !question || typeof userId !== 'string' || typeof question !== 'string') {
    return res.status(400).json({ error: 'Invalid input: userId and question are required.' });
  }

  const questionId = 'q_' + nanoid(8);
  const answerId = 'a_' + nanoid(8);
  const now = Date.now();

  const questionObj = { id: questionId, userId, question, answerId, timestamp: now };

  questions.push(questionObj);
  saveQuestions();
  sendEvent('question_created', { question: questionObj });

  let answerObj;
  try {
    const llmResult = await callLLM(question);
    answerObj = { id: answerId, ...llmResult, questionId, timestamp: Date.now() };
    answers.push(answerObj);
    saveAnswers();
    sendEvent('answer_created', { answer: answerObj });
    // Respond with status and answerId
    res.json({ status: 'answer_generated', questionId, answerId });
  } catch (err) {
    return res.status(500).json({ error: 'LLM service error.' });
  }
});

// GET /api/questions
app.get('/api/questions', (req, res) => {
  res.json(questions.map(q => ({
    id: q.id,
    userId: q.userId,
    question: q.question,
    answerId: q.answerId
  })));
});

// GET /api/answers/:id
app.get('/api/answers/:id', (req, res) => {
  const answer = answers.find(a => a.id === req.params.id);
  if (!answer) {
    return res.status(404).json({ error: 'Answer not found.' });
  }
  res.json(answer);
});

// GET /api/stream (SSE)
app.get('/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  clients.add(res);

  // Remove client on close
  req.on('close', () => {
    clients.delete(res);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});