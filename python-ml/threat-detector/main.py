"""
SecureCloud - ML-Based Threat Detection Service
Uses TensorFlow and scikit-learn for anomaly detection
"""

import asyncio
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import tensorflow as tf
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import redis.asyncio as redis

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SecureCloud Threat Detector",
    description="ML-based threat detection and anomaly analysis",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
redis_client = None

# ML Models
isolation_forest = None
scaler = None
neural_network = None


class NetworkPacket(BaseModel):
    """Network packet data for analysis"""
    source_ip: str
    destination_ip: str
    source_port: int
    destination_port: int
    protocol: str
    packet_size: int
    timestamp: float
    flags: Optional[List[str]] = []


class ThreatAnalysisRequest(BaseModel):
    """Request for threat analysis"""
    packets: List[NetworkPacket]
    analysis_type: str = "realtime"


class ThreatAnalysisResponse(BaseModel):
    """Response from threat analysis"""
    threat_detected: bool
    threat_type: Optional[str]
    confidence: float
    severity: str
    details: dict
    recommendations: List[str]


class LogEntry(BaseModel):
    """Log entry for analysis"""
    timestamp: float
    level: str
    source: str
    message: str
    metadata: Optional[dict] = {}


@app.on_event("startup")
async def startup_event():
    """Initialize ML models and connections on startup"""
    global redis_client, isolation_forest, scaler, neural_network
    
    logger.info("🚀 Starting Threat Detector Service...")
    
    # Initialize Redis
    try:
        redis_client = await redis.from_url("redis://localhost:6379")
        await redis_client.ping()
        logger.info("✅ Connected to Redis")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Redis: {e}")
    
    # Load or initialize ML models
    try:
        # Isolation Forest for anomaly detection
        isolation_forest = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        
        # Standard scaler for feature normalization
        scaler = StandardScaler()
        
        # Neural network for threat classification
        neural_network = create_threat_classifier()
        
        logger.info("✅ ML models initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize ML models: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global redis_client
    
    logger.info("🛑 Shutting down Threat Detector Service...")
    
    if redis_client:
        await redis_client.close()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "threat-detector",
        "models_loaded": isolation_forest is not None
    }


@app.post("/api/v1/analyze/packet", response_model=ThreatAnalysisResponse)
async def analyze_packet(request: ThreatAnalysisRequest):
    """Analyze network packets for threats"""
    try:
        # Extract features from packets
        features = extract_packet_features(request.packets)
        
        # Normalize features
        features_scaled = scaler.fit_transform(features)
        
        # Anomaly detection
        anomaly_scores = isolation_forest.fit_predict(features_scaled)
        
        # Neural network classification
        threat_probs = neural_network.predict(features_scaled)
        
        # Determine threat level
        is_anomaly = -1 in anomaly_scores
        max_threat_prob = np.max(threat_probs)
        
        threat_detected = is_anomaly or max_threat_prob > 0.7
        
        if threat_detected:
            threat_type = classify_threat_type(features, threat_probs)
            confidence = float(max_threat_prob)
            severity = determine_severity(confidence)
            
            return ThreatAnalysisResponse(
                threat_detected=True,
                threat_type=threat_type,
                confidence=confidence,
                severity=severity,
                details={
                    "anomaly_count": int(np.sum(anomaly_scores == -1)),
                    "max_threat_probability": float(max_threat_prob),
                    "analyzed_packets": len(request.packets)
                },
                recommendations=generate_recommendations(threat_type, severity)
            )
        else:
            return ThreatAnalysisResponse(
                threat_detected=False,
                threat_type=None,
                confidence=float(max_threat_prob),
                severity="none",
                details={
                    "analyzed_packets": len(request.packets),
                    "all_packets_normal": True
                },
                recommendations=[]
            )
    
    except Exception as e:
        logger.error(f"Error analyzing packets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/analyze/logs")
async def analyze_logs(logs: List[LogEntry]):
    """Analyze log entries for anomalies"""
    try:
        # Extract features from logs
        features = extract_log_features(logs)
        
        # Detect anomalies
        anomalies = detect_log_anomalies(features)
        
        return {
            "total_logs": len(logs),
            "anomalies_detected": len(anomalies),
            "anomaly_indices": anomalies,
            "analysis_timestamp": asyncio.get_event_loop().time()
        }
    
    except Exception as e:
        logger.error(f"Error analyzing logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/train/model")
