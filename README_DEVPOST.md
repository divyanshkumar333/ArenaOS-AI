# ArenaOS AI – Intelligent Digital Twin for Smart Stadium Operations

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![GPT-5.6](https://img.shields.io/badge/GPT--5.6-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Codex](https://img.shields.io/badge/Codex-209633?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

ArenaOS AI is an enterprise-grade, multi-agent digital twin and real-time command center engineered for smart stadium operations. Designed to optimize high-density facility management, safety orchestration, and resource allocation, the platform unites high-fidelity 3D spatial simulations, real-time telemetry pipelines, and collaborative AI agents into a single glass-pane cockpit. By syncing web and edge systems, ArenaOS AI enables operators to visualize stadium dynamics, run crowd safety simulations, trace virtual CCTV coverage, and autonomously coordinate emergency response protocols (including medical, security, and drone dispatches) with sub-second latency.

---

## 🔗 Live Demo

Experience the live command center here: **[ArenaOS AI Command Center](https://arena-os-ai-five.vercel.app/)**

---

## ⚠️ The Problem

Managing modern high-capacity venues like sports stadiums involves navigating complex physical and digital landscapes, which often suffer from several critical operational friction points:

*   **Fragmented Monitoring:** Stadium operators must juggle separate systems for building management (HVAC/BMS), ticketing gate telemetry, security camera networks, and field staff dispatch, leading to cognitive overload during high-stress incidents.
*   **Reactive Crowd Management:** Traditional crowd monitoring is lagging. Bottlenecks at turnstiles, concessions, or stadium gates are typically identified only after safety hazard levels are reached, making prevention impossible.
*   **Delayed Incident Response:** Reporting incidents relies on voice calls or static ticketing systems. Dispatching security and medical units lacks dynamic visual coordination, introducing critical delays when every second counts.
*   **Lack of Predictive Intelligence:** Existing setups lack real-time simulation, meaning operators cannot stress-test response routes or anticipate crowd flow patterns based on live telemetry changes.
*   **Disconnected Operational Silos:** Automated drone swarms, static security personnel, medical staff, and controllers do not share a common operational state, creating gaps in overall situational awareness.

---

## 💡 The Solution

ArenaOS AI solves these problems by collapsing physical hardware feeds, predictive analysis, and multi-agent reasoning into a **unified 3D Command Center**:

*   **Interactive 3D Digital Twin:** Renders a high-fidelity WebGL representation of the entire stadium, displaying active zones, seating clusters, incident markers, and real-time positions of active ground assets and drones.
*   **Collaborative AI Copilot:** Translates complex telemetry and command inputs into standard English, enabling operators to query stadium state, ask for risk analyses, or dispatch resources using natural language.
*   **Dynamic Crowd Intelligence:** Simulates individual seating zones in real-time, mapping localized crowd density and predicting bottleneck flow rates through advanced shader heatmaps.
*   **Virtual CCTV Cones:** Projects 3D camera cones in the spatial model to identify camera coverages, blind spots, and simulated feeds for prompt hazard verification.
*   **Predictive Incident Detection:** Continuously processes sensor telemetry for heat anomalies, structural stress, or high crowd density spikes, flagging hazards before they escalate into emergencies.
*   **Autonomous Drone & Unit Dispatch:** Integrates pathfinding engines to route security and medical personnel, while triggering a drone swarm to autonomously fly to incident coordinates and stream telemetry.
*   **Multi-Agent Workflow Engine:** Dispatches specialized backend AI agents (e.g., Security Lead, Medical Lead, Drone Dispatcher) to coordinate, debate, and verify the optimal response strategy for complex multi-hazard events.

---

## ✨ Key Features

| Feature | Description | Technical Implementation |
| :--- | :--- | :--- |
| **Interactive 3D Digital Twin** | High-performance, interactive spatial visualization of the stadium structure, structural elements, and fields. Supports orbital controls, autofocusing, and zone-based isolation. | Built on **React Three Fiber (R3F)** and Three.js. Employs optimized custom meshes, responsive orbital controls, and CSS-based overlays. |
| **AI Copilot** | Natural language commander and chat-driven operational hub. Allows operators to ask questions ("Where is the nearest security unit?") or execute actions ("Send drone to Gate 3"). | Integrated with a custom FastAPI endpoint backed by **OpenAI API (GPT-5.6 / Codex)** for intent parsing and execution. |
| **CCTV Intelligence** | Interactive 3D visual cones representing security camera coverages, showing active angles and simulating live feeds on selected viewports. | Math-driven frustum calculations rendered as transparent geometries in Three.js, tied to state-selected viewports. |
| **Crowd Analytics** | Real-time population tracking across thousands of seats, rendering crowd density gradients and gate inflow charts. | Dynamic vertex mapping with single-draw-call **InstancedMesh** buffers, fed by simulation telemetry via WebSockets. |
| **Predictive Incident Detection** | Heuristic and AI-driven monitoring that flags temperature spikes, structural vibrations, and crowd density bottlenecks. | Real-time telemetry monitoring combined with predictive forecasting models displayed on Recharts-based dashboards. |
| **Drone Operations** | Autonomous drone swarm visualization featuring real-time flight vectors, telemetry reports, and waypoint tracking. | Vector math path interpolation in React Three Fiber, synchronized with mock drone state streams. |
| **Mission Timeline** | A time-scrubbing audit logs manager that allows operators to pause, rewind, and replay security events and telemetry history. | State-backed history scrubbers inside a unified React Context/Zustand slice, recording all WebSocket state steps. |
| **Executive Dashboard** | Comprehensive operational cockpit displaying energy grid distribution, HVAC status, BMS metrics, and team performance. | High-frequency telemetry dashboard built using responsive CSS grids, CSS glassmorphism, and Recharts. |
| **Multi-Agent Workflow** | Backstage team of AI specialists (Security Chief, Medical Lead, UAV Lead) collaborating on incident resolution tickets. | Python multi-agent system orchestrating agent states, debating response procedures, and issuing final instructions. |

---

## 🏗️ System Architecture

The following diagram illustrates the data flow, network synchronization, and reasoning pipelines inside ArenaOS AI:

```mermaid
graph TD
    User[Stadium Operations Team] -->|1. Natural Language Cmds & UI Actions| Frontend[Next.js Frontend]
    
    subgraph Next.js App (Client Layer)
        Frontend -->|Renders 3D View| R3F[React Three Fiber & Three.js]
        Frontend -->|Reads Real-Time State| Zustand[Zustand State Store]
    end
    
    Frontend <-->|2. WebSocket Connection (Telemetry & Events)| Backend[FastAPI Backend]
    
    subgraph FastAPI Service (Server Layer)
        Backend -->|Pipes Live Data| SimEngine[Stadium Telemetry Simulator]
        Backend -->|Orchestrates| AgentController[Multi-Agent Agent Coordinator]
    end
    
    AgentController <-->|3. Structured Tool Calling & Reasoning| OpenAI[OpenAI GPT-5.6 / Codex API]
    
    subgraph Collaborative AI Agent Swarm (Reasoning Layer)
        OpenAI -->|Triage & Strategy| ChiefAgent[Command Agent]
        OpenAI -->|Drone Flight Pathing| DroneAgent[Drone Swarm Agent]
        OpenAI -->|Ground Support| GroundAgent[Logistics Agent]
    end
    
    Backend -->|4. Synced Coordinates & Telemetry| DigitalTwin[3D Digital Twin Renders Ground Units]
    Backend -->|5. Metrics & Stream Aggregation| Analytics[Crowd & Incident Analytics Engine]
    Backend -->|6. Aggregated KPIs| Dashboard[Executive Dashboard UI]

    style User fill:#2a7ae2,stroke:#fff,stroke-width:2px,color:#fff
    style Frontend fill:#111,stroke:#0070f3,stroke-width:2px,color:#fff
    style Backend fill:#1e1e1e,stroke:#009688,stroke-width:2px,color:#fff
    style OpenAI fill:#412991,stroke:#fff,stroke-width:2px,color:#fff
    style R3F fill:#000,stroke:#fff,stroke-width:1px,color:#fff
    style Zustand fill:#222,stroke:#e1b12c,stroke-width:1px,color:#fff
    style AgentController fill:#333,stroke:#ff5722,stroke-width:1px,color:#fff
```

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript | Server-side rendering (SSR), core routing, type-safe development workflow. |
| **Backend** | FastAPI (Python 3.10+), WebSockets | Asynchronous event processing, bidirectional state sync, mock telemetry streaming. |
| **AI & Agents** | OpenAI API (GPT-5.6 / Codex) | Language interpretation, agent debate simulation, and incident orchestration. |
| **3D Graphics** | Three.js, React Three Fiber (R3F), `@react-three/drei` | GPU-accelerated 3D environment rendering and orbital viewport management. |
| **State Management** | Zustand | Non-blocking, light state store managing high-frequency spatial and sensor feeds. |
| **UI & Styling** | TailwindCSS, CSS Variables, Lucide Icons | Clean typography, dark-mode styling, glassmorphism UI, and custom flex dashboards. |
| **Deployment** | Vercel (Frontend), Python WSGI/ASGI Host (Backend) | Globally distributed frontend CDN deployment and websocket-enabled backend runtime. |

---

## ⚙️ Installation & Setup

Ensure you have **Node.js (v18+)** and **Python (v3.10+)** installed before starting.

### 1. Clone the Repository
```bash
git clone https://github.com/divyanshkumar333/ArenaOS-AI.git
cd ArenaOS-AI
```

### 2. Frontend Configuration & Execution
```bash
cd frontend
npm install
npm run dev
```
*The frontend interface will boot up locally at `http://localhost:3000`.*

### 3. Backend Configuration & Execution
In a separate terminal tab or window:
```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows (Command Prompt / PowerShell):
venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install Dependencies & Launch Server:
pip install -r requirements.txt
uvicorn main:app --reload
```
*The FastAPI WebSocket server will start listening on `ws://localhost:8000/ws`.*

---

## 📂 Project Structure

```
ArenaOS AI/
├── backend/
│   ├── main.py              # FastAPI application & WebSocket server
│   ├── ai_agent.py          # Multi-agent coordinator & OpenAI function mappings
│   ├── camera_service.py    # Virtual CCTV coverage calculations
│   ├── simulation.py        # BMS and crowd telemetry generator
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router structure
│   │   ├── components/      # UI components & 3D visualizations
│   │   │   ├── StadiumCanvas.tsx      # R3F canvas initialization
│   │   │   ├── CrowdSystem.tsx        # High-performance seat instancing
│   │   │   ├── AICopilot.tsx          # Real-time chat & agent workflow console
│   │   │   ├── CctvPanel.tsx          # Interactive CCTV views & camera configurations
│   │   │   ├── DroneEntity.tsx        # Drone coordinates rendering
│   │   │   ├── MedicalUnit.tsx        # Ground medical units coordinates
│   │   │   ├── SecurityUnit.tsx       # Ground security units coordinates
│   │   │   └── workspaces/            # Dashboard layout configurations
│   │   ├── store/           # Zustand state slices (e.g., useZoneStore.ts)
│   │   ├── hooks/           # Utility hooks (e.g., useMediaQuery.ts)
│   │   └── types/           # Core TypeScript type schemas
│   └── package.json         # Node.js dependencies
└── README_DEVPOST.md        # Submission README (This file)
```

---

## 🤖 GPT-5.6 & Codex Usage

During the design and construction of ArenaOS AI, **GPT-5.6** and **Codex** models were heavily utilized as development acceleration tools. All engineering choices, math operations, and final system integration were developer-guided.

### Areas of AI Assistance:
*   **React Component Scaffolding:** GPT-5.6 was used to accelerate frontend prototyping, generating complex layouts like the `MobileDashboard` and configuring basic styling wrappers for elements in `ExecutiveSummary`.
*   **TypeScript Declarations:** Codex assisted in writing type models for state stores and WebSocket payloads, ensuring type-safety and preventing mismatch errors.
*   **FastAPI Routing & Schema Structure:** Assisted in laying out the skeleton routers for WebSocket subscriptions, translating request bodies into structured python dictionaries inside `main.py`.
*   **Optimization Recommendations:** Prompted for suggestions on reducing rendering workloads, leading to the selection of `InstancedMesh` configurations.
*   **Debugging Support:** Assisted in identifying logic errors in state updates and diagnosing CORS configuration issues during local WebSocket development.

*Note: Engineering direction, state sync logic, coordinate offsets, multi-agent status flow, and product design remained entirely developer-driven.*

---

## ⚡ Technical Challenges & Solutions

### 1. Rendering 5,000+ Individual 3D Meshes (60 FPS Limit)
*   **Challenge:** Rendering each seat in the stadium as an individual R3F Mesh degraded performance, pushing frame rates below 10 FPS due to excessive WebGL draw calls.
*   **Solution:** Implemented Three.js `InstancedMesh` in `CrowdSystem.tsx`. By combining seat positions into a single instanced array with shared geometry and materials, the entire stadium's seating matrix is now drawn in a single draw call, maintaining a solid 60 FPS even with real-time color changes.

### 2. WebSocket Telemetry Synchronization
*   **Challenge:** Bidirectional high-frequency state updates (crowd movements, drone positions, incident updates) would cause react-render thrashing if mapped directly to normal state hooks.
*   **Solution:** Configured **Zustand** as a lightweight, external state store. WebSocket events write updates directly to the store bypass-rendering, and components subscribe only to sub-properties (e.g. `drones` coordinates) to minimize React updates.

### 3. Multi-Agent Race Conditions
*   **Challenge:** Having multiple AI agent workers updating incident ticket states simultaneously created race conditions and state mismatches.
*   **Solution:** Built a lock-based incident state machine in FastAPI (`ai_agent.py`), forcing sequential agent outputs and updating components in atomic state transactions.

---

## 🗺️ Future Roadmap

*   **🌐 IoT Device Integration:** Bind real-world RFID turnstiles, fire detectors, and ambient room sensors to update the digital twin zones automatically.
*   **📹 Live RTSP CCTV Analysis:** Integrate computer vision pipelines (such as YOLOv8) to process live CCTV feeds, triggering automated safety alerts.
*   **🛸 Physical Drone Flight Controller Integration:** Bridge simulated drone coordination triggers to physical UAV systems using Mavlink/PX4 APIs.
*   **🚨 Predictive Evacuation Routing:** Calculate and project dynamic evacuation paths onto the stadium floor in 3D during active anomalies.
*   **🧠 Edge AI Model Hosting:** Deploy local LLM runtimes to run AI agents on edge computers, eliminating cloud latency during disasters.
*   **🏙️ Smart City Expansion:** Scale the system architecture to support airport terminals, universities, and commercial districts.

---

## 📸 Screenshots

<details>
<summary>💻 Command Center Dashboard</summary>

*Real-time spatial digital twin viewport alongside interactive system telemetry columns.*
```
[Placeholder: Dashboard Screenshot]
```
</details>

<details>
<summary>🏟️ 3D Digital Twin View</summary>

*Detailed 3D rendering of stadium sections, highlighting active cameras and zone alert levels.*
```
[Placeholder: 3D Twin Screenshot]
```
</details>

<details>
<summary>💬 AI Copilot Interface</summary>

*Chat console showcasing natural language query processing and manual drone dispatch logs.*
```
[Placeholder: AI Copilot Screenshot]
```
</details>

<details>
<summary>👥 Crowd Intelligence Heatmap</summary>

*Visual representation of seating blocks mapping out localized crowd bottlenecks.*
```
[Placeholder: Crowd Heatmap Screenshot]
```
</details>

<details>
<summary>📊 Executive KPI Panels</summary>

*High-level summary displaying overall safety scores, energy grid statuses, and active team counts.*
```
[Placeholder: KPI Panel Screenshot]
```
</details>

<details>
<summary>⏱️ Mission Telemetry Timeline</summary>

*Audit log playback control that scrolls through incident timelines for operational analysis.*
```
[Placeholder: Timeline Screenshot]
```
</details>

---

## 🚀 Deployment

### Frontend (Vercel)
The client application is deployed on Vercel, optimized for edge caching and global content delivery.
*   Environment Variable `NEXT_PUBLIC_WS_URL` is set to the live FastAPI WebSocket URL.
*   Deployed with custom build variables.

### Backend
The python server runs on a WebSocket-supporting cloud container instance.
*   Configured with CORS origins matching the Vercel production domains.
*   Utilizes a production-grade ASGI web server runner.

---

## 👨‍💻 Developer

**Divyansh Kumar**
*   **GitHub:** [github.com/divyanshkumar333](https://github.com/divyanshkumar333)
*   **LinkedIn:** [linkedin.com/in/divyanshkumar](https://linkedin.com/in/divyanshkumar)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
