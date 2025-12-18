use anyhow::Result;
use chrono::{DateTime, Utc};
use colored::Colorize;
use rusqlite::{params, Connection};
use std::path::Path;

use crate::detection::Alert;

pub struct Storage {
    conn: Connection,
}

impl Storage {
    pub fn new(path: &Path) -> Result<Self> {
        let conn = Connection::open(path)?;
        
        // Create tables
        conn.execute(
            "CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                source_ip TEXT NOT NULL,
                destination_ip TEXT,
                details TEXT NOT NULL,
                timestamp TEXT NOT NULL
            )",
            [],
        )?;
        
        // Create index on timestamp
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_timestamp ON alerts(timestamp)",
            [],
        )?;
        
        Ok(Self { conn })
    }
    
    pub fn store_alert(&mut self, alert: &Alert) -> Result<()> {
        self.conn.execute(
            "INSERT INTO alerts (alert_type, severity, source_ip, destination_ip, details, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                alert.alert_type,
                alert.severity,
                alert.source_ip,
                alert.destination_ip,
                alert.details,
                alert.timestamp.to_rfc3339(),
            ],
        )?;
        
        Ok(())
    }
    
    pub fn get_alerts(
        &self,
        severity: Option<String>,
        limit: usize,
    ) -> Result<Vec<Alert>> {
        let mut query = "SELECT alert_type, severity, source_ip, destination_ip, details, timestamp 
                         FROM alerts".to_string();
        
        if let Some(sev) = &severity {
            query.push_str(&format!(" WHERE severity = '{}'", sev));
        }
        
        query.push_str(" ORDER BY timestamp DESC");
        query.push_str(&format!(" LIMIT {}", limit));
        
        let mut stmt = self.conn.prepare(&query)?;
        
        let alerts = stmt.query_map([], |row| {
            let timestamp_str: String = row.get(5)?;
            let timestamp = DateTime::parse_from_rfc3339(&timestamp_str)
                .map(|dt| dt.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now());
            
            Ok(Alert {
                alert_type: row.get(0)?,
                severity: row.get(1)?,
                source_ip: row.get(2)?,
                destination_ip: row.get(3)?,
                details: row.get(4)?,
                timestamp,
            })
        })?;
        
        let mut result = Vec::new();
        for alert in alerts {
            result.push(alert?);
        }
        
        Ok(result)
    }
    
    pub fn get_alert_count(&self) -> Result<usize> {
        let count: usize = self.conn.query_row(
            "SELECT COUNT(*) FROM alerts",
            [],
            |row| row.get(0),
        )?;
        
        Ok(count)
    }
}

pub fn display_alerts(
    storage: &Storage,
    severity: Option<String>,
    export: Option<std::path::PathBuf>,
    limit: usize,
) -> Result<()> {
    let alerts = storage.get_alerts(severity.clone(), limit)?;
    
    if alerts.is_empty() {
        println!("{}", "No alerts found.".yellow());
        return Ok(());
    }
    
    println!("{}", "🚨 Security Alerts".bright_red().bold());
    println!("{}", "━━━━━━━━━━━━━━━━━━".bright_black());
    
    if let Some(sev) = &severity {
        println!("Filtered by severity: {}\n", sev.to_uppercase());
    }
    
    for (idx, alert) in alerts.iter().enumerate() {
        let severity_color = match alert.severity.as_str() {
            "critical" => alert.severity.bright_red().bold(),
            "high" => alert.severity.red().bold(),
            "medium" => alert.severity.yellow().bold(),
            _ => alert.severity.blue().bold(),
        };
        
        println!("\n[{}] {} - {}", idx + 1, alert.alert_type.bright_cyan(), severity_color);
        println!("    Source: {}", alert.source_ip);
        if let Some(dest) = &alert.destination_ip {
            println!("    Destination: {}", dest);
        }
        println!("    Details: {}", alert.details);
        println!("    Time: {}", alert.timestamp.format("%Y-%m-%d %H:%M:%S UTC"));
    }
    
    println!("\n{}", format!("Total alerts: {}", alerts.len()).bright_black());
    
    // Export if requested
    if let Some(export_path) = export {
        let json = serde_json::to_string_pretty(&alerts)?;
        std::fs::write(&export_path, json)?;
        println!("{}", format!("✅ Exported to {}", export_path.display()).green());
    }
    
    Ok(())
}
