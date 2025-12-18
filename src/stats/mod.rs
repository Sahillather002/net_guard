use anyhow::Result;
use colored::Colorize;
use std::collections::HashMap;
use std::time::Duration;
use tokio::time;

use crate::storage::Storage;

pub struct StatsMonitor {
    interface_name: Option<String>,
}

impl StatsMonitor {
    pub fn new(interface_name: Option<String>) -> Result<Self> {
        Ok(Self { interface_name })
    }
    
    pub async fn display_realtime(&self) -> Result<()> {
        println!("{}", "📊 Real-time Network Statistics".bright_cyan().bold());
        println!("{}", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━".bright_black());
        
        if let Some(name) = &self.interface_name {
            println!("Interface: {}\n", name.bright_green());
        }
        
        println!("{}", "Press Ctrl+C to stop".yellow());
        println!();
        
        let mut interval = time::interval(Duration::from_secs(1));
        let mut packet_count = 0u64;
        let mut byte_count = 0u64;
        
        loop {
            interval.tick().await;
            
            // Simulate stats (in real implementation, would get from packet capture)
            packet_count += rand::random::<u64>() % 1000;
            byte_count += rand::random::<u64>() % 100000;
            
            // Clear screen (simple version)
            print!("\x1B[2J\x1B[1;1H");
            
            println!("{}", "📊 Network Statistics".bright_cyan().bold());
            println!("{}", "━━━━━━━━━━━━━━━━━━━━".bright_black());
            println!();
            println!("Total Packets:  {}", format!("{:>12}", packet_count).bright_green());
            println!("Total Bytes:    {}", format!("{:>12}", byte_count).bright_green());
            println!("Avg Packet Size: {} bytes", format!("{:>8}", byte_count / packet_count.max(1)).bright_yellow());
            println!();
            println!("{}", "Protocol Distribution:".bright_cyan());
            println!("  TCP:  {}%", format!("{:>5}", 65).bright_green());
            println!("  UDP:  {}%", format!("{:>5}", 25).bright_yellow());
            println!("  ICMP: {}%", format!("{:>5}", 5).bright_blue());
            println!("  Other: {}%", format!("{:>5}", 5).bright_black());
            
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    }
}

pub fn display_historical_stats(storage: &Storage) -> Result<()> {
    println!("{}", "📊 Historical Statistics".bright_cyan().bold());
    println!("{}", "━━━━━━━━━━━━━━━━━━━━━━━━".bright_black());
    println!();
    
    let total_alerts = storage.get_alert_count()?;
    
    println!("Total Alerts: {}", format!("{}", total_alerts).bright_red().bold());
    
    // Get alerts by severity
    let critical = storage.get_alerts(Some("critical".to_string()), 1000)?;
    let high = storage.get_alerts(Some("high".to_string()), 1000)?;
    let medium = storage.get_alerts(Some("medium".to_string()), 1000)?;
    let low = storage.get_alerts(Some("low".to_string()), 1000)?;
    
    println!();
    println!("{}", "Alerts by Severity:".bright_cyan());
    println!("  Critical: {}", format!("{:>6}", critical.len()).bright_red().bold());
    println!("  High:     {}", format!("{:>6}", high.len()).red());
    println!("  Medium:   {}", format!("{:>6}", medium.len()).yellow());
    println!("  Low:      {}", format!("{:>6}", low.len()).blue());
    
    // Count by type
    let all_alerts = storage.get_alerts(None, 10000)?;
    let mut type_counts: HashMap<String, usize> = HashMap::new();
    
    for alert in &all_alerts {
        *type_counts.entry(alert.alert_type.clone()).or_insert(0) += 1;
    }
    
    if !type_counts.is_empty() {
        println!();
        println!("{}", "Alerts by Type:".bright_cyan());
        
        let mut sorted: Vec<_> = type_counts.iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(a.1));
        
        for (alert_type, count) in sorted.iter().take(10) {
            println!("  {}: {}", alert_type, format!("{:>6}", count).bright_green());
        }
    }
    
    Ok(())
}
