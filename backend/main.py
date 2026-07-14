import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

from simulation import SimulationEngine
from ai_agent import analyze_incident
from camera_service import camera_service

app = FastAPI(title="ArenaOS AI Backend")

# Response Compression
app.add_middleware(GZipMiddleware, minimum_size=500)

# Secure CORS: limit allowed origins in production
load_dotenv()
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Standardized Error Handler to prevent leakage of server details
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal operational error occurred. The incident response team has been alerted."}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid parameters submitted to the ArenaOS Command Center."}
    )

engine = SimulationEngine()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        try:
            # Send initial state immediately upon connection
            await websocket.send_json(engine.get_state())
        except Exception:
            self.disconnect(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, message: dict):
        # Prevent runtime modification errors by copying active connection list
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    camera_service.start()
    asyncio.create_task(telemetry_loop())

async def telemetry_loop():
    """Background task to broadcast telemetry every 3 seconds."""
    while True:
        await asyncio.sleep(3)
        if not engine.is_paused:
            engine.tick()
        
        # Inject live webcam tracking data into Gate 3 (zone_1)
        # Multiply by 15 so that 1-2 people cause a noticeable change in the heatmap
        live_count = camera_service.get_count()
        if not engine.is_paused:
            for zone in engine.zones:
                if zone["id"] == "zone_1":
                    zone["occupancy"] = min(100, live_count * 15)
                    break
        
        # Always broadcast state so UI stays in sync
        await manager.broadcast_json(engine.get_state())

class TriggerRequest(BaseModel):
    incident_type: str

@app.post("/api/demo/trigger")
async def trigger_incident(req: TriggerRequest):
    zone = engine.trigger_incident(req.incident_type)
    if not zone:
        return {"error": "Invalid incident type"}
    
    # Broadcast the immediate telemetry change (e.g. occupancy spike)
    await manager.broadcast_json(engine.get_state())

    # Call AI Agent (this has a 3.5s timeout built-in)
    ai_response = await analyze_incident(zone, req.incident_type)
    
    # Construct the incident payload
    incident_payload = {
        "type": "incident",
        "incident_type": req.incident_type,
        "zone_id": zone["id"],
        "zone_name": zone["name"],
        "severity": ai_response["severity"],
        "explanation": ai_response["explanation"],
        "recommended_action": ai_response["recommended_action"],
        "confidence": ai_response["confidence"]
    }
    
    # Broadcast the incident message over the same WebSocket
    await manager.broadcast_json(incident_payload)
    return {"status": "triggered"}

@app.post("/api/demo/resolve")
async def resolve_incident():
    engine.resolve_incident()
    await manager.broadcast_json(engine.get_state())
    return {"status": "resolved"}

@app.post("/api/demo/reset")
async def reset_simulation():
    engine.reset()
    await manager.broadcast_json(engine.get_state())
    return {"status": "reset"}

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from client, but we need to keep connection open
            await websocket.receive_text()
    except (WebSocketDisconnect, Exception):
        manager.disconnect(websocket)

def generate_frames():
    while True:
        frame = camera_service.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        else:
            # Fallback blank frame or wait if no frame is ready yet
            import time
            time.sleep(0.1)

@app.get("/api/video_feed")
async def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
