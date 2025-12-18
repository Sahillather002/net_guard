use thiserror::Error;

#[derive(Error, Debug)]
pub enum NetGuardError {
    #[error("No network interface found")]
    NoInterfaceFound,
    
    #[error("Interface not found: {0}")]
    InterfaceNotFound(String),
    
    #[error("Failed to open interface: {0}")]
    InterfaceOpenError(String),
    
    #[error("Packet capture error: {0}")]
    CaptureError(String),
    
    #[error("Invalid packet format: {0}")]
    InvalidPacket(String),
    
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    #[error("Configuration error: {0}")]
    ConfigError(String),
    
    #[error("Rule error: {0}")]
    RuleError(String),
    
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    
    #[error("Parse error: {0}")]
    ParseError(String),
}
