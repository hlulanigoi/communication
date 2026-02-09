// Comprehensive Vehicle Inspection Categories and Items
// Based on 2025 industry standards and best practices

export interface InspectionItem {
  id: string;
  name: string;
  description?: string;
  status: 'good' | 'attention' | 'critical' | 'not_checked';
  notes?: string;
}

export interface InspectionSection {
  id: string;
  title: string;
  icon: string;
  items: InspectionItem[];
}

export const defaultInspectionSections: InspectionSection[] = [
  {
    id: 'exterior-tires',
    title: 'Exterior & Tires',
    icon: 'Circle',
    items: [
      { id: 'tire-pressure-fl', name: 'Tire Pressure - Front Left', status: 'not_checked' },
      { id: 'tire-pressure-fr', name: 'Tire Pressure - Front Right', status: 'not_checked' },
      { id: 'tire-pressure-rl', name: 'Tire Pressure - Rear Left', status: 'not_checked' },
      { id: 'tire-pressure-rr', name: 'Tire Pressure - Rear Right', status: 'not_checked' },
      { id: 'tire-tread-depth', name: 'Tire Tread Depth (min 2/32")', status: 'not_checked' },
      { id: 'tire-sidewalls', name: 'Tire Sidewalls (cracks/bulges)', status: 'not_checked' },
      { id: 'wheel-alignment', name: 'Wheel Alignment', status: 'not_checked' },
      { id: 'wheels-rims', name: 'Wheels & Rims (damage)', status: 'not_checked' },
      { id: 'mirrors', name: 'Mirrors (all functional)', status: 'not_checked' },
      { id: 'windows-glass', name: 'Windows & Glass (cracks)', status: 'not_checked' },
      { id: 'wipers', name: 'Wiper Blades', status: 'not_checked' },
      { id: 'body-paint', name: 'Body & Paint Condition', status: 'not_checked' },
    ],
  },
  {
    id: 'lights-signals',
    title: 'Lights & Signals',
    icon: 'Lightbulb',
    items: [
      { id: 'headlights-low', name: 'Headlights (Low Beam)', status: 'not_checked' },
      { id: 'headlights-high', name: 'Headlights (High Beam)', status: 'not_checked' },
      { id: 'taillights', name: 'Taillights', status: 'not_checked' },
      { id: 'brake-lights', name: 'Brake Lights', status: 'not_checked' },
      { id: 'turn-signals-front', name: 'Turn Signals - Front', status: 'not_checked' },
      { id: 'turn-signals-rear', name: 'Turn Signals - Rear', status: 'not_checked' },
      { id: 'hazard-lights', name: 'Hazard Lights', status: 'not_checked' },
      { id: 'reverse-lights', name: 'Reverse Lights', status: 'not_checked' },
      { id: 'license-plate-light', name: 'License Plate Light', status: 'not_checked' },
      { id: 'fog-lights', name: 'Fog Lights (if equipped)', status: 'not_checked' },
    ],
  },
  {
    id: 'brakes-steering',
    title: 'Brakes & Steering',
    icon: 'CircleSlash',
    items: [
      { id: 'brake-pads-front', name: 'Brake Pads - Front', status: 'not_checked' },
      { id: 'brake-pads-rear', name: 'Brake Pads - Rear', status: 'not_checked' },
      { id: 'brake-rotors', name: 'Brake Rotors/Discs', status: 'not_checked' },
      { id: 'brake-fluid-level', name: 'Brake Fluid Level', status: 'not_checked' },
      { id: 'brake-fluid-condition', name: 'Brake Fluid Condition', status: 'not_checked' },
      { id: 'brake-response', name: 'Brake Response/Feel', status: 'not_checked' },
      { id: 'parking-brake', name: 'Parking Brake', status: 'not_checked' },
      { id: 'abs-system', name: 'ABS System', status: 'not_checked' },
      { id: 'steering-play', name: 'Steering Play/Looseness', status: 'not_checked' },
      { id: 'steering-response', name: 'Steering Response', status: 'not_checked' },
      { id: 'power-steering-fluid', name: 'Power Steering Fluid', status: 'not_checked' },
    ],
  },
  {
    id: 'suspension-undercarriage',
    title: 'Suspension & Undercarriage',
    icon: 'Settings',
    items: [
      { id: 'shocks-struts', name: 'Shocks & Struts', status: 'not_checked' },
      { id: 'suspension-bounce', name: 'Suspension Bounce Test', status: 'not_checked' },
      { id: 'control-arms', name: 'Control Arms', status: 'not_checked' },
      { id: 'ball-joints', name: 'Ball Joints', status: 'not_checked' },
      { id: 'tie-rods', name: 'Tie Rods', status: 'not_checked' },
      { id: 'undercarriage-rust', name: 'Undercarriage Rust', status: 'not_checked' },
      { id: 'undercarriage-leaks', name: 'Undercarriage Leaks', status: 'not_checked' },
      { id: 'frame-integrity', name: 'Frame Integrity', status: 'not_checked' },
      { id: 'driveshaft', name: 'Driveshaft (if applicable)', status: 'not_checked' },
      { id: 'differential', name: 'Differential', status: 'not_checked' },
    ],
  },
  {
    id: 'engine-fluids',
    title: 'Engine & Fluids',
    icon: 'Gauge',
    items: [
      { id: 'engine-oil-level', name: 'Engine Oil Level', status: 'not_checked' },
      { id: 'engine-oil-condition', name: 'Engine Oil Condition', status: 'not_checked' },
      { id: 'transmission-fluid', name: 'Transmission Fluid', status: 'not_checked' },
      { id: 'coolant-level', name: 'Coolant Level', status: 'not_checked' },
      { id: 'coolant-condition', name: 'Coolant Condition', status: 'not_checked' },
      { id: 'washer-fluid', name: 'Washer Fluid', status: 'not_checked' },
      { id: 'belts-serpentine', name: 'Belts (Serpentine/Drive)', status: 'not_checked' },
      { id: 'hoses', name: 'Hoses (coolant/vacuum)', status: 'not_checked' },
      { id: 'air-filter', name: 'Air Filter', status: 'not_checked' },
      { id: 'engine-leaks', name: 'Engine Leaks', status: 'not_checked' },
      { id: 'engine-mounts', name: 'Engine Mounts', status: 'not_checked' },
    ],
  },
  {
    id: 'battery-electrical',
    title: 'Battery & Electrical',
    icon: 'Zap',
    items: [
      { id: 'battery-charge', name: 'Battery Charge Level', status: 'not_checked' },
      { id: 'battery-terminals', name: 'Battery Terminals (corrosion)', status: 'not_checked' },
      { id: 'battery-cables', name: 'Battery Cables', status: 'not_checked' },
      { id: 'alternator-output', name: 'Alternator Output', status: 'not_checked' },
      { id: 'starter-motor', name: 'Starter Motor', status: 'not_checked' },
      { id: 'electrical-wiring', name: 'Electrical Wiring', status: 'not_checked' },
      { id: 'fuses', name: 'Fuses', status: 'not_checked' },
      { id: 'horn', name: 'Horn', status: 'not_checked' },
      { id: 'interior-lights', name: 'Interior Lights', status: 'not_checked' },
      { id: 'dashboard-indicators', name: 'Dashboard Indicators', status: 'not_checked' },
    ],
  },
  {
    id: 'exhaust-emissions',
    title: 'Exhaust & Emissions',
    icon: 'Wind',
    items: [
      { id: 'exhaust-leaks', name: 'Exhaust Leaks', status: 'not_checked' },
      { id: 'exhaust-noise', name: 'Exhaust Noise Level', status: 'not_checked' },
      { id: 'muffler', name: 'Muffler Condition', status: 'not_checked' },
      { id: 'catalytic-converter', name: 'Catalytic Converter', status: 'not_checked' },
      { id: 'exhaust-hangers', name: 'Exhaust Hangers/Mounts', status: 'not_checked' },
      { id: 'emissions-compliance', name: 'Emissions Compliance', status: 'not_checked' },
      { id: 'smoke-test', name: 'Smoke/Emissions Visual', status: 'not_checked' },
    ],
  },
  {
    id: 'interior-safety',
    title: 'Interior & Safety',
    icon: 'Shield',
    items: [
      { id: 'seatbelts-front', name: 'Seatbelts - Front', status: 'not_checked' },
      { id: 'seatbelts-rear', name: 'Seatbelts - Rear', status: 'not_checked' },
      { id: 'airbag-indicators', name: 'Airbag Indicators', status: 'not_checked' },
      { id: 'seats-condition', name: 'Seats Condition', status: 'not_checked' },
      { id: 'hvac-heating', name: 'HVAC - Heating', status: 'not_checked' },
      { id: 'hvac-cooling', name: 'HVAC - Air Conditioning', status: 'not_checked' },
      { id: 'defroster', name: 'Defroster', status: 'not_checked' },
      { id: 'interior-lights-cabin', name: 'Interior Cabin Lights', status: 'not_checked' },
      { id: 'dashboard-gauges', name: 'Dashboard Gauges', status: 'not_checked' },
      { id: 'infotainment', name: 'Infotainment System', status: 'not_checked' },
      { id: 'door-locks', name: 'Door Locks (all doors)', status: 'not_checked' },
      { id: 'window-operation', name: 'Window Operation (all)', status: 'not_checked' },
    ],
  },
  {
    id: 'adas-advanced',
    title: 'ADAS & Advanced Systems',
    icon: 'Radar',
    items: [
      { id: 'lane-departure', name: 'Lane Departure Warning', status: 'not_checked' },
      { id: 'adaptive-cruise', name: 'Adaptive Cruise Control', status: 'not_checked' },
      { id: 'blind-spot', name: 'Blind Spot Monitoring', status: 'not_checked' },
      { id: 'collision-avoidance', name: 'Collision Avoidance', status: 'not_checked' },
      { id: 'parking-sensors', name: 'Parking Sensors', status: 'not_checked' },
      { id: 'backup-camera', name: 'Backup Camera', status: 'not_checked' },
      { id: 'auto-braking', name: 'Automatic Emergency Braking', status: 'not_checked' },
      { id: 'traction-control', name: 'Traction Control', status: 'not_checked' },
    ],
  },
  {
    id: 'diagnostics-electronics',
    title: 'Diagnostics & Electronics',
    icon: 'Activity',
    items: [
      { id: 'obd-scan', name: 'OBD-II Diagnostic Scan', status: 'not_checked' },
      { id: 'fault-codes', name: 'Fault Codes Check', status: 'not_checked' },
      { id: 'check-engine-light', name: 'Check Engine Light', status: 'not_checked' },
      { id: 'sensor-status', name: 'Sensor Status Check', status: 'not_checked' },
      { id: 'computer-modules', name: 'Computer Modules', status: 'not_checked' },
      { id: 'wiring-harness', name: 'Wiring Harness Integrity', status: 'not_checked' },
      { id: 'fuel-system', name: 'Fuel System Diagnostics', status: 'not_checked' },
      { id: 'ignition-system', name: 'Ignition System', status: 'not_checked' },
    ],
  },
];

export interface VehicleInspectionData {
  vehicleId?: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    vin?: string;
    licensePlate?: string;
    mileage?: string;
  };
  jobId?: string;
  jobNumber?: string;
  inspectorName: string;
  inspectorId?: string;
  clientInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  sections: InspectionSection[];
  overallStatus: 'In Progress' | 'Completed' | 'Sent to Client';
  inspectorNotes?: string;
  inspectorSignature?: string;
}

export const createEmptyInspection = (): VehicleInspectionData => ({
  vehicleInfo: {
    make: '',
    model: '',
    year: '',
  },
  inspectorName: 'Alex Miller',
  sections: JSON.parse(JSON.stringify(defaultInspectionSections)), // Deep copy
  overallStatus: 'In Progress',
});