async def train_model(training_data: dict):
    """Train or retrain ML models with new data"""
    try:
        # TODO: Implement model training
        return {
            "status": "training_started",
            "message": "Model training initiated",
            "estimated_time": "5 minutes"
        }
    
    except Exception as e:
        logger.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/models/status")
async def get_model_status():
    """Get status of ML models"""
    return {
        "isolation_forest": {
            "loaded": isolation_forest is not None,
            "n_estimators": 100 if isolation_forest else 0
        },
        "neural_network": {
            "loaded": neural_network is not None,
            "layers": len(neural_network.layers) if neural_network else 0
        },
        "scaler": {
            "loaded": scaler is not None
        }
    }


def create_threat_classifier():
    """Create neural network for threat classification"""
    model = tf.keras.Sequential([
        tf.keras.layers.Dense(128, activation='relu', input_shape=(10,)),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(32, activation='relu'),
        tf.keras.layers.Dense(5, activation='softmax')  # 5 threat types
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model


def extract_packet_features(packets: List[NetworkPacket]) -> np.ndarray:
    """Extract numerical features from network packets"""
    features = []
    
    for packet in packets:
        feature_vector = [
            packet.source_port,
            packet.destination_port,
            packet.packet_size,
            packet.timestamp,
            hash(packet.protocol) % 1000,  # Protocol hash
            hash(packet.source_ip) % 1000,  # IP hash
            hash(packet.destination_ip) % 1000,
            len(packet.flags) if packet.flags else 0,
            1 if packet.destination_port < 1024 else 0,  # Well-known port
            1 if packet.packet_size > 1500 else 0  # Large packet
        ]
        features.append(feature_vector)
    
    return np.array(features)


def extract_log_features(logs: List[LogEntry]) -> np.ndarray:
    """Extract features from log entries"""
    features = []
    
    for log in logs:
        feature_vector = [
            log.timestamp,
            hash(log.level) % 100,
            hash(log.source) % 100,
            len(log.message),
            log.message.count("error"),
            log.message.count("warning"),
            log.message.count("failed"),
            len(log.metadata) if log.metadata else 0
        ]
        features.append(feature_vector)
    
    return np.array(features)


def detect_log_anomalies(features: np.ndarray) -> List[int]:
    """Detect anomalies in log features"""
    if isolation_forest is None:
        return []
    
    predictions = isolation_forest.fit_predict(features)
    anomaly_indices = [i for i, pred in enumerate(predictions) if pred == -1]
    
    return anomaly_indices


def classify_threat_type(features: np.ndarray, probabilities: np.ndarray) -> str:
    """Classify the type of threat based on features and probabilities"""
    threat_types = [
        "port_scan",
        "ddos_attack",
        "malware",
        "data_exfiltration",
        "brute_force"
    ]
    
    max_prob_idx = np.argmax(probabilities[0])
    return threat_types[max_prob_idx]


def determine_severity(confidence: float) -> str:
    """Determine threat severity based on confidence"""
    if confidence >= 0.9:
        return "critical"
    elif confidence >= 0.7:
        return "high"
    elif confidence >= 0.5:
        return "medium"
    else:
        return "low"


def generate_recommendations(threat_type: str, severity: str) -> List[str]:
    """Generate security recommendations based on threat type"""
    recommendations = {
        "port_scan": [
            "Block source IP address",
            "Enable rate limiting on affected ports",
            "Review firewall rules"
        ],
        "ddos_attack": [
            "Activate DDoS mitigation",
            "Contact ISP for upstream filtering",
            "Scale infrastructure if possible"
        ],
        "malware": [
            "Isolate affected systems",
            "Run full malware scan",
            "Review recent file changes"
        ],
        "data_exfiltration": [
            "Block outbound connections to suspicious IPs",
            "Review data access logs",
            "Enable data loss prevention (DLP)"
        ],
        "brute_force": [
            "Implement account lockout policy",
            "Enable multi-factor authentication",
            "Block source IP address"
        ]
    }
    
    return recommendations.get(threat_type, ["Monitor situation closely"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
