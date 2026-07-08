@echo off
title Smart Panchayat Welfare Scheme System
echo ========================================================
echo   SMART PANCHAYAT WELFARE SCHEME INFORMATION SYSTEM
echo ========================================================
echo.
echo Launching local development environment...
echo.

:: Start the backend service
echo [1/2] Starting Express Node Backend (Port 5000)...
start "Smart Panchayat Backend" cmd /k "cd backend && npm run dev"

:: Start the frontend service
echo [2/2] Starting Vite React Frontend (Port 5173)...
start "Smart Panchayat Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo --------------------------------------------------------
echo Services are starting up:
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000 (status: http://localhost:5000/api/status)
echo.
echo Database Seeding Check:
echo If you haven't seeded yet, run 'npm run seed' in the 'backend' folder.
echo.
echo Press any key to close this launcher console...
echo --------------------------------------------------------
pause > nul
