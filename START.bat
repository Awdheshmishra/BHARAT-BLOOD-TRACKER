@echo off
echo.
echo  ==========================================
echo   BHARAT BLOOD TRACKER - STARTING UP
echo  ==========================================
echo.

echo  [1/3] Installing dependencies...
call npm install
cd backend && call npm install && cd ..
cd frontend && call npm install && cd ..
echo  Dependencies installed!
echo.

echo  [2/3] Seeding database with Lucknow hospitals...
cd backend && call node utils/seed.js && cd ..
echo.

echo  [3/3] Starting servers...
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo.
call npm run dev
