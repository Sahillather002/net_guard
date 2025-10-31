from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import uvicorn
import random
import os

app = FastAPI(title="NetGuard Threat Detector", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Threat(BaseModel):
    id: str
    name: str
    type: str
    severity: str
    status: str
    source: str
    target: str
    timestamp: str
    detections: int
    description: Optional[str] = None

class AttackFlowNode(BaseModel):
    id: str
    type: Optional[str] = "default"
    data: dict
    position: dict
    style: Optional[dict] = None

class AttackFlowEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: Optional[bool] = False
    label: Optional[str] = None
    style: Optional[dict] = None

class AttackFlow(BaseModel):
    nodes: List[AttackFlowNode]
    edges: List[AttackFlowEdge]

# Sample threat data
THREAT_TYPES = ["malware", "phishing", "ddos", "bruteforce", "sql_injection", "xss", "ransomware"]
SEVERITIES = ["critical", "high", "medium", "low"]
STATUSES = ["blocked", "monitoring", "quarantined"]
SOURCES = ["203.0.113.45", "198.51.100.23", "192.0.2.100", "203.0.113.89", "198.51.100.67"]
TARGETS = ["192.168.1.100", "192.168.1.50", "192.168.1.75", "10.0.0.50"]

def generate_threats(count=20):
    threats = []
    for i in range(count):
        threat_type = random.choice(THREAT_TYPES)
        threats.append({
            "id": f"THR-{str(i+1).zfill(3)}",
            "name": f"{threat_type.replace('_', ' ').title()} Attack",
            "type": threat_type,
            "severity": random.choice(SEVERITIES),
            "status": random.choice(STATUSES),
            "source": random.choice(SOURCES),
            "target": random.choice(TARGETS),
            "timestamp": (datetime.now() - timedelta(minutes=random.randint(1, 1440))).isoformat(),
            "detections": random.randint(1, 500),
            "description": f"Detected {threat_type} attack from {random.choice(SOURCES)}"
        })
    return threats

SAMPLE_THREATS = generate_threats()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "threat-detector",
        "version": "2.0.0",
        "threats_monitored": len(SAMPLE_THREATS)
    }

