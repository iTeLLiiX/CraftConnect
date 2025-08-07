@echo off
REM CraftConnect Quick Start Script for Windows
REM This script helps you get CraftConnect up and running quickly

echo 🚀 CraftConnect Quick Start
echo ==========================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ npm is installed

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

REM Check if .env.local exists
if not exist .env.local (
    echo.
    echo ⚠️  .env.local file not found. Creating from template...
    copy env.example .env.local >nul
    echo ✅ Created .env.local from template
    echo.
    echo 📝 Please edit .env.local and add your Supabase configuration:
    echo    - NEXT_PUBLIC_SUPABASE_URL
    echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo    - SUPABASE_SERVICE_ROLE_KEY
    echo.
    echo    You can find these values in your Supabase project dashboard.
    echo.
    pause
)

REM Build the application
echo.
echo 🔨 Building the application...
call npm run build

REM Start the development server
echo.
echo 🎉 Starting development server...
echo    The application will be available at: http://localhost:3000
echo.
echo 📚 Next steps:
echo    1. Open http://localhost:3000 in your browser
echo    2. Register a new account
echo    3. Create your first job posting
echo.
echo 📖 For more information, see:
echo    - README.md - Project documentation
echo    - SUPABASE_SETUP.md - Supabase setup guide
echo    - DEPLOYMENT.md - Deployment instructions
echo.

call npm run dev
