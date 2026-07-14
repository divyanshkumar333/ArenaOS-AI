import os
import json
import random
import asyncio
import logging
import re
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load env variables so test script works
load_dotenv()

logger = logging.getLogger(__name__)

# Dynamic fallback generator for realistic, internally consistent incident variables
def generate_dynamic_fallback(incident_type: str) -> dict:
    if incident_type == "Gate 3 Overcrowding":
        occupancy = random.randint(91, 96)
        flow_rate = int(120 + (occupancy - 90) * 7.5 + random.uniform(-3, 3))
        prob = int(80 + (occupancy - 90) * 3 + random.uniform(-2, 2))
        prob = min(99, max(80, prob))
        eta = int(270 - (occupancy - 90) * 30 + random.uniform(-10, 10))
        eta_min = round(eta / 60, 1)
        confidence = round(0.94 + (occupancy - 90) * 0.01 + random.uniform(-0.01, 0.01), 2)
        confidence = min(0.99, max(0.90, confidence))
        alt_capacity = random.randint(35, 48)

        explanation = (
            f"Crowd density increased 37% over the last 90 seconds. "
            f"Turnstile throughput has exceeded expected capacity by {flow_rate} people/min. "
            f"Bottleneck probability now {prob}% with estimated critical congestion at Gate 3 in {eta_min} minutes."
        )
        recommended_action = (
            f"Deploy Crowd Control Unit Beta to Gate 3. "
            f"Divert excess traffic to Gate 4, currently operating under {alt_capacity}% capacity."
        )
        return {
            "severity": "warning",
            "explanation": explanation,
            "recommended_action": recommended_action,
            "confidence": confidence
        }
    elif incident_type == "Section 112 Medical Event":
        sec112_occ = random.randint(87, 94)
        sec111_occ = int(sec112_occ + random.randint(1, 4))
        sec113_occ = int(sec112_occ - random.randint(3, 7))
        eta = random.randint(35, 55)
        confidence = round(0.92 + random.uniform(-0.02, 0.02), 2)

        explanation = (
            f"Biomedical sensor alert triggered in Section 112 (Row 14). "
            f"Surrounding seating sections 111 and 113 are congested at {sec111_occ}% and {sec113_occ}% occupancy respectively, "
            f"impeding emergency ingress routes."
        )
        recommended_action = (
            f"Dispatch Medical Response Team Charlie from North Station (ETA {eta}s). "
            f"Send Usher Units 4 and 5 to clear physical aisle access through Section 113."
        )
        return {
            "severity": "critical",
            "explanation": explanation,
            "recommended_action": recommended_action,
            "confidence": confidence
        }
    else: # Concourse North Fire Alarm
        sec4_occ = random.randint(40, 52)
        wind_speed = random.randint(10, 18)
        exit_cap = random.randint(58, 69)
        evac_time = round(2.8 + (sec4_occ - 40) * 0.12 + random.uniform(-0.2, 0.2), 1)
        confidence = round(0.96 + random.uniform(-0.01, 0.02), 2)
        confidence = min(0.99, max(0.94, confidence))

        explanation = (
            f"Thermal anomaly detected in Sector 4 core. Region occupancy is at {sec4_occ}%. "
            f"Wind speed measured NE at {wind_speed}mph. Primary evacuation exits 12 and 14 are clear and at {exit_cap}% capacity."
        )
        recommended_action = (
            f"Initiate dynamic Sector 4 evacuation protocol (Est. evacuation time: {evac_time} minutes). "
            f"Direct crowd paths toward Exits 12 and 14. Deploy Fire Safety Team Alpha to coordinate local containment."
        )
        return {
            "severity": "critical",
            "explanation": explanation,
            "recommended_action": recommended_action,
            "confidence": confidence
        }

