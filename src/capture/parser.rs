use pnet::packet::ethernet::{EthernetPacket, EtherTypes};
use pnet::packet::ip::{IpNextHeaderProtocols};
use pnet::packet::ipv4::Ipv4Packet;
use pnet::packet::tcp::TcpPacket;
use pnet::packet::udp::UdpPacket;
use pnet::packet::Packet;

#[derive(Debug, Clone)]
pub struct ParsedPacket {
    pub source_ip: String,
    pub destination_ip: String,
    pub source_port: Option<u16>,
    pub destination_port: Option<u16>,
    pub protocol: String,
    pub size: usize,
}

pub fn parse_packet(packet: &[u8]) -> Option<ParsedPacket> {
    let ethernet = EthernetPacket::new(packet)?;
    
    match ethernet.get_ethertype() {
        EtherTypes::Ipv4 => {
            let ipv4 = Ipv4Packet::new(ethernet.payload())?;
            let source_ip = ipv4.get_source().to_string();
            let destination_ip = ipv4.get_destination().to_string();
            
            match ipv4.get_next_level_protocol() {
                IpNextHeaderProtocols::Tcp => {
                    let tcp = TcpPacket::new(ipv4.payload())?;
                    Some(ParsedPacket {
                        source_ip,
                        destination_ip,
                        source_port: Some(tcp.get_source()),
                        destination_port: Some(tcp.get_destination()),
                        protocol: "TCP".to_string(),
                        size: packet.len(),
                    })
                }
                IpNextHeaderProtocols::Udp => {
                    let udp = UdpPacket::new(ipv4.payload())?;
                    Some(ParsedPacket {
                        source_ip,
                        destination_ip,
                        source_port: Some(udp.get_source()),
                        destination_port: Some(udp.get_destination()),
                        protocol: "UDP".to_string(),
                        size: packet.len(),
                    })
                }
                IpNextHeaderProtocols::Icmp => {
                    Some(ParsedPacket {
                        source_ip,
                        destination_ip,
                        source_port: None,
                        destination_port: None,
                        protocol: "ICMP".to_string(),
                        size: packet.len(),
                    })
                }
                _ => Some(ParsedPacket {
                    source_ip,
                    destination_ip,
                    source_port: None,
                    destination_port: None,
                    protocol: "OTHER".to_string(),
                    size: packet.len(),
                }),
            }
        }
        _ => None,
    }
}
