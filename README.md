# AiPrep: Chat-to-Visualization App

This project is a full-stack application that allows users to ask questions and receive animated visualizations as answers. It features a modern digital UI, real-time updates, and a split layout for visualization and chat history.

## Project Structure

```
AiPrep/
├── server/         # Backend (Node.js + Express)
│   ├── index.js
│   ├── questions.json
│   ├── answers.json
│   ├── package.json
│   └── ...
├── client/         # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── styles.css
│   │   └── components/
│   │       ├── ChatBox.jsx
│   │       ├── ChatPanel.jsx
│   │       └── VisualizationCanvas.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── README.md       # General project documentation
```

## Features
- Ask questions via chat and receive animated visualizations.
- Real-time updates using Server-Sent Events (SSE).
- Responsive, digital-themed UI with split layout.
- Backend stores all questions and answers with timestamps.
- Visualization canvas supports circles, rectangles, arrows, text, and multiple animation types.


## Quick Start (Recommended)


You can use the provided Python script to automatically install dependencies and run both frontend and backend servers:

```bash
python3 main.py
```

This will:
- Install npm dependencies in both `server` and `client` folders
- Start the backend at `http://localhost:5050`
- Start the frontend at `http://localhost:5173`
- Show all API endpoints for both

### Manual Setup (Advanced)

#### Prerequisites
- Node.js (v18+ recommended)
- npm

#### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
- The backend runs on `http://localhost:5050`.
- Endpoints:
  - `POST /api/questions` — Submit a question (requires `{ userId, question }`)
  - `GET /api/questions` — Fetch all questions
  - `GET /api/answers/:id` — Fetch answer by ID
  - `GET /api/stream` — Subscribe to SSE for real-time updates

#### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
- The frontend runs on `http://localhost:5173`.
- Vite proxy automatically forwards `/api` requests to the backend.

#### 3. Usage
- Open `http://localhost:5173` in your browser.
- Type a question in the chat bar at the bottom center and press Send.
- Watch the visualization animate and see the answer appear in the chat history.

## Customization
- **Styling:** Edit `client/src/styles.css` for UI changes.
- **Visualization Logic:** Update `VisualizationCanvas.jsx` for new shapes/animations.
- **Backend Logic:** Extend `server/index.js` for new endpoints or LLM integrations.

## Troubleshooting
- If you see 404 or connection errors, ensure both frontend and backend are running.
- For real-time updates, check that `/api/stream` is reachable and not blocked by firewalls.
- Use browser DevTools for debugging network requests and SSE events.

## License
MIT

---
See `server/README.md` and `client/README.md` for more details on each part.
