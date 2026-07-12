@echo off
REM ============================================================
REM  start.bat
REM  Double-click this file every day to launch Photo Studio.
REM  It starts the backend, the frontend, and opens your
REM  browser automatically. Keep both black windows open while
REM  using the app - closing them shuts the app down.
REM ============================================================

echo Starting Photo Studio...

REM Start the Python backend (face recognition server) in its own window
start "Photo Studio - Backend" cmd /k "cd scripts && call venv\Scripts\activate.bat && python server.py"

REM Give the backend a few seconds to fully start
timeout /t 4 /nobreak >nul

REM Start the Next.js frontend in its own window
start "Photo Studio - Frontend" cmd /k "npm start"

REM Give the frontend a few seconds to start, then open the browser
timeout /t 6 /nobreak >nul
start http://localhost:3000

echo.
echo Photo Studio is now running.
echo Two windows opened (Backend + Frontend) - keep them open.
echo Closing this window is fine, but keep the other two open.
