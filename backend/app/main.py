"""
CyberInspect AI — FastAPI Backend Entry Point
Local development: runs on http://localhost:8000
Frontend (Next.js) runs on http://localhost:3000 and proxies /api/* here.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import create_tables
from app.api.v1 import router as api_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 CyberInspect AI backend starting on http://localhost:8000")
    logger.info("📖 API docs available at http://localhost:8000/docs")
    await create_tables()
    logger.info("✅ Database tables ready")
    yield
    logger.info("CyberInspect AI backend shutting down...")


app = FastAPI(
    title="CyberInspect AI API",
    description="AI-powered web application vulnerability scanner — Local Dev",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────
# Allow the frontend (localhost:3000) to call the backend (localhost:8000)
# Also allow 127.0.0.1 variants — same thing, different name
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",     # Next.js frontend (npm run dev)
        "http://127.0.0.1:3000",     # Same, different address
        "http://localhost:3001",     # In case 3000 is taken
        settings.FRONTEND_URL,       # From .env (also localhost:3000)
    ],
    allow_credentials=True,          # Allow cookies + Authorization header
    allow_methods=["*"],             # GET, POST, PUT, DELETE, PATCH, OPTIONS
    allow_headers=["*"],             # Content-Type, Authorization, etc.
)

# ── All API routes ─────────────────────────────────────────────────────────
app.include_router(api_router)


# ── Health check ──────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health_check():
    """
    Quick connectivity test.
    Frontend calls this to verify the backend is reachable.
    curl http://localhost:8000/health
    """
    return {
        "status": "ok",
        "service": "cyberinspect-ai-backend",
        "version": "1.0.0",
        "docs": "http://localhost:8000/docs",
    }


# ── WebSocket manager ─────────────────────────────────────────────────────
class WSManager:
    """Manages real-time WebSocket connections per scan_id."""

    def __init__(self):
        self._active: dict[str, list[WebSocket]] = {}

    async def connect(self, scan_id: str, ws: WebSocket):
        await ws.accept()
        self._active.setdefault(scan_id, []).append(ws)
        logger.info(f"WS connected  | scan={scan_id} | total={len(self._active[scan_id])}")

    def disconnect(self, scan_id: str, ws: WebSocket):
        if scan_id in self._active:
            try:
                self._active[scan_id].remove(ws)
            except ValueError:
                pass

    async def send(self, scan_id: str, payload: dict):
        """Broadcast a message to all clients watching this scan."""
        dead = []
        for ws in self._active.get(scan_id, []):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(scan_id, ws)


ws_manager = WSManager()


@app.websocket("/ws/scan/{scan_id}")
async def websocket_scan(websocket: WebSocket, scan_id: str):
    """
    Real-time scan log stream.

    Connect: ws://localhost:8000/ws/scan/{scan_id}
    Receives JSON: { "level": "info|warning|error|success", "message": "...", "progress": 0-100 }
    Send "ping" to keep the connection alive.
    """
    await ws_manager.connect(scan_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(scan_id, websocket)
        logger.info(f"WS disconnected | scan={scan_id}")
