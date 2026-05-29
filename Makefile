.PHONY: setup frontend backend migrate makemigration clean check

# ─── Setup ────────────────────────────────────────────────────────────────────
setup:
	@echo "Installing dependencies..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "Setup complete. Please create a .env file from .env.example if you haven't already."

# ─── Local Dev ────────────────────────────────────────────────────────────────
frontend:
	cd frontend && npm run dev

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

# ─── Database ────────────────────────────────────────────────────────────────
migrate:
	cd backend && alembic upgrade head

makemigration:
	cd backend && alembic revision --autogenerate -m "$(msg)"

# ─── Utilities ───────────────────────────────────────────────────────────────
clean:
	@echo "Cleaning up cache and temp files..."
	@powershell -Command "Get-ChildItem -Path . -Filter '__pycache__' -Recurse | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue"
	@powershell -Command "Get-ChildItem -Path . -Filter '*.pyc' -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue"
	@echo "Cleanup complete."

check:
	@echo "=== CyberInspect AI Services ==="
	@echo "Frontend: http://localhost:3000"
	@echo "API:      http://localhost:8000"
	@echo "Docs:     http://localhost:8000/docs"
	@echo "Health:   http://localhost:8000/health"

