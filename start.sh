#!/bin/bash

# Function to kill background processes on exit
trap 'kill $(jobs -p)' EXIT

echo "Starting Backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt &> /dev/null
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
npm install &> /dev/null
npm run dev &
FRONTEND_PID=$!
cd ..

echo "App running. Backend: http://localhost:8000, Frontend: http://localhost:5173"
wait
