import subprocess
import os

print("Starting debug run for frontend...")
try:
    # Run npm run dev for 5 seconds
    proc = subprocess.run(
        ["npm", "run", "dev"],
        cwd="frontend",
        capture_output=True,
        timeout=5,
        text=True
    )
    print("Process exited with code:", proc.returncode)
    print("STDOUT:", proc.stdout)
    print("STDERR:", proc.stderr)
except subprocess.TimeoutExpired as e:
    print("Timeout expired (Process is likely running).")
    if e.stdout:
        print("STDOUT:", e.stdout.decode('utf-8') if isinstance(e.stdout, bytes) else e.stdout)
    if e.stderr:
        print("STDERR:", e.stderr.decode('utf-8') if isinstance(e.stderr, bytes) else e.stderr)
except Exception as e:
    print("Error:", e)
