@echo off
REM Start the backend server
cd backend
start cmd /k "python main.py

REM Start the frontend server
cd ../frontend
start cmd /k " npm run dev"