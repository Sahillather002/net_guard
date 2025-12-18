use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub interfaces: Vec<String>,
    pub detection: DetectionConfig,
    pub firewall: FirewallConfig,
    pub logging: LoggingConfig,
    pub database: DatabaseConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectionConfig {
    pub port_scan: PortScanConfig,
    pub ddos: DdosConfig,
    pub suspicious_ports: Vec<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortScanConfig {
    pub enabled: bool,
    pub threshold: usize,
    pub window_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DdosConfig {
    pub enabled: bool,
    pub threshold: usize,
    pub window_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallConfig {
    pub default_policy: String,
    pub rules: Vec<FirewallRule>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirewallRule {
    pub action: String,
    pub source_ip: Option<String>,
    pub destination_port: Option<u16>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub file: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub path: String,
    pub retention_days: u32,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            interfaces: vec![],
            detection: DetectionConfig {
                port_scan: PortScanConfig {
                    enabled: true,
                    threshold: 10,
                    window_seconds: 5,
                },
                ddos: DdosConfig {
                    enabled: true,
                    threshold: 1000,
                    window_seconds: 1,
                },
                suspicious_ports: vec![23, 135, 445, 3389],
            },
            firewall: FirewallConfig {
                default_policy: "allow".to_string(),
                rules: vec![],
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                file: "netguard.log".to_string(),
            },
            database: DatabaseConfig {
                path: "alerts.db".to_string(),
                retention_days: 30,
            },
        }
    }
}

impl Config {
    pub fn from_file(path: &Path) -> Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let config: Config = serde_yaml::from_str(&content)?;
        Ok(config)
    }
    
    pub fn to_file(&self, path: &Path) -> Result<()> {
        let content = serde_yaml::to_string(self)?;
        std::fs::write(path, content)?;
        Ok(())
    }
}
