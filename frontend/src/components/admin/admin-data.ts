export type AdminStatus =
  | "active"
  | "pending"
  | "verified"
  | "suspended"
  | "open"
  | "under review"
  | "resolved"
  | "funded"
  | "processing"
  | "completed"
  | "failed"
  | "draft"
  | "live"
  | "closing soon"
  | "in production"
  | "quality check"
  | "shipped";

export const adminUsers = [
  { id: "usr-1001", name: "Maya Chen", email: "maya@northline.studio", type: "Buyer", country: "United Kingdom", orders: 12, value: 84200, status: "active" as AdminStatus, joined: "Jun 18, 2026" },
  { id: "usr-1002", name: "Ali Raza", email: "ali@sialkotsports.pk", type: "Manufacturer", country: "Pakistan", orders: 28, value: 186400, status: "verified" as AdminStatus, joined: "Jun 16, 2026" },
  { id: "usr-1003", name: "Sofia Martinez", email: "sofia@clubonce.es", type: "Buyer", country: "Spain", orders: 7, value: 31900, status: "active" as AdminStatus, joined: "Jun 11, 2026" },
  { id: "usr-1004", name: "Hassan Textiles", email: "ops@hassantextiles.com", type: "Manufacturer", country: "Pakistan", orders: 0, value: 0, status: "pending" as AdminStatus, joined: "Jun 20, 2026" },
  { id: "usr-1005", name: "Kofi Mensah", email: "kofi@accraunited.gh", type: "Buyer", country: "Ghana", orders: 4, value: 17600, status: "active" as AdminStatus, joined: "Jun 8, 2026" },
  { id: "usr-1006", name: "Nova Apparel", email: "hello@novaapparel.co", type: "Manufacturer", country: "Bangladesh", orders: 16, value: 96300, status: "suspended" as AdminStatus, joined: "May 29, 2026" },
];

export const adminManufacturers = [
  { id: "mfg-2041", company: "Hassan Textiles", location: "Faisalabad, Pakistan", category: "Performance apparel", moq: 100, portfolio: 14, tier: "Tier 2", submitted: "2 hours ago", risk: "Low", status: "pending" as AdminStatus },
  { id: "mfg-2042", company: "Delta Sporting Co.", location: "Sialkot, Pakistan", category: "Teamwear & balls", moq: 50, portfolio: 21, tier: "Tier 2", submitted: "5 hours ago", risk: "Low", status: "pending" as AdminStatus },
  { id: "mfg-2043", company: "Ananta Knitworks", location: "Dhaka, Bangladesh", category: "Cut & sew knitwear", moq: 250, portfolio: 9, tier: "Tier 1", submitted: "Yesterday", risk: "Medium", status: "pending" as AdminStatus },
  { id: "mfg-2044", company: "Meridian Leather", location: "Lahore, Pakistan", category: "Leather goods", moq: 75, portfolio: 18, tier: "Tier 2", submitted: "Jun 18", risk: "Low", status: "verified" as AdminStatus },
  { id: "mfg-2045", company: "Nova Apparel", location: "Chattogram, Bangladesh", category: "Fashion basics", moq: 300, portfolio: 7, tier: "Tier 1", submitted: "Jun 12", risk: "High", status: "suspended" as AdminStatus },
];

export const adminOrders = [
  { id: "ORD-10682", title: "Northline FC home kits", buyer: "Northline Studio", manufacturer: "Sialkot Sports", value: 18400, units: 850, status: "in production" as AdminStatus, escrow: "funded" as AdminStatus, due: "Jul 14", progress: 46 },
  { id: "ORD-10679", title: "Club Once training range", buyer: "Club Once", manufacturer: "Delta Sporting Co.", value: 12850, units: 600, status: "quality check" as AdminStatus, escrow: "funded" as AdminStatus, due: "Jun 28", progress: 76 },
  { id: "ORD-10673", title: "Accra United away shirts", buyer: "Accra United", manufacturer: "Ananta Knitworks", value: 9200, units: 400, status: "in production" as AdminStatus, escrow: "funded" as AdminStatus, due: "Jul 8", progress: 58 },
  { id: "ORD-10668", title: "Velocity compression tops", buyer: "Velocity Labs", manufacturer: "Hassan Textiles", value: 21600, units: 1200, status: "shipped" as AdminStatus, escrow: "processing" as AdminStatus, due: "Jun 24", progress: 92 },
  { id: "ORD-10661", title: "Ridge cycling capsule", buyer: "Ridge Collective", manufacturer: "Meridian Works", value: 7400, units: 250, status: "open" as AdminStatus, escrow: "pending" as AdminStatus, due: "Jul 20", progress: 12 },
  { id: "ORD-10654", title: "Tangent retail uniforms", buyer: "Tangent Retail", manufacturer: "Nova Apparel", value: 14600, units: 900, status: "under review" as AdminStatus, escrow: "funded" as AdminStatus, due: "Jul 2", progress: 36 },
];

