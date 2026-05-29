#!/bin/bash
set -e
echo "=== CyberInspect AI Local Setup (No Docker) ==="

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "[ERROR] Node.js not found. Please install Node.js v20+ from https://nodejs.org"
  exit 1
else
  NODE_VER=$(node -v)
  echo "[OK] Node.js found: $NODE_VER"
fi

# Check Python
if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
  echo "[ERROR] Python not found. Please install Python 3.11+ from https://python.org"
  exit 1
else
  PYTHON_CMD="python3"
  if ! command -v python3 &>/dev/null; then
    PYTHON_CMD="python"
  fi
  PYTHON_VER=$($PYTHON_CMD --version)
  echo "[OK] Python found: $PYTHON_VER"
fi

# Copy env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[WARNING] Created .env from .env.example."
  # Generate secret key
  JWT_SECRET=$($PYTHON_CMD -c "import secrets; print(secrets.token_hex(32))")
  sed -i.bak "s/CHANGE_ME_generate_with_python_secrets_token_hex_32/$JWT_SECRET/g" .env && rm .env.bak
  echo "[OK] Generated and added JWT_SECRET_KEY to your .env"
fi

echo "[SETUP] Installing backend dependencies..."
cd backend
if [ ! -d venv ]; then
  $PYTHON_CMD -m venv venv
  echo "[OK] Created virtual environment (venv)"
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "[SETUP] Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "[SUCCESS] Setup Complete!"
echo "--------------------------------------------------------"
echo "To run the application locally:"
echo "1. Make sure your local PostgreSQL and Redis servers are running."
echo "2. Edit the .env file to adjust database or other secrets if needed."
echo "3. Run the backend:"
echo "   cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo "4. Run the frontend:"
echo "   cd frontend && npm run dev"
echo "--------------------------------------------------------"
echo "Frontend URL: http://localhost:3000"
echo "Backend API:  http://localhost:8000/docs"

