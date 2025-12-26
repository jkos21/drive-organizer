import subprocess
import os

print("Starting debug run...")
try:
    # Run uvicorn for 5 seconds
    proc = subprocess.run(
        ["venv/bin/uvicorn", "main:app", "--reload"],
        cwd="backend",
        capture_output=True, # Capture output
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
