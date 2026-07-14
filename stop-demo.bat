@echo off
echo Stopping ArenaOS AI Servers...

:: Kill node (Next.js)
taskkill /F /IM node.exe /T >nul 2>&1

:: Kill uvicorn / python (FastAPI)
taskkill /F /IM uvicorn.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1

echo Done! The servers have been shut down.
