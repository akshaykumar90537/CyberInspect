"""AI Assistant chat endpoint."""
from fastapi import APIRouter
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_response

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    response = await get_ai_response(messages, request.scan_id or "")
    return ChatResponse(message=response)
