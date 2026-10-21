import { Bug, Code2, Cpu, Eye, FileSearch, FileText, Globe, KeyRound, Target, Terminal } from 'lucide-react'

// Detects what a writeup is about from its title / tags / event, so the generated cover is relevant to the post.
// First match wins, so keep the more specific topics first.
const TOPICS = [
  { key: 'bounty', label: 'Bug bounty', Icon: Target, hue: 18, re: /bounty|hackerone|bugcrowd|intigriti|\bcve\b|disclos/ },
  { key: 'crypto', label: 'Crypto', Icon: KeyRound, hue: 268, re: /crypto|\brsa\b|\baes\b|cipher|\bxor\b|hash|\becc\b|diffie|signature|encrypt/ },
  { key: 'pwn', label: 'Pwn', Icon: Bug, hue: 350, re: /\bpwn|\brop\b|ret2|overflow|shellcode|\bheap\b|format string|exploit(ation)? dev|\bgot\b/ },
  { key: 'reverse', label: 'Reverse engineering', Icon: Cpu, hue: 32, re: /reverse|\brev\b|ghidra|\bida\b|crackme|decompil|disassembl|keygen|binary ninja|assembly|malware/ },
  { key: 'forensics', label: 'Forensics', Icon: FileSearch, hue: 212, re: /forensic|pcap|wireshark|memory dump|volatility|disk image|stego|exif|\blog analysis/ },
  { key: 'osint', label: 'OSINT', Icon: Eye, hue: 150, re: /osint|geoloc|whois|social media|username|open.source intel/ },
  { key: 'web', label: 'Web', Icon: Globe, hue: 188, re: /\bweb\b|xss|sqli|sql injection|ssti|template injection|csrf|ssrf|\bidor\b|injection|\bjwt\b|cookie|burp|\bhttp|\bphp\b|node\.?js|deserializ|lfi|rfi|\bxxe\b|graphql|\bapi\b/ },
  { key: 'cp', label: 'Competitive programming', Icon: Code2, hue: 235, re: /codeforces|leetcode|icpc|algorithm|dynamic programming|\bdp\b|graph|segment tree|competitive/ },
  { key: 'linux', label: 'Linux & tooling', Icon: Terminal, hue: 120, re: /linux|bash|privesc|privilege escalation|\bssh\b|nmap|metasploit|command line|terminal|\bctf tools/ },
]
const FALLBACK = { key: 'general', label: 'Writeup', Icon: FileText, hue: 200 }

export function topicOf(post) {
  const hay = `${post.title} ${(post.tags || []).join(' ')} ${post.event || ''}`.toLowerCase()
  return TOPICS.find((t) => t.re.test(hay)) || FALLBACK
}
