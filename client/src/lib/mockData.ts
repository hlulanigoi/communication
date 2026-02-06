import { Wrench, Users, Car, FileText, Calendar, Box, Activity, Settings, MessageSquare, Shield, BarChart3, Search, Bell, LogOut, LayoutDashboard, Plus, CreditCard, GraduationCap, Briefcase, UserRound, ClipboardList, Receipt } from "lucide-react";

export const mockStaff = [
  { id: "S-001", name: "Alex Miller", role: "Senior Technician", type: "Staff", status: "Active" },
  { id: "S-002", name: "Sam Knight", role: "Electrician", type: "Staff", status: "Active" },
  { id: "S-003", name: "Jordan Lee", role: "Junior Tech", type: "Student", placement: "Front-end Shop", status: "Active" },
  { id: "S-004", name: "Taylor Reed", role: "Intern", type: "Intern", department: "Diagnostics", status: "Active" },
];

export const mockNotes = [
  { id: 1, text: "Check RS6 parts arrival", author: "Admin", date: "2024-02-14" },
  { id: 2, text: "Intern orientation @ 9AM", author: "HR Manager", date: "2024-02-15" },
  { id: 3, text: "Update student placement docs", author: "HR Manager", date: "2024-02-15" },
];

export const mockMonthlyBills = [
  { id: "B-2024-02-01", description: "Workshop Electricity", amount: 450.00, status: "Pending", category: "Utilities" },
  { id: "B-2024-02-02", description: "Internet Fiber", amount: 85.00, status: "Paid", category: "Communication" },
  { id: "B-2024-02-03", description: "Parts Supply Co", amount: 1200.00, status: "Due", category: "Inventory" },
];

export const mockVehicles = [
  { id: "V001", make: "Audi", model: "RS6 Avant", year: 2023, plate: "GH-928-KL", vin: "WAUZZZ4G8FN0...", status: "In Service", mileage: "12,450 km", owner: "Marcus Webb" },
  { id: "V002", make: "Porsche", model: "911 GT3", year: 2022, plate: "PO-911-RS", vin: "WP0ZZZ99ZLS...", status: "Ready", mileage: "8,200 km", owner: "Sarah Jenkins" },
  { id: "V003", make: "Land Rover", model: "Defender 110", year: 2024, plate: "LR-442-XM", vin: "SALLAAA13MA...", status: "Waiting Parts", mileage: "5,100 km", owner: "TechCorp Fleet" },
  { id: "V004", make: "BMW", model: "M4 Competition", year: 2023, plate: "BM-440-MP", vin: "WBS3R0C050...", status: "Scheduled", mileage: "15,800 km", owner: "James Chen" },
  { id: "V005", make: "Mercedes", model: "G63 AMG", year: 2021, plate: "MB-630-AG", vin: "WDB4632761...", status: "In Service", mileage: "32,100 km", owner: "Elena Voight" },
];

export const mockJobs = [
  { id: "J-2024-001", vehicleId: "V001", type: "Maintenance", description: "30k Service + Brake Inspection", status: "In Progress", priority: "High", assignedTo: "Alex M.", date: "2024-02-14" },
  { id: "J-2024-002", vehicleId: "V003", type: "Repair", description: "Coolant Leak Diagnostic", status: "Pending Parts", priority: "Medium", assignedTo: "Sam K.", date: "2024-02-13" },
  { id: "J-2024-003", vehicleId: "V002", type: "Detailing", description: "Ceramic Coating Refresh", status: "Completed", priority: "Low", assignedTo: "Detail Team", date: "2024-02-12" },
  { id: "J-2024-004", vehicleId: "V005", type: "Inspection", description: "Pre-purchase Inspection", status: "In Progress", priority: "High", assignedTo: "Alex M.", date: "2024-02-14" },
];

export const mockClients = [
  { id: "C-001", name: "Marcus Webb", email: "marcus.webb@example.com", phone: "+27 82 123 4567", type: "Individual", status: "Active", vehicles: 1, source: "Direct" },
  { id: "C-002", name: "Sarah Jenkins", email: "marcus.webb@example.com", phone: "+27 71 987 6543", type: "Individual", status: "Active", vehicles: 1, source: "Insurance (Santam)" },
  { id: "C-003", name: "TechCorp Logistics", email: "fleet@techcorp.com", phone: "+27 11 445 0000", type: "Corporate", status: "Active", vehicles: 12, source: "Fleet Contract" },
  { id: "C-004", name: "James Chen", email: "james.chen@design.co", phone: "+27 83 555 1212", type: "Individual", status: "Active", vehicles: 2, source: "Direct" },
  { id: "C-005", name: "Mutual Insurance", email: "claims@mutual.co.za", phone: "+27 72 444 8888", type: "Insurance", status: "Active", vehicles: 45, source: "Insurance Partner" },
];

export const mockInvoices = [
  { id: "INV-2024-001", client: "Marcus Webb", date: "2024-02-10", amount: 1250.00, status: "Paid", dueDate: "2024-02-10" },
  { id: "INV-2024-002", client: "Elena Voight", date: "2024-02-12", amount: 3400.00, status: "Pending", dueDate: "2024-02-26" },
  { id: "INV-2024-003", client: "TechCorp Logistics", date: "2024-02-14", amount: 890.00, status: "Overdue", dueDate: "2024-02-11" },
];

export const mockInventory = [
  { id: "P-101", name: "Brake Pad Set (Front)", sku: "BP-F-001", category: "Brakes", stock: 14, minStock: 5, price: 85.00, location: "A-12-3" },
  { id: "P-102", name: "Synthetic Oil 5W-30 (1L)", sku: "OIL-SYN-530", category: "Fluids", stock: 45, minStock: 20, price: 12.50, location: "B-04-1" },
  { id: "P-103", name: "Oil Filter (Generic)", sku: "FLT-OIL-GEN", category: "Filters", stock: 8, minStock: 10, price: 8.99, location: "B-04-2" },
  { id: "P-104", name: "Spark Plug (Iridium)", sku: "SPK-IR-004", category: "Ignition", stock: 24, minStock: 12, price: 18.00, location: "A-08-4" },
];

export const stats = [
  { label: "Vehicles in Shop", value: "12", change: "+2", icon: Car, color: "text-blue-500" },
  { label: "Jobs in Progress", value: "8", change: "-1", icon: Wrench, color: "text-amber-500" },
  { label: "Revenue (Feb)", value: "$42,500", change: "+15%", icon: BarChart3, color: "text-emerald-500" },
  { label: "Pending Parts", value: "3", change: "0", icon: Box, color: "text-rose-500" },
];

export const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ClipboardList, label: "Inspections", href: "/dvi" },
  { icon: FileText, label: "Documents", href: "/documents" },
  { icon: GraduationCap, label: "Academy", href: "/academy" },
  { icon: Users, label: "People", href: "/people" },
  { icon: Wrench, label: "Jobs", href: "/jobs" },
  { icon: Car, label: "Vehicles", href: "/vehicles" },
  { icon: CreditCard, label: "Billing", href: "/billing" },
  { icon: Receipt, label: "Admin Bills", href: "/admin-bills" },
  { icon: Box, label: "Inventory", href: "/inventory" },
  { icon: Activity, label: "Analytics", href: "/analytics" },
];
