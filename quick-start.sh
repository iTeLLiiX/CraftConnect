#!/bin/bash

# CraftConnect Quick Start Script
# This script helps you get CraftConnect up and running quickly

set -e

echo "🚀 CraftConnect Quick Start"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "⚠️  .env.local file not found. Creating from template..."
    cp env.example .env.local
    echo "✅ Created .env.local from template"
    echo ""
    echo "📝 Please edit .env.local and add your Supabase configuration:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "   You can find these values in your Supabase project dashboard."
    echo ""
    read -p "Press Enter when you've configured .env.local..."
fi

# Check if required environment variables are set
echo ""
echo "🔍 Checking environment configuration..."

if [ -f .env.local ]; then
    source .env.local
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your_supabase_project_url" ]; then
        echo "❌ NEXT_PUBLIC_SUPABASE_URL is not configured"
        echo "   Please edit .env.local and add your Supabase project URL"
        exit 1
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your_supabase_anon_key" ]; then
        echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured"
        echo "   Please edit .env.local and add your Supabase anon key"
        exit 1
    fi
    
    echo "✅ Environment variables are configured"
else
    echo "❌ .env.local file not found"
    exit 1
fi

# Build the application
echo ""
echo "🔨 Building the application..."
npm run build

# Start the development server
echo ""
echo "🎉 Starting development server..."
echo "   The application will be available at: http://localhost:3000"
echo ""
echo "📚 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Register a new account"
echo "   3. Create your first job posting"
echo ""
echo "📖 For more information, see:"
echo "   - README.md - Project documentation"
echo "   - SUPABASE_SETUP.md - Supabase setup guide"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo ""

npm run dev
