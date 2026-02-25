@echo off
echo Cleaning previous builds...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out

echo Setting Node memory limit...
set NODE_OPTIONS=--max-old-space-size=4096

echo Building Next.js static export...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo You can now run: npm run tauri:build
) else (
    echo Build failed. Check the error messages above.
)

pause
