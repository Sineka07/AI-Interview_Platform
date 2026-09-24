@echo off
echo ===================================================
echo   Starting AI Interview Platform (Backend + Frontend)
echo ===================================================
echo.

start "AI Interview Backend (Spring Boot)" cmd /k "cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=h2"
timeout /t 5 /nobreak >nul

start "AI Interview Frontend (Vite React)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Backend running at:  http://localhost:8080
echo Frontend running at: http://localhost:5173
echo ===================================================
echo.
