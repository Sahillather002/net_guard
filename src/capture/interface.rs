use anyhow::Result;
use pnet::datalink;

#[derive(Debug, Clone)]
pub struct InterfaceInfo {
    pub name: String,
    pub description: Option<String>,
    pub mac: Option<String>,
    pub ips: Vec<String>,
}

pub fn list_interfaces() -> Result<Vec<InterfaceInfo>> {
    let interfaces = datalink::interfaces();
    
    let info: Vec<InterfaceInfo> = interfaces
        .into_iter()
        .map(|iface| {
            let mac = if !iface.mac.is_none() {
                Some(format!("{}", iface.mac.unwrap()))
            } else {
                None
            };
            
            let ips: Vec<String> = iface
                .ips
                .iter()
                .map(|ip| ip.ip().to_string())
                .collect();
            
            InterfaceInfo {
                name: iface.name.clone(),
                description: Some(iface.description.clone()),
                mac,
                ips,
            }
        })
        .collect();
    
    Ok(info)
}
