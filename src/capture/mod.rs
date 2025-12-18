mod interface;
pub mod parser;

pub use interface::list_interfaces;

use anyhow::Result;
use pnet::datalink::{self, Channel, NetworkInterface};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::config::Config;
use crate::detection::DetectionEngine;
use crate::error::NetGuardError;
use crate::storage::Storage;

pub struct Monitor {
    interface: NetworkInterface,
    config: Config,
    storage: Option<Arc<Mutex<Storage>>>,
    verbose: bool,
}

impl Monitor {
    pub fn new(
        interface_name: Option<String>,
        config: Config,
        storage: Option<Storage>,
        verbose: bool,
    ) -> Result<Self> {
        let interfaces = datalink::interfaces();
        
        let interface = if let Some(name) = interface_name {
            interfaces
                .into_iter()
                .find(|iface| iface.name == name)
                .ok_or_else(|| NetGuardError::InterfaceNotFound(name))?
        } else {
            interfaces
                .into_iter()
                .find(|iface| !iface.ips.is_empty() && iface.is_up())
                .ok_or(NetGuardError::NoInterfaceFound)?
        };
        
        let storage = storage.map(|s| Arc::new(Mutex::new(s)));
        
        Ok(Self {
            interface,
            config,
            storage,
            verbose,
        })
    }
    
    pub async fn start(self) -> Result<()> {
        use colored::Colorize;
        
        println!("📡 Monitoring interface: {}", self.interface.name.bright_green());
        println!();
        
        // Create detection engine
        let detection_engine = DetectionEngine::new(self.config.detection.clone());
        
        // Create a channel to receive packets
        let (_, mut rx) = match datalink::channel(&self.interface, Default::default()) {
            Ok(Channel::Ethernet(tx, rx)) => (tx, rx),
            Ok(_) => return Err(NetGuardError::CaptureError("Unhandled channel type".to_string()).into()),
            Err(e) => return Err(NetGuardError::CaptureError(e.to_string()).into()),
        };
        
        let mut packet_count = 0u64;
        
        loop {
            match rx.next() {
                Ok(packet) => {
                    packet_count += 1;
                    
                    // Parse packet
                    if let Some(parsed) = parser::parse_packet(packet) {
                        // Run detection
                        if let Some(alert) = detection_engine.check_packet(&parsed) {
                            self.handle_alert(alert).await?;
                        }
                        
                        if self.verbose && packet_count % 100 == 0 {
                            println!("📦 Packets captured: {}", packet_count);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Error receiving packet: {}", e);
                }
            }
        }
    }
    
    async fn handle_alert(&self, alert: crate::detection::Alert) -> Result<()> {
        use colored::Colorize;
        
        // Display alert
        let severity_color = match alert.severity.as_str() {
            "critical" => alert.severity.bright_red().bold(),
            "high" => alert.severity.red().bold(),
            "medium" => alert.severity.yellow().bold(),
            _ => alert.severity.blue().bold(),
        };
        
        println!("\n🚨 {} {}", "ALERT:".bright_red().bold(), severity_color);
        println!("   Type: {}", alert.alert_type);
        println!("   Source: {}", alert.source_ip);
        if let Some(dest) = &alert.destination_ip {
            println!("   Destination: {}", dest);
        }
        println!("   Details: {}", alert.details);
        println!("   Time: {}", alert.timestamp);
        println!();
        
        // Store alert if database is configured
        if let Some(storage) = &self.storage {
            let mut storage = storage.lock().await;
            storage.store_alert(&alert)?;
        }
        
        Ok(())
    }
}
