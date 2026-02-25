@echo off
echo ========================================
echo CoderNautics Tauri Setup
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version

REM Check Rust
where rustc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Rust is not installed!
    echo Please install Rust from https://rustup.rs/
    echo Rust is required for building the desktop app.
    pause
    exit /b 1
)
echo [OK] Rust found: 
rustc --version

echo.
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now:
echo   1. Run in development mode: npm run tauri:dev
echo   2. Build for production: npm run tauri:build
echo.
echo For build issues, use: build-tauri.bat
echo.
pause
