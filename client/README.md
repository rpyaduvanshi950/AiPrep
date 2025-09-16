[AiPrep Frontend (client)]

This is the frontend for the AiPrep Chat-to-Visualization app, built with React 18 and Vite. It provides a digital-themed, responsive UI for chatting and viewing animated visualizations.

## Features
- Split-screen layout: left for visualization, right for chat history.
- Fixed, centered chat input bar at the bottom.
- Real-time updates using Server-Sent Events (SSE).
- Digital dark theme with modern styling.
- Displays raw SSE event data in chat history for debugging.

## File Structure
```
client/
├── src/
│   ├── App.jsx                  # Main app logic
│   ├── api.js                   # API wrapper for backend calls
│   ├── styles.css               # Digital theme and layout
│   └── components/
│       ├── ChatBox.jsx          # Chat input bar
│       ├── ChatPanel.jsx        # Chat history display
│       └── VisualizationCanvas.jsx # Animated visualization
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite config (proxy setup)
└── ...
```

## How It Works
- Users type questions in the chat bar and send them to the backend.
- The frontend subscribes to `/api/stream` for live updates (questions/answers).
- Visualization canvas animates answers as soon as they arrive.
- Chat history shows both questions and answers, including raw SSE event data for transparency.

## Setup & Running
1. Install dependencies:
	```bash
	npm install
	```
2. Start the frontend:
	```bash
	npm run dev
	```
	The app will run on `http://localhost:5173`.

## Customization
- **Styling:** Edit `src/styles.css` for colors, fonts, and layout.
- **Chat Logic:** Update `src/components/ChatPanel.jsx` for history display.
- **Visualization:** Extend `VisualizationCanvas.jsx` for new shapes/animations.
- **API:** Modify `src/api.js` for custom backend endpoints.

## Troubleshooting
- If you see connection errors, ensure the backend is running on `http://localhost:5050`.
- SSE events may be blocked by browser extensions or firewalls.
- Use browser DevTools to inspect network requests and SSE events.

## License
MIT
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
