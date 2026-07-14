import random
import asyncio
from typing import List, Dict, Optional

ZONES_INIT = [
    {"id": "zone_1", "name": "Gate 3", "occupancy": 35, "status": "normal", "baseline": 35},
    {"id": "zone_2", "name": "Section 112", "occupancy": 60, "status": "normal", "baseline": 60},
    {"id": "zone_3", "name": "Concourse North", "occupancy": 40, "status": "normal", "baseline": 40},
    {"id": "zone_4", "name": "VIP Lounge", "occupancy": 20, "status": "normal", "baseline": 20},
    {"id": "zone_5", "name": "Gate 1", "occupancy": 30, "status": "normal", "baseline": 30},
    {"id": "zone_6", "name": "Section 115", "occupancy": 55, "status": "normal", "baseline": 55},
]

INCIDENT_MAPPING = {
    "Gate 3 Overcrowding": {"zone_id": "zone_1", "occupancy": 92, "status": "warning"},
    "Section 112 Medical Event": {"zone_id": "zone_2", "occupancy": 20, "status": "critical"},
    "Concourse North Fire Alarm": {"zone_id": "zone_3", "occupancy": 45, "status": "critical"},
}

class SimulationEngine:
    def __init__(self):
        self.zones = [dict(z) for z in ZONES_INIT]
        self.is_paused = False
        self.active_incident = None

    def get_state(self):
        return {
            "type": "telemetry",
            "zones": self.zones
        }

    def tick(self):
        """Randomly walk occupancy if not paused by an active incident."""
        if self.is_paused:
            return

        for zone in self.zones:
            # Random walk +/- 3% around baseline
            drift = random.randint(-3, 3)
            # Pull towards baseline slightly
            if zone["occupancy"] > zone["baseline"] + 10:
                drift -= 1
            elif zone["occupancy"] < zone["baseline"] - 10:
                drift += 1
            
            zone["occupancy"] = max(0, min(100, zone["occupancy"] + drift))
            zone["status"] = "normal"

    def trigger_incident(self, incident_type: str) -> Optional[Dict]:
        """Manually trigger a specific incident."""
        mapping = INCIDENT_MAPPING.get(incident_type)
        if not mapping:
            return None

        # Pause background simulation
        self.is_paused = True
        self.active_incident = incident_type

        # Update zone
        target_zone = None
        for zone in self.zones:
            if zone["id"] == mapping["zone_id"]:
                zone["occupancy"] = mapping["occupancy"]
                zone["status"] = mapping["status"]
                target_zone = zone
                break

        return target_zone

    def resolve_incident(self):
        """Resolves the current incident, unpauses simulation, returns zones to normal status."""
        self.is_paused = False
        self.active_incident = None
        for zone in self.zones:
            zone["status"] = "normal"
            # Occupancy will gradually drift back to baseline in tick() or we can snap it
            zone["occupancy"] = zone["baseline"]

    def reset(self):
        """Instantly resets to baseline."""
        self.is_paused = False
        self.active_incident = None
        self.zones = [dict(z) for z in ZONES_INIT]
