try:
    import cv2
except ImportError as e:
    cv2 = None
    import warnings
    warnings.warn("OpenCV not available; camera service disabled.")
import threading
import time

class CameraService:
    def __init__(self):
        self.cap = None
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.current_count = 0
        self.is_running = False
        self.lock = threading.Lock()
        self.frame_bytes = None

    def start(self):
        if not self.is_running:
            if cv2 is None:
            # No OpenCV support; skip webcam initialization
            self.is_running = False
            import warnings
            warnings.warn("Camera service disabled due to missing OpenCV.")
            return
        self.cap = cv2.VideoCapture(0)
            self.is_running = True
            threading.Thread(target=self._update_loop, daemon=True).start()

    def _update_loop(self):
        while self.is_running:
            if self.cap is None:
                break
                
            ret, frame = self.cap.read()
            if not ret:
                time.sleep(0.1)
                continue
            
            # Convert to grayscale for detection
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            # detectMultiScale parameters: image, scaleFactor, minNeighbors
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
            
            with self.lock:
                self.current_count = len(faces)
            
            # Draw bounding boxes (neon/cyberpunk style matching UI)
            for (x, y, w, h) in faces:
                # Yellow bounding box with neon feel
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 255), 2)
                
                # Corner brackets
                length = min(20, int(w/4))
                cv2.line(frame, (x, y), (x + length, y), (0, 255, 255), 3)
                cv2.line(frame, (x, y), (x, y + length), (0, 255, 255), 3)
                
                cv2.putText(frame, 'ANOMALY_DET: PERSON', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)

            # Add global overlay
            cv2.putText(frame, f"TRACKED TARGETS: {self.current_count}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                with self.lock:
                    self.frame_bytes = buffer.tobytes()
            
            time.sleep(0.03) # ~30fps

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
