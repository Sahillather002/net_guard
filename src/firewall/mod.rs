use anyhow::Result;
use colored::Colorize;
use std::path::Path;

use crate::config::FirewallRule;

pub fn list_rules() -> Result<()> {
    println!("{}", "🔥 Firewall Rules".bright_cyan().bold());
    println!("{}", "━━━━━━━━━━━━━━━━━━".bright_black());
    println!("\nNo rules currently loaded.");
    println!("Use 'netguard rules add' to add rules.");
    Ok(())
}

pub fn add_rule(
    block: bool,
    ip: Option<String>,
    port: Option<u16>,
    protocol: Option<String>,
) -> Result<()> {
    let action = if block { "BLOCK" } else { "ALLOW" };
    
    println!("{}", "✅ Rule Added".green().bold());
    println!("Action: {}", action);
    
    if let Some(ip) = ip {
        println!("IP: {}", ip);
    }
    
    if let Some(port) = port {
        println!("Port: {}", port);
    }
    
    if let Some(protocol) = protocol {
        println!("Protocol: {}", protocol);
    }
    
    println!("\n{}", "Note: Rules are not persisted in this demo version.".yellow());
    
    Ok(())
}

pub fn remove_rule(id: usize) -> Result<()> {
    println!("{}", format!("✅ Rule {} removed", id).green().bold());
    Ok(())
}

pub fn load_rules(file: &Path) -> Result<()> {
    let content = std::fs::read_to_string(file)?;
    let rules: Vec<FirewallRule> = serde_yaml::from_str(&content)?;
    
    println!("{}", "✅ Rules Loaded".green().bold());
    println!("Loaded {} rules from {}", rules.len(), file.display());
    
    for (idx, rule) in rules.iter().enumerate() {
        println!("\n[{}] {} - {}", idx + 1, rule.action.to_uppercase(), rule.description);
        if let Some(ip) = &rule.source_ip {
            println!("    Source IP: {}", ip);
        }
        if let Some(port) = rule.destination_port {
            println!("    Destination Port: {}", port);
        }
    }
    
    Ok(())
}
