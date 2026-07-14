import threading
import time
import logging

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
        except Exception as exc:
            logger.warning("Webcam unavailable — camera service disabled. (%s)", exc)
            self.cap = None
            self._cv2 = None
            return

        self.is_running = True
        self.enabled = True
        threading.Thread(target=self._update_loop, daemon=True).start()
        logger.info("Camera service started.")

    def _update_loop(self):
        cv2 = self._cv2
        while self.is_running:
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
