# ArenaOS AI

## Overview
**ArenaOS AI** is an **AI‑powered Digital Twin Command Center** that demonstrates how smart venues could be monitored, visualized, and operated using a unified 3‑D interface. The prototype showcases a complete end‑to‑end architecture built on a **production‑inspired stack**.

---

## Quick Feature List
- AI Copilot (scaffold – ready for LLM integration)
- Live Digital Twin
- Simulated Computer Vision pipeline (`camera_service.py`)
- Real‑time telemetry via WebSockets
- Multi‑Agent UI (dispatch UI in place, logic scaffolded)
- FastAPI backend
- React Three Fiber front‑end
- Incident simulation engine
- Extensible design for future AI/vision integration

---

## Why ArenaOS AI?
Venue operators today juggle dozens of disconnected dashboards. When an incident occurs, they lose precious seconds stitching together fragmented data. **ArenaOS AI** collapses that complexity into a single, interactive 3‑D twin that surfaces live telemetry, AI‑driven recommendations, and a unified incident response flow.

---

## Technical Stack
| Layer | Technologies |
|-------|--------------|
| Front‑end | Next.js (TypeScript), React Three Fiber, Three.js, Framer Motion, Zustand |
| Back‑end | Python, FastAPI, WebSockets |
| AI / ML | Stub for NVIDIA NIM / Llama 3.3 (future integration) |
| Computer Vision | Simulated pipeline (`camera_service.py`) – real OpenCV integration planned |
| State Management | Zustand (React) |

---

## Folder Structure
```
ArenaOS AI/
├─ backend/          # Python server, camera_service, ai_agent stub
│   ├─ main.py
│   ├─ camera_service.py
│   └─ ai_agent.py
├─ frontend/        # Next.js app
│   └─ src/
│       ├─ app/
│       ├─ components/
│       ├─ hooks/
│       ├─ store/
│       └─ types/
├─ stadium/          # 3D GLB assets, textures
├─ docs/             # Documentation, diagrams, assets
└─ README.md
```

---

## Roadmap
1. Wire up live LLM inference (replace `ai_agent.py` stub).
2. Integrate real OpenCV/RTSP camera feeds.
3. Polish UI and improve performance.
4. Add automated tests and CI pipeline.

---

## How to Run Locally
1. **Start services** – run the provided batch script:
   ```bash
   ./start-demo.bat
   ```
2. **Backend (manual)**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   python main.py
   ```
3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open http://localhost:3000 to explore the command center.

---

*ArenaOS AI is a hackathon‑level prototype that demonstrates a **production‑inspired architecture**. It is not a production‑ready deployment, but the codebase is structured for easy extension into a full‑scale system.*
