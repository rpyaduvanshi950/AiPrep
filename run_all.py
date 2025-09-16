import subprocess
import sys
import os

# Paths to frontend and backend
BACKEND_PATH = os.path.join(os.path.dirname(__file__), 'server')
FRONTEND_PATH = os.path.join(os.path.dirname(__file__), 'client')

# Commands to run
BACKEND_CMD = ['npm', 'run', 'dev']
FRONTEND_CMD = ['npm', 'run', 'dev']

print("Starting AiPrep backend (server)...")
backend_proc = subprocess.Popen(BACKEND_CMD, cwd=BACKEND_PATH)
print("Backend running at: http://localhost:5050")
print("API endpoints:")
print("  POST   /api/questions        (submit question)")
print("  GET    /api/questions        (list questions)")
print("  GET    /api/answers/:id      (get answer)")
print("  GET    /api/stream           (SSE events)")

print("\nStarting AiPrep frontend (client)...")
frontend_proc = subprocess.Popen(FRONTEND_CMD, cwd=FRONTEND_PATH)
print("Frontend running at: http://localhost:5173")
print("API endpoints (proxied to backend):")
print("  POST   /api/questions        (submit question)")
print("  GET    /api/questions        (list questions)")
print("  GET    /api/answers/:id      (get answer)")
print("  GET    /api/stream           (SSE events)")

try:
    print("\nPress Ctrl+C to stop both servers.")
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    print("\nStopping servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
    sys.exit(0)
