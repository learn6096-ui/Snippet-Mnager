#!/bin/bash
# =============================================
# SnipVCS - Fix Environment & Launch
# =============================================
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================="
echo "  SnipVCS - Setup & Launch"
echo "============================================="
echo ""

# Fix /tmp permissions (common Termux issue)
echo "[1/8] Fixing /tmp permissions..."
mkdir -p /tmp 2>/dev/null || true
chmod 1777 /tmp 2>/dev/null || sudo chmod 1777 /tmp 2>/dev/null || true

# Check Node.js
echo "[2/8] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "  Node.js not found. Installing..."
    pkg install nodejs -y 2>/dev/null || apt install nodejs -y 2>/dev/null || {
        echo "ERROR: Cannot install Node.js. Run: pkg install nodejs"
        exit 1
    }
fi
echo "  Node.js $(node --version) found."
echo "  npm $(npm --version) found."

# Install frontend dependencies
echo "[3/8] Installing frontend dependencies..."
cd "$DIR/snippet-manager"
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install 2>&1
echo "  Frontend dependencies installed."
echo ""

# Check Java
echo "[4/8] Checking Java..."
JAVA_OK=false
if command -v java &> /dev/null; then
    echo "  Java found: $(java --version 2>&1 | head -1)"
    JAVA_OK=true
else
    echo "  Java not found. Skipping backend."
    echo "  To install: pkg install openjdk-17"
fi

# Check Maven
MAVEN_OK=false
if [ "$JAVA_OK" = true ]; then
    echo "[5/8] Checking Maven..."
    if command -v mvn &> /dev/null; then
        echo "  Maven found."
        MAVEN_OK=true
    elif [ -f "$DIR/snippet-manager-backend/mvnw" ]; then
        echo "  Using Maven wrapper."
        MAVEN_OK=true
    else
        echo "  Maven not found. Skipping backend build."
        echo "  To install: pkg install maven"
    fi
fi

# Build backend
if [ "$MAVEN_OK" = true ]; then
    echo "[6/8] Building backend..."
    cd "$DIR/snippet-manager-backend"
    mvn clean package -DskipTests -q 2>&1
    echo "  Backend built successfully."
else
    echo "[6/8] Skipping backend build."
fi

# Start frontend
echo "[7/8] Starting frontend on port 5173..."
cd "$DIR/snippet-manager"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
sleep 2

# Start backend
if [ "$MAVEN_OK" = true ]; then
    echo "[8/8] Starting backend on port 8080..."
    cd "$DIR/snippet-manager-backend"
    java -jar target/snippet-manager-backend-1.0.0.jar &
    BACKEND_PID=$!
    sleep 3
else
    echo "[8/8] Skipping backend start."
fi

echo ""
echo "============================================="
echo "  ALL SERVICES RUNNING"
echo "============================================="
echo ""
echo "  Frontend:  http://localhost:5173"
if [ "$MAVEN_OK" = true ]; then
    echo "  Backend:   http://localhost:8080"
    echo "  API Docs:  http://localhost:8080/api"
fi
echo ""
echo "  Press Ctrl+C to stop all services."
echo "============================================="
echo ""

# Wait for user interrupt
trap "echo ''; echo 'Stopping services...'; kill $FRONTEND_PID 2>/dev/null; kill $BACKEND_PID 2>/dev/null; echo 'Done.'; exit 0" INT TERM
wait
