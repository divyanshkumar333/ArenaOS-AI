import threading
import time
import logging
import random
import math
import numpy as np

logger = logging.getLogger(__name__)


class CameraService:
    def __init__(self):
        self.cap = None
        self.face_cascade = None
        self.current_count = 0
        self.is_running = False
        self.enabled = False          # flipped to True only if init succeeds
        self.lock = threading.Lock()
        self.frame_bytes = None
        self.simulation_mode = False
        self.engine = None

    def start(self):
        if self.is_running:
            return

        # Attempt to load OpenCV and the Haar cascade lazily
        try:
            import cv2
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            self._cv2 = cv2
        except Exception as exc:
            logger.warning("OpenCV unavailable — camera service disabled. (%s)", exc)
            return

        # Attempt to open the webcam
        try:
            self.cap = self._cv2.VideoCapture(0)
            if not self.cap.isOpened():
                raise RuntimeError("No webcam found")
            self.simulation_mode = False
            logger.info("Webcam found, starting live camera service.")
        except Exception as exc:
            logger.warning("Webcam unavailable — falling back to high-tech AI computer vision simulation. (%s)", exc)
            self.cap = None
            self.simulation_mode = True

        self.is_running = True
        self.enabled = True
        threading.Thread(target=self._update_loop, daemon=True).start()
        logger.info("Camera service started.")

    def _update_loop(self):
        cv2 = self._cv2
        mock_targets = []
        last_incident_state = None

        while self.is_running:
            if not self.simulation_mode:
                if self.cap is None:
                    break

                ret, frame = self.cap.read()
                if not ret:
                    time.sleep(0.1)
                    continue

                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

                with self.lock:
                    self.current_count = len(faces)

                for (x, y, w, h) in faces:
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 255), 2)
                    length = min(20, int(w / 4))
                    cv2.line(frame, (x, y), (x + length, y), (0, 255, 255), 3)
                    cv2.line(frame, (x, y), (x, y + length), (0, 255, 255), 3)
                    cv2.putText(frame, 'ANOMALY_DET: PERSON', (x, y - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)

                cv2.putText(frame, f"TRACKED TARGETS: {self.current_count}", (10, 30),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    with self.lock:
                        self.frame_bytes = buffer.tobytes()

                time.sleep(0.03)  # ~30 fps
            else:
                # Simulation Mode
                # 1. Determine active incident state from engine
                is_incident = False
                if self.engine is not None:
                    is_incident = (self.engine.active_incident == "Gate 3 Overcrowding")

                # 2. Adjust target count based on incident
                target_num = random.randint(12, 18) if is_incident else random.randint(3, 6)

                # 3. Synchronize mock targets list size
                if last_incident_state != is_incident or len(mock_targets) != target_num:
                    last_incident_state = is_incident
                    # Re-generate targets to match the count
                    mock_targets = []
                    for _ in range(target_num):
                        mock_targets.append({
                            "x": random.randint(80, 500),
                            "y": random.randint(100, 340),
                            "vx": random.uniform(-1.5, 1.5),
                            "vy": random.uniform(-1.5, 1.5),
                            "w": random.randint(35, 55),
                            "h": random.randint(70, 110),
                            "label": random.choice(["HUMAN", "HUMAN", "HUMAN", "OBJECT"]),
                            "conf": random.uniform(85, 99)
                        })

                # 4. Create base frame (640x480)
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                # Dark tactical BGR background
                frame[:] = (12, 10, 8)

                # 5. Draw tactical grid lines
                grid_color = (25, 22, 18)
                for x in range(0, 640, 40):
                    cv2.line(frame, (x, 0), (x, 480), grid_color, 1)
                for y in range(0, 480, 40):
                    cv2.line(frame, (0, y), (640, y), grid_color, 1)

                # 6. Draw perspective structure (Gate 3 arches / turnstiles / walls)
                structure_color = (50, 40, 30) if not is_incident else (30, 30, 80)
                # Left wall perspective lines
                cv2.line(frame, (0, 0), (120, 100), structure_color, 1)
                cv2.line(frame, (0, 480), (120, 380), structure_color, 1)
                cv2.line(frame, (120, 100), (120, 380), structure_color, 1)
                # Right wall perspective lines
                cv2.line(frame, (640, 0), (520, 100), structure_color, 1)
                cv2.line(frame, (640, 480), (520, 380), structure_color, 1)
                cv2.line(frame, (520, 100), (520, 380), structure_color, 1)
                # Turnstile gates
                cv2.rectangle(frame, (180, 260), (240, 380), structure_color, 1)
                cv2.rectangle(frame, (280, 260), (360, 380), structure_color, 1)
                cv2.rectangle(frame, (400, 260), (460, 380), structure_color, 1)

                # Color definitions (BGR)
                color_green = (88, 209, 48)  # BGR green
                color_red = (68, 68, 239)    # BGR red
                active_color = color_red if is_incident else color_green

                # 7. Update and draw bounding boxes
                for t in mock_targets:
                    t["x"] += t["vx"]
                    t["y"] += t["vy"]

                    # Bounce boundaries
                    if t["x"] < 30 or t["x"] > 610 - t["w"]:
                        t["vx"] *= -1
                    if t["y"] < 80 or t["y"] > 430 - t["h"]:
                        t["vy"] *= -1

                    x, y, w, h = int(t["x"]), int(t["y"]), int(t["w"]), int(t["h"])

                    # Draw corners
                    l_val = 8
                    thick = 1
                    # TL
                    cv2.line(frame, (x, y), (x + l_val, y), active_color, thick)
                    cv2.line(frame, (x, y), (x, y + l_val), active_color, thick)
                    # TR
                    cv2.line(frame, (x + w, y), (x + w - l_val, y), active_color, thick)
                    cv2.line(frame, (x + w, y), (x + w, y + l_val), active_color, thick)
                    # BL
                    cv2.line(frame, (x, y + h), (x + l_val, y + h), active_color, thick)
                    cv2.line(frame, (x, y + h), (x, y + h - l_val), active_color, thick)
                    # BR
                    cv2.line(frame, (x + w, y + h), (x + w - l_val, y + h), active_color, thick)
                    cv2.line(frame, (x + w, y + h), (x + w, y + h - l_val), active_color, thick)

                    # Bounding Box label
                    cv2.putText(frame, f"{t['label']} [{t['conf']:.1f}%]", (x + 2, y - 4),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.3, active_color, 1, cv2.LINE_AA)

                # Set current face/person count
                with self.lock:
                    self.current_count = len(mock_targets)

                # 8. Incident alert pulsing text overlay
                if is_incident:
                    pulse = math.sin(time.time() * 8) * 0.5 + 0.5
                    alert_color = (0, 0, int(150 + pulse * 105)) # pulsing red BGR
                    
                    # Centered overlay box
                    cv2.rectangle(frame, (160, 180), (480, 300), (0, 0, 40), -1)
                    cv2.rectangle(frame, (160, 180), (480, 300), alert_color, 2)
                    
                    text1 = "CV_ALERT: OVERCROWDING"
                    text2 = "SEVERITY: WARNING"
                    (w1, h1), _ = cv2.getTextSize(text1, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
                    (w2, h2), _ = cv2.getTextSize(text2, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                    cv2.putText(frame, text1, (320 - w1 // 2, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.7, alert_color, 2, cv2.LINE_AA)
                    cv2.putText(frame, text2, (320 - w2 // 2, 270), cv2.FONT_HERSHEY_SIMPLEX, 0.6, alert_color, 2, cv2.LINE_AA)

                # 9. Scan line effect
                scan_y = int((time.time() * 120) % 480)
                scan_color = (80, 180, 80) if not is_incident else (80, 80, 180)
                cv2.line(frame, (0, scan_y), (640, scan_y), scan_color, 1)
                for i in range(1, 4):
                    cv2.line(frame, (0, max(0, scan_y - i)), (640, max(0, scan_y - i)), (scan_color[0] // (i+1), scan_color[1] // (i+1), scan_color[2] // (i+1)), 1)

                # 10. HUD Overlays
                # Blink REC light
                rec_color = (0, 0, 255) if int(time.time() * 2) % 2 == 0 else (60, 60, 60)
                cv2.circle(frame, (35, 35), 6, rec_color, -1)
                cv2.putText(frame, "REC", (50, 39), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (200, 200, 200), 1, cv2.LINE_AA)

                # Title
                cv2.putText(frame, "CAM-01 / GATE 3 INGRESS FLOW", (35, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

                # Timestamp
                timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                ms_val = int((time.time() % 1) * 1000)
                cv2.putText(frame, f"{timestamp_str}.{ms_val:03d} UTC", (420, 39), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (200, 200, 200), 1, cv2.LINE_AA)

                # Bottom telemetry text
                telemetry_color = (150, 150, 150)
                cv2.putText(frame, "FPS: 30.00", (35, 455), cv2.FONT_HERSHEY_SIMPLEX, 0.35, telemetry_color, 1, cv2.LINE_AA)
                cv2.putText(frame, "PTZ TRK: P: +14.4* T: -12.1* Z: 2.4x", (135, 455), cv2.FONT_HERSHEY_SIMPLEX, 0.35, telemetry_color, 1, cv2.LINE_AA)
                cv2.putText(frame, "ENC: H.265 / WIDE", (470, 455), cv2.FONT_HERSHEY_SIMPLEX, 0.35, telemetry_color, 1, cv2.LINE_AA)

                # 11. Encode to JPEG
                ret, buffer = cv2.imencode('.jpg', frame)
                if ret:
                    with self.lock:
                        self.frame_bytes = buffer.tobytes()

                time.sleep(0.033)  # ~30 FPS

    def get_count(self):
        with self.lock:
            return self.current_count

    def get_frame(self):
        with self.lock:
            return self.frame_bytes

    def stop(self):
        self.is_running = False
        if self.cap:
            self.cap.release()
            self.cap = None


camera_service = CameraService()