@app.get("/threats", response_model=List[Threat])
async def get_threats(
    type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get all threats with optional filters"""
    threats = SAMPLE_THREATS.copy()
    
    if type:
        threats = [t for t in threats if t["type"].lower() == type.lower()]
    if severity:
        threats = [t for t in threats if t["severity"].lower() == severity.lower()]
    if status:
        threats = [t for t in threats if t["status"].lower() == status.lower()]
    if search:
        threats = [t for t in threats if search.lower() in t["name"].lower() or search.lower() in t["source"].lower()]
    
    return threats

@app.get("/threats/{threat_id}")
async def get_threat(threat_id: str):
    """Get specific threat details"""
    threat = next((t for t in SAMPLE_THREATS if t["id"] == threat_id), None)
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    # Add additional details
    threat_details = threat.copy()
    threat_details["details"] = {
        "first_seen": (datetime.now() - timedelta(hours=random.randint(1, 48))).isoformat(),
        "last_seen": datetime.now().isoformat(),
        "attack_vector": random.choice(["Network", "Email", "Web", "Application"]),
        "affected_systems": random.randint(1, 10),
        "blocked_attempts": random.randint(10, 1000),
        "risk_score": random.randint(60, 100)
    }
    
    return threat_details

@app.post("/threats/{threat_id}/block")
async def block_threat(threat_id: str):
    """Block a specific threat"""
    threat = next((t for t in SAMPLE_THREATS if t["id"] == threat_id), None)
    if not threat:
        raise HTTPException(status_code=404, detail="Threat not found")
    
    # Update threat status
    threat["status"] = "blocked"
    
    return {
        "status": "blocked",
        "threat_id": threat_id,
        "message": f"Threat {threat_id} has been blocked successfully",
        "timestamp": datetime.now().isoformat(),
        "firewall_rules_updated": True,
        "blocked_ips": [threat["source"]]
    }

@app.get("/threats/attack-flow", response_model=AttackFlow)
async def get_attack_flow():
    """Get attack flow data for React Flow visualization"""
    
    # Generate dynamic attack flow based on recent threats
    recent_threats = sorted(SAMPLE_THREATS, key=lambda x: x["timestamp"], reverse=True)[:3]
    
    nodes = [
        {
            "id": "1",
            "type": "input",
            "data": {"label": "External Attacker"},
            "position": {"x": 250, "y": 0},
            "style": {"background": "#ef4444", "color": "white", "border": "2px solid #dc2626"}
        },
        {
            "id": "2",
            "data": {"label": f"{recent_threats[0]['type'].replace('_', ' ').title()}"},
            "position": {"x": 250, "y": 100},
            "style": {"background": "#f97316", "color": "white"}
        },
        {
            "id": "3",
            "data": {"label": "User Workstation"},
            "position": {"x": 100, "y": 200},
            "style": {"background": "#eab308", "color": "white"}
        },
        {
            "id": "4",
            "data": {"label": "Malware Execution"},
            "position": {"x": 400, "y": 200},
            "style": {"background": "#ef4444", "color": "white"}
        },
        {
            "id": "5",
            "data": {"label": "Lateral Movement"},
            "position": {"x": 250, "y": 300},
            "style": {"background": "#dc2626", "color": "white"}
        },
        {
            "id": "6",
            "data": {"label": "Database Server"},
            "position": {"x": 100, "y": 400},
            "style": {"background": "#7c3aed", "color": "white"}
        },
        {
            "id": "7",
            "data": {"label": "Data Exfiltration"},
            "position": {"x": 400, "y": 400},
            "style": {"background": "#dc2626", "color": "white"}
        },
        {
            "id": "8",
            "type": "output",
            "data": {"label": "Blocked by NetGuard"},
            "position": {"x": 250, "y": 500},
            "style": {"background": "#22c55e", "color": "white", "border": "2px solid #16a34a"}
        }
    ]
    
    edges = [
        {"id": "e1-2", "source": "1", "target": "2", "animated": True, "label": "Initiates"},
        {"id": "e2-3", "source": "2", "target": "3", "animated": True, "label": "Targets"},
        {"id": "e2-4", "source": "2", "target": "4", "animated": True, "label": "Downloads"},
        {"id": "e3-5", "source": "3", "target": "5", "animated": True, "label": "Compromised"},
        {"id": "e4-5", "source": "4", "target": "5", "animated": True, "label": "Spreads"},
        {"id": "e5-6", "source": "5", "target": "6", "animated": True, "label": "Accesses"},
        {"id": "e5-7", "source": "5", "target": "7", "animated": True, "label": "Attempts"},
        {"id": "e7-8", "source": "7", "target": "8", "animated": True, "label": "Detected & Blocked", "style": {"stroke": "#22c55e", "strokeWidth": 2}}
    ]
    
    return {"nodes": nodes, "edges": edges}

@app.get("/stats")
async def get_threat_stats():
    """Get threat statistics"""
    total_threats = len(SAMPLE_THREATS)
    blocked = len([t for t in SAMPLE_THREATS if t["status"] == "blocked"])
    monitoring = len([t for t in SAMPLE_THREATS if t["status"] == "monitoring"])
    critical = len([t for t in SAMPLE_THREATS if t["severity"] == "critical"])
    
    type_distribution = {}
    for threat_type in THREAT_TYPES:
        type_distribution[threat_type] = len([t for t in SAMPLE_THREATS if t["type"] == threat_type])
    
    return {
        "total_threats": total_threats,
        "blocked": blocked,
        "monitoring": monitoring,
        "critical": critical,
        "high": len([t for t in SAMPLE_THREATS if t["severity"] == "high"]),
        "medium": len([t for t in SAMPLE_THREATS if t["severity"] == "medium"]),
        "low": len([t for t in SAMPLE_THREATS if t["severity"] == "low"]),
        "type_distribution": type_distribution,
        "last_updated": datetime.now().isoformat()
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8082"))
    print(f"🔥 Threat Detector starting on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)




