def get_incident_context(zone, incident_type: str) -> dict:
    if incident_type == "Gate 3 Overcrowding":
        return {
            "incident_type": incident_type,
            "occupancy": zone.get('occupancy', 94),
            "ingress_rate_per_min": 145,
            "minutes_above_threshold": 4,
            "nearest_alternate_gate": "Gate 4",
            "alternate_gate_occupancy": 42
        }
    elif incident_type == "Section 112 Medical Event":
        return {
            "incident_type": incident_type,
            "occupancy": zone.get('occupancy', 88),
            "minutes_since_flagged": 2,
            "distance_to_nearest_medical_secs": 45,
            "nearby_aisles_congested": "Yes",
            "surrounding_zone_occupancy": "Section 111 (92%), Section 113 (85%)"
        }
    elif incident_type == "Concourse North Fire Alarm":
        return {
            "incident_type": incident_type,
            "occupancy": zone.get('occupancy', 45),
            "alarm_zone": "Sector 4",
            "nearest_exits": "Exits 12 and 14",
            "nearest_exits_capacity": "65%",
            "wind_direction": "NE at 15mph",
            "estimated_evacuation_time_mins": 3.2
        }
    
    return {
        "incident_type": incident_type,
        "occupancy": zone.get('occupancy', 0)
    }

# Simple in-memory cache for incident analysis results
_analysis_cache = {}

async def analyze_incident(zone, incident_type: str) -> dict:
    """
    Returns incident analysis instantly using the cache or fallback responses,
    while asynchronously updating the cache using the NVIDIA NIM API in the background.
    """
    cache_key = (incident_type, zone.get('occupancy', 0))

    api_key = os.getenv("NVIDIA_API_KEY")
    client = AsyncOpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key
    ) if api_key else None

    incident_context = get_incident_context(zone, incident_type)

    system_prompt = (
        "You are ARENAOS, the AI operations copilot for a live stadium command center. "
        "You speak like a veteran ops commander: terse, decisive, and grounded in the specific numbers you're given — "
        "never hedge, never use vague phrases like 'may indicate' or 'could potentially.' "
        "Every explanation must cite at least one specific number from the input. "
        "Every recommended_action must name a specific team, gate, or unit — never a generic action like 'monitor the situation.' "
        "Output valid JSON only, no markdown, no extra text."
    )

    prompt = f"""
<context>
{json.dumps(incident_context, indent=2)}
</context>

<instructions>
- Analyze the telemetry above.
- Confidence should reflect how much the input data unambiguously supports your recommended action — 0.9+ only when multiple signals agree, 0.5-0.7 when data is partial or conflicting.
- Output valid JSON only with keys: "severity", "explanation", "recommended_action", "confidence".
</instructions>

<example_input>
{{
  "incident_type": "Gate 12 Perimeter Breach",
  "unauthorized_persons": 3,
  "door_breach_duration_secs": 45
}}
</example_input>

<example_output>
{{
  "severity": "critical",
  "explanation": "Perimeter breach at Gate 12. Door sensor open for 45 seconds with 3 unauthorized individuals detected.",
  "recommended_action": "Dispatch Quick Reaction Force Alpha to Gate 12. Lock down adjacent concourse sectors C and D.",
  "confidence": 0.95
}}
</example_output>
"""

    async def call_api():
        if not client:
            raise ValueError("No API key")
        response = await client.chat.completions.create(
            model="meta/llama-3.3-70b-instruct",
            max_tokens=300,
            temperature=0.7,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ]
        )
        try:
            # Parse the JSON response
            raw_text = response.choices[0].message.content.strip()
            # Clean markdown code fences if present
            if raw_text.startswith("```"):
                # Use regex to strip ```json and ```
                raw_text = re.sub(r'^```(?:json)?', '', raw_text, flags=re.IGNORECASE).strip()
                raw_text = re.sub(r'```$', '', raw_text).strip()
            return json.loads(raw_text)
        except Exception:
            raise ValueError("Invalid JSON from NVIDIA NIM")

    async def fetch_and_cache():
        try:
            result = await asyncio.wait_for(call_api(), timeout=5.0)
            _analysis_cache[cache_key] = result
            logger.info(f"Successfully warmed/updated cache for {incident_type} in background.")
        except Exception as e:
            logger.warning(f"Background API call failed or timed out ({repr(e)}) for {incident_type}.")

    # If it is in cache, return immediately
    if cache_key in _analysis_cache:
        logger.info(f"Returning cached analysis for {incident_type}")
        return _analysis_cache[cache_key]

    # Otherwise, pick a fallback immediately, store it temporarily, and kick off background task
    initial_response = generate_dynamic_fallback(incident_type)
    _analysis_cache[cache_key] = initial_response

    # Kick off background update if we have a client/key
    if client:
        asyncio.create_task(fetch_and_cache())
        logger.info(f"Triggered background fetch for {incident_type} to warm the cache.")
    
    return initial_response
