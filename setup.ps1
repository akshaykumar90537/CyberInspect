Write-Host "=== CyberInspect AI Windows Local Setup (No Docker) ===" -ForegroundColor Cyan

# 1. Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js not found. Please install Node.js v20+ from https://nodejs.org" -ForegroundColor Red
    Exit
}
$nodeVer = node -v
Write-Host "[OK] Node.js found: $nodeVer" -ForegroundColor Green

# 2. Check Python
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Python not found. Please install Python 3.11+ from https://python.org" -ForegroundColor Red
    Exit
}
$pythonVer = python --version
Write-Host "[OK] Python found: $pythonVer" -ForegroundColor Green

# 3. Copy env and generate JWT Secret
$envPath = ".\.env"
if (!(Test-Path $envPath)) {
    Copy-Item ".\.env.example" $envPath
    Write-Host "[WARNING] Created .env from .env.example." -ForegroundColor Yellow
    
    # Generate secret key natively in PowerShell
    $bytes = New-Object Byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $jwtSecret = [System.BitConverter]::ToString($bytes) -replace '-'
    
    $envContent = Get-Content $envPath
    $envContent = $envContent -replace "CHANGE_ME_generate_with_python_secrets_token_hex_32", $jwtSecret.ToLower()
    Set-Content $envPath $envContent
    Write-Host "[OK] Generated and added JWT_SECRET_KEY to your .env" -ForegroundColor Green
}

# 4. Setup Backend Virtual Environment and dependencies
Write-Host "`n[SETUP] Setting up backend..." -ForegroundColor Cyan
Push-Location backend
if (!(Test-Path "venv")) {
    python -m venv venv
    Write-Host "[OK] Created virtual environment (venv)" -ForegroundColor Green
}
Write-Host "Installing backend dependencies from requirements.txt..."
.\venv\Scripts\pip install -r requirements.txt
Pop-Location

# 5. Setup Frontend dependencies
Write-Host "`n[SETUP] Setting up frontend..." -ForegroundColor Cyan
Push-Location frontend
Write-Host "Installing frontend dependencies (npm install)..."
npm install
Pop-Location

# 6. Success Output
Write-Host "`n[SUCCESS] Setup Complete!" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "To run the application locally on Windows:"
Write-Host "1. Make sure your local PostgreSQL and Redis servers are running."
Write-Host "2. Edit the .env file to adjust database or other secrets if needed."
Write-Host "3. Run the backend (Terminal 1):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "   uvicorn app.main:app --reload --port 8000" -ForegroundColor White
Write-Host "4. Run the frontend (Terminal 2):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "--------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API:  http://localhost:8000/docs" -ForegroundColor Cyan
