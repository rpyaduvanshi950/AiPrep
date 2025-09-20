
# AiPrep Backend (server)

This is the backend for the AiPrep Chat-to-Visualization app. It is built with Node.js and Express, providing REST APIs and Server-Sent Events (SSE) for real-time communication with the frontend.

## Features
- Accepts questions from users and stores them with timestamps
- Generates answers and visualization specs for each question
- Provides real-time updates via SSE (`/api/stream`)
- Stores all questions and answers in JSON files for persistence
- Gemini integration: can generate GSAP code for advanced frontend animation (optional)

## File Structure
```
server/
├── index.js           # Main Express server
├── questions.json     # Stores all submitted questions
├── answers.json       # Stores all generated answers
├── package.json       # Node.js dependencies and scripts
├── check-gemini.js    # (Optional) Gemini integration
└── ...
```

## API Endpoints
- `POST /api/questions`
  - Body: `{ userId, question }`
  - Stores the question and returns a status and answerId
- `GET /api/questions`
  - Returns all questions
- `GET /api/answers/:id`
  - Returns the answer and visualization spec for a given question
- `GET /api/stream`
  - SSE endpoint for real-time updates (events: `question`, `answer`)

## Data Format
- **Question:**
  ```json
  {
    "id": "<uuid>",
    "userId": "<string>",
    "question": "<string>",
    "timestamp": "<ISO8601>"
  }
  ```
- **Answer:**
  ```json
  {
    "id": "<uuid>",
    "answer": "<string>",
    "visualization": { ... },
    "geminiCode": "<string>",
    "timestamp": "<ISO8601>"
  }
  ```

## Running the Backend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5050`

## Development Notes
- All data is stored in `questions.json` and `answers.json` for easy inspection and debugging
- SSE events are sent for every new question and answer, allowing the frontend to update live
- To test SSE manually:
  ```bash
  curl -i http://localhost:5050/api/stream
  ```
- For LLM or Gemini integration, see `check-gemini.js` (customize as needed)

## Troubleshooting
- Ensure Node.js v18+ is installed
- If SSE is not working, check for CORS issues or firewall blocks
- For persistent storage, consider using a database instead of JSON files

## License
MIT
