@echo off
title DiskLens — Smart Disk Analyzer & Cleanup Advisor
color 0b

echo ================================================================
echo               DiskLens v1.0 (Smart Disk Advisor)               
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] Memeriksa dependensi backend & shortcut desktop...
python -m pip install -r backend/requirements.txt --quiet --disable-pip-version-check
python create_desktop_shortcut.py >nul 2>&1

echo [2/3] Memeriksa frontend UI modern (React + Vite)...
if not exist "frontend\dist" (
    cd frontend
    call npm install --quiet
    call npm run build
    cd ..
)

echo [3/3] Menjalankan Server DiskLens...
echo.
echo ================================================================
echo   Aplikasi aktif di: http://127.0.0.1:8000
echo   Menjalankan browser secara otomatis...
echo ================================================================
echo.

start http://127.0.0.1:8000
python backend/main.py

pause
