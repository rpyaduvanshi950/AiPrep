import subprocess
import sys
import os

# Paths to frontend and backend
BACKEND_PATH = os.path.join(os.path.dirname(__file__), 'server')
FRONTEND_PATH = os.path.join(os.path.dirname(__file__), 'client')

def run_cmd(cmd, cwd):
    print(f"\nRunning: {' '.join(cmd)} in {cwd}")
    proc = subprocess.Popen(cmd, cwd=cwd)
    proc.wait()
    if proc.returncode != 0:
        print(f"Error running {' '.join(cmd)} in {cwd}")
        sys.exit(proc.returncode)

print("Installing backend dependencies...")
run_cmd(['npm', 'install'], BACKEND_PATH)
print("Installing frontend dependencies...")
run_cmd(['npm', 'install'], FRONTEND_PATH)

print("\nStarting AiPrep backend (server)...")
backend_proc = subprocess.Popen(['npm', 'run', 'dev'], cwd=BACKEND_PATH)
print("Backend running at: http://localhost:5050")
print("API endpoints:")
print("  POST   /api/questions        (submit question)")
print("  GET    /api/questions        (list questions)")
print("  GET    /api/answers/:id      (get answer)")
print("  GET    /api/stream           (SSE events)")

print("\nStarting AiPrep frontend (client)...")
frontend_proc = subprocess.Popen(['npm', 'run', 'dev'], cwd=FRONTEND_PATH)
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
