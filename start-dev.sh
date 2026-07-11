#!/bin/bash

# Noura AI - Frontend Development Script
# Usage: ./start-dev.sh

echo "🚀 Starting Noura AI Frontend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Start Frontend
echo "🎨 Starting Frontend Development Server (Port 3000)..."
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!
echo "✅ Frontend PID: $FRONTEND_PID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Noura AI is Running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Frontend:  http://localhost:3000"
echo ""
echo "👤 Test Credentials:"
echo "   Admin:    AD-2026-001 / admin123"
echo "   Doctor:   DR-2026-001 / doctor123"
echo "   Nurse:    NU-2026-001 / nurse123"
echo "   Patient:  PT-2026-001 / patient123"
echo ""
echo "⏹️  To stop the server:"
echo "   kill $FRONTEND_PID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

wait