export const adminRfqs = [
  { id: "RFQ-8821", title: "Technical football tracksuits", buyer: "Northline Studio", category: "Sportswear", budget: 22400, bids: 14, expires: "08h 42m", status: "closing soon" as AdminStatus, risk: false },
  { id: "RFQ-8819", title: "Recycled mesh basketball kits", buyer: "Hoop Union", category: "Sportswear", budget: 9600, bids: 9, expires: "1d 04h", status: "live" as AdminStatus, risk: false },
  { id: "RFQ-8815", title: "Embroidered leather weekender", buyer: "Maison North", category: "Leather goods", budget: 17800, bids: 4, expires: "2d 11h", status: "live" as AdminStatus, risk: false },
  { id: "RFQ-8810", title: "Youth academy training bibs", buyer: "Accra United", category: "Sportswear", budget: 3400, bids: 23, expires: "05h 10m", status: "under review" as AdminStatus, risk: true },
  { id: "RFQ-8807", title: "Custom rigid mailer boxes", buyer: "Vera Skin", category: "Packaging", budget: 6200, bids: 7, expires: "3d 02h", status: "live" as AdminStatus, risk: false },
];

export const adminPayouts = [
  { id: "PAY-5038", order: "ORD-10679", manufacturer: "Delta Sporting Co.", milestone: "M2 Quality check", gross: 3855, fee: 38.55, net: 3816.45, method: "Bank transfer", status: "pending" as AdminStatus, created: "24 min ago" },
  { id: "PAY-5037", order: "ORD-10668", manufacturer: "Hassan Textiles", milestone: "M3 Delivery", gross: 6480, fee: 64.8, net: 6415.2, method: "USDC (Solana)", status: "processing" as AdminStatus, created: "2 hours ago" },
  { id: "PAY-5034", order: "ORD-10673", manufacturer: "Ananta Knitworks", milestone: "M1 Production", gross: 3680, fee: 36.8, net: 3643.2, method: "Wise", status: "pending" as AdminStatus, created: "Yesterday" },
  { id: "PAY-5029", order: "ORD-10644", manufacturer: "Sialkot Sports", milestone: "M3 Delivery", gross: 9120, fee: 91.2, net: 9028.8, method: "Bank transfer", status: "completed" as AdminStatus, created: "Jun 18" },
  { id: "PAY-5025", order: "ORD-10639", manufacturer: "Meridian Leather", milestone: "M2 Quality check", gross: 2440, fee: 24.4, net: 2415.6, method: "Payoneer", status: "failed" as AdminStatus, created: "Jun 17" },
];

export const adminDisputes = [
  { id: "DSP-0192", order: "ORD-10654", reason: "Wrong specifications", filedBy: "Tangent Retail", against: "Nova Apparel", value: 14600, age: "3d 7h", status: "under review" as AdminStatus, priority: "Urgent" },
  { id: "DSP-0191", order: "ORD-10648", reason: "Quality issue", filedBy: "Aster Athletics", against: "Prime Stitch", value: 8200, age: "1d 4h", status: "open" as AdminStatus, priority: "High" },
  { id: "DSP-0187", order: "ORD-10612", reason: "Non-delivery", filedBy: "Redwood FC", against: "MK Exports", value: 11900, age: "6d 2h", status: "open" as AdminStatus, priority: "Urgent" },
  { id: "DSP-0181", order: "ORD-10588", reason: "Payment issue", filedBy: "Delta Sporting Co.", against: "Bold Club", value: 5400, age: "12d", status: "resolved" as AdminStatus, priority: "Normal" },
];

export const adminLogs = [
  { id: "LOG-9218", actor: "Nadia Khan", action: "Approved manufacturer", target: "Delta Sporting Co.", category: "Verification", ip: "39.41.18.204", time: "6 minutes ago" },
  { id: "LOG-9217", actor: "System", action: "Flagged unusual bid velocity", target: "RFQ-8810", category: "Risk", ip: "Automated", time: "19 minutes ago" },
  { id: "LOG-9216", actor: "Omar Ali", action: "Released milestone payout", target: "PAY-5037", category: "Finance", ip: "182.176.92.11", time: "2 hours ago" },
  { id: "LOG-9215", actor: "Nadia Khan", action: "Requested dispute evidence", target: "DSP-0192", category: "Dispute", ip: "39.41.18.204", time: "4 hours ago" },
  { id: "LOG-9214", actor: "System", action: "Escrow funding recorded", target: "ORD-10682", category: "Finance", ip: "Webhook", time: "Yesterday" },
  { id: "LOG-9213", actor: "Omar Ali", action: "Suspended user account", target: "Nova Apparel", category: "User", ip: "182.176.92.11", time: "Yesterday" },
  { id: "LOG-9208", actor: "Nadia Khan", action: "Updated platform fee", target: "Commission: 1%", category: "Settings", ip: "39.41.18.204", time: "Jun 18" },
];

