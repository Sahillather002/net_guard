use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use crate::capture::parser::ParsedPacket;
use crate::config::DetectionConfig;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub alert_type: String,
    pub severity: String,
    pub source_ip: String,
    pub destination_ip: Option<String>,
    pub details: String,
    pub timestamp: DateTime<Utc>,
}

pub struct DetectionEngine {
    config: DetectionConfig,
    port_scan_tracker: Arc<Mutex<HashMap<String, Vec<(u16, DateTime<Utc>)>>>>,
    packet_rate_tracker: Arc<Mutex<HashMap<String, Vec<DateTime<Utc>>>>>,
}

impl DetectionEngine {
    pub fn new(config: DetectionConfig) -> Self {
        Self {
            config,
            port_scan_tracker: Arc::new(Mutex::new(HashMap::new())),
            packet_rate_tracker: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    pub fn check_packet(&self, packet: &ParsedPacket) -> Option<Alert> {
        // Check for port scanning
        if self.config.port_scan.enabled {
            if let Some(alert) = self.check_port_scan(packet) {
                return Some(alert);
            }
        }
        
        // Check for DDoS
        if self.config.ddos.enabled {
            if let Some(alert) = self.check_ddos(packet) {
                return Some(alert);
            }
        }
        
        // Check for suspicious ports
        if let Some(alert) = self.check_suspicious_port(packet) {
            return Some(alert);
        }
        
        None
    }
    
    fn check_port_scan(&self, packet: &ParsedPacket) -> Option<Alert> {
        if let Some(dest_port) = packet.destination_port {
            let mut tracker = self.port_scan_tracker.lock().unwrap();
            let now = Utc::now();
            
            let ports = tracker.entry(packet.source_ip.clone()).or_insert_with(Vec::new);
            
            // Remove old entries
            ports.retain(|(_, time)| {
                (now - *time).num_seconds() < self.config.port_scan.window_seconds as i64
            });
            
            // Add current port
            ports.push((dest_port, now));
            
            // Check if threshold exceeded
            let unique_ports: std::collections::HashSet<_> = ports.iter().map(|(p, _)| p).collect();
            
            if unique_ports.len() >= self.config.port_scan.threshold {
                let port_list: Vec<String> = unique_ports.iter().map(|p| p.to_string()).collect();
                
                return Some(Alert {
                    alert_type: "Port Scan".to_string(),
                    severity: "high".to_string(),
                    source_ip: packet.source_ip.clone(),
                    destination_ip: Some(packet.destination_ip.clone()),
                    details: format!(
                        "Scanned {} unique ports in {} seconds: {}",
                        unique_ports.len(),
                        self.config.port_scan.window_seconds,
                        port_list.join(", ")
                    ),
                    timestamp: now,
                });
            }
        }
        
        None
    }
    
    fn check_ddos(&self, packet: &ParsedPacket) -> Option<Alert> {
        let mut tracker = self.packet_rate_tracker.lock().unwrap();
        let now = Utc::now();
        
        let packets = tracker.entry(packet.source_ip.clone()).or_insert_with(Vec::new);
        
        // Remove old entries
        packets.retain(|time| {
            (now - *time).num_seconds() < self.config.ddos.window_seconds as i64
        });
        
        // Add current packet
        packets.push(now);
        
        // Check if threshold exceeded
        if packets.len() >= self.config.ddos.threshold {
            let rate = packets.len() as f64 / self.config.ddos.window_seconds as f64;
            
            return Some(Alert {
                alert_type: "Possible DDoS".to_string(),
                severity: "critical".to_string(),
                source_ip: packet.source_ip.clone(),
                destination_ip: Some(packet.destination_ip.clone()),
                details: format!(
                    "High packet rate detected: {:.0} packets/second (threshold: {})",
                    rate,
                    self.config.ddos.threshold
                ),
                timestamp: now,
            });
        }
        
        None
    }
    
    fn check_suspicious_port(&self, packet: &ParsedPacket) -> Option<Alert> {
        if let Some(dest_port) = packet.destination_port {
            if self.config.suspicious_ports.contains(&dest_port) {
                return Some(Alert {
                    alert_type: "Suspicious Port".to_string(),
                    severity: "medium".to_string(),
                    source_ip: packet.source_ip.clone(),
                    destination_ip: Some(packet.destination_ip.clone()),
                    details: format!(
                        "Connection to suspicious port {} ({})",
                        dest_port,
                        get_port_description(dest_port)
                    ),
                    timestamp: Utc::now(),
                });
            }
        }
        
        None
    }
}

fn get_port_description(port: u16) -> &'static str {
    match port {
        23 => "Telnet - Insecure protocol",
        135 => "RPC - Often targeted",
        445 => "SMB - Ransomware vector",
        3389 => "RDP - Brute force target",
        _ => "Unknown service",
    }
}
