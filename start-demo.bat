@echo off
title ArenaOS AI Server
color 0B

echo ========================================================
echo                 ArenaOS AI Command Center               
echo ========================================================
echo.

echo [+] Setting up Python Backend...
cd backend
if not exist venv (
    echo [!] Virtual environment not found. Creating one...
    python -m venv venv || py -m venv venv || python3 -m venv venv
    echo [!] Installing requirements...
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echo [+] Starting FastAPI Backend on Port 8000...
start /B cmd /c "uvicorn main:app --reload --port 8000"
cd ..

echo [+] Starting Next.js Frontend on Port 3000...
start /B cmd /c "cd frontend && npm run dev"

echo.
echo [+] Waiting for servers to initialize (5 seconds)...
timeout /t 5 /nobreak > nul

echo [+] Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo ========================================================
echo   Servers are running in the background of this window.
echo   Press any key in this window to STOP the servers.
echo ========================================================
pause > nul

call stop-demo.bat
