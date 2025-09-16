// check-gemini.js
import dotenv from 'dotenv';
dotenv.config();

async function checkGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not set in .env');
    process.exit(1);
  }
  try {
    const fetch = (await import('node-fetch')).default;
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const prompt = `Respond ONLY with a JSON object with two keys: \"text\" (a simple explanation of the following question) and \"visualization\" (an object with id, duration, fps, and layers as described below). Do not include any extra text, markdown, or formatting.\n\nThe \"visualization\" object should have:\n- id: a string\n- duration: number (ms)\n- fps: number\n- layers: array of objects with id, type (circle, rect, arrow, text), props, and animations.\n\nQuestion: Explain law of gravitation`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (raw) {
      console.log('Gemini raw response:\n', raw.trim());
      try {
        const parsed = JSON.parse(raw);
        console.log('\nParsed JSON:', parsed);
      } catch (e) {
        console.log('\nCould not parse as JSON.');
      }
      process.exit(0);
    }
    console.error('Gemini key did not return expected response:', data);
    process.exit(2);
  } catch (err) {
    console.error('Error checking Gemini key:', err);
    process.exit(3);
  }
}

checkGemini();
