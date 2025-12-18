use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "netguard")]
#[command(author = "Your Name <your.email@example.com>")]
#[command(version = "0.1.0")]
#[command(about = "Network traffic monitor and threat detection system", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// List available network interfaces
    ListInterfaces,
    
    /// Monitor network traffic
    Monitor {
        /// Network interface to monitor
        #[arg(short, long)]
        interface: Option<String>,
        
        /// Database path for storing alerts
        #[arg(short, long)]
        db_path: Option<PathBuf>,
        
        /// Configuration file path
        #[arg(short, long)]
        config_file: Option<PathBuf>,
        
        /// Verbose output
        #[arg(short, long)]
        verbose: bool,
    },
    
    /// Display traffic statistics
    Stats {
        /// Network interface
        #[arg(short, long)]
        interface: Option<String>,
        
        /// Database path for historical stats
        #[arg(short, long)]
        db_path: Option<PathBuf>,
        
        /// Show historical statistics
        #[arg(long)]
        history: bool,
    },
    
    /// Manage firewall rules
    Rules {
        #[command(subcommand)]
        subcommand: RulesCommands,
    },
    
    /// View security alerts
    Alerts {
        /// Database path
        #[arg(short, long)]
        db_path: PathBuf,
        
        /// Filter by severity (low, medium, high, critical)
        #[arg(short, long)]
        severity: Option<String>,
        
        /// Export to JSON file
        #[arg(short, long)]
        export: Option<PathBuf>,
        
        /// Limit number of results
        #[arg(short, long, default_value = "100")]
        limit: usize,
    },
}

#[derive(Subcommand)]
pub enum RulesCommands {
    /// List all firewall rules
    List,
    
    /// Add a new firewall rule
    Add {
        /// Block traffic (default: allow)
        #[arg(short, long)]
        block: bool,
        
        /// IP address or CIDR
        #[arg(long)]
        ip: Option<String>,
        
        /// Port number
        #[arg(long)]
        port: Option<u16>,
        
        /// Protocol (tcp, udp, icmp)
        #[arg(long)]
        protocol: Option<String>,
    },
    
    /// Remove a firewall rule
    Remove {
        /// Rule ID
        #[arg(short, long)]
        id: usize,
    },
    
    /// Load rules from file
    Load {
        /// Rules file (YAML format)
        #[arg(short, long)]
        file: PathBuf,
    },
}
