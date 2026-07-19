# ArenaOS AI

ArenaOS is an AI-powered command center and 3D digital twin for modern smart stadiums. It provides real-time situational awareness, predictive analytics, and autonomous response coordination using a swarm of drones, security, and medical personnel.

## Challenge / Vertical
Built for **Smart Facility Management & Security**, ArenaOS tackles the complexity of managing massive crowds, physical infrastructure, and incident response in high-density environments like sports stadiums.

## Features
- **3D Digital Twin:** Real-time 3D visualization of the stadium using React Three Fiber.
- **AI Copilot & Swarm Intelligence:** Autonomous drone dispatch and ground unit coordination in response to anomalies.
- **Real-Time Telemetry:** Live dashboards tracking energy usage, crowd density, structural health, and anomaly detection.
- **Cinematic Director Mode:** Automated, cinematic camera choreography during incident response.
- **Predictive Heatmaps:** AI-driven forecasting of crowd bottlenecks and potential risks.
- **Incident History & Activity Logs:** Comprehensive audit trails of all system events and AI reasoning.

## Architecture
- **Frontend:** Next.js (React), TailwindCSS, Zustand for state management.
- **3D Rendering:** Three.js & React Three Fiber (R3F).
- **Backend/AI:** Python services (via WebSocket) simulating telemetry and orchestrating AI agents.
- **Communication:** Real-time bi-directional WebSockets for low-latency state synchronization.

## AI Technologies Used
- Multi-Agent Orchestration (Swarm Intelligence)
- Real-Time Predictive Modeling (Crowd & Risk forecasting)
- Spatial Pathfinding & Navigation

## Installation Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd arenaos
   ```

2. **Backend Setup:**
   Ensure you have Python 3.10+ installed.
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   Ensure you have Node.js 18+ installed.
   ```bash
   cd frontend
   npm install
   ```

## How to Run Locally

1. **Start the Python Backend:**
   ```bash
   cd backend
   python main.py
   ```
   *The WebSocket server will start on `ws://localhost:8000/ws`.*

2. **Start the Next.js Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   *The application will be available at `http://localhost:3000`.*

## Deployment Link
[Your Deployment Link Here]

## License
MIT License
