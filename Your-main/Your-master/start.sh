#!/bin/bash
# =============================================
# SnipVCS - Full Setup & Launch Script
# =============================================
set -e

echo "============================================="
echo "  SnipVCS - Setup & Launch"
echo "============================================="
echo ""

# Check prerequisites
echo "[1/6] Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Install it first:"
    echo "  pkg install nodejs"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "WARNING: Java not found. Backend won't start."
    echo "  Install with: pkg install openjdk-17"
    JAVA_AVAILABLE=false
else
    JAVA_AVAILABLE=true
fi

echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
if [ "$JAVA_AVAILABLE" = true ]; then
    echo "  Java: $(java --version 2>&1 | head -1)"
fi
echo ""

# Setup Frontend
echo "[2/6] Installing frontend dependencies..."
cd "$(dirname "$0")/snippet-manager"
npm install 2>&1 | tail -5
echo "  Frontend dependencies installed."
echo ""

# Setup Backend (if Java available)
if [ "$JAVA_AVAILABLE" = true ]; then
    echo "[3/6] Installing backend dependencies..."
    cd "$(dirname "$0")/snippet-manager-backend"
    if command -v mvn &> /dev/null; then
        mvn dependency:resolve -q 2>&1 | tail -3
        echo "  Backend dependencies installed."
    else
        echo "  WARNING: Maven not found. Install with: pkg install maven"
        echo "  Or use the Maven wrapper: ./mvnw dependency:resolve"
    fi
    echo ""
else
    echo "[3/6] Skipping backend (Java not available)"
    echo ""
fi

# Start Frontend
echo "[4/6] Starting frontend dev server..."
cd "$(dirname "$0")/snippet-manager"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"
echo ""

# Start Backend (if available)
if [ "$JAVA_AVAILABLE" = true ] && command -v mvn &> /dev/null; then
    echo "[5/6] Starting backend..."
    cd "$(dirname "$0")/snippet-manager-backend"
    mvn spring-boot:run &
    BACKEND_PID=$!
    echo "  Backend PID: $BACKEND_PID"
    echo ""
else
    echo "[5/6] Skipping backend start"
    echo ""
fi

echo "[6/6] Done!"
echo ""
echo "============================================="
echo "  Frontend: http://localhost:5173"
if [ "$JAVA_AVAILABLE" = true ]; then
    echo "  Backend:  http://localhost:8080"
fi
echo "============================================="
echo ""
echo "Press Ctrl+C to stop all services."
wait
