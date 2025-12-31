@echo off
echo ========================================
echo FIQ Finance Manager - Build Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo.

echo ========================================
echo Building FIQ Finance Manager...
echo This may take 2-5 minutes...
echo ========================================
echo.

echo Cleaning electron-builder cache...
rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul
echo.

call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD COMPLETE! ✓
echo ========================================
echo.
echo Your executable files are in the 'dist' folder:
echo.
dir /b dist\*.exe
echo.
echo You can now:
echo 1. Test the portable EXE
echo 2. Copy it to Desktop
echo 3. Share it with others
echo.
echo Press any key to open dist folder...
pause >nul
start explorer dist
