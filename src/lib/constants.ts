export const APP_NAME = "CM Kerala Grievance Portal";
export const APP_SHORT_NAME = "CMO Kerala";
export const APP_DISCLAIMER =
  "Independent demonstration project. Not affiliated with, authorised by, or endorsed by the Government of Kerala. All records are sample data.";

export const DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
] as const;

export const CATEGORIES = [
  "Roads & Infrastructure",
  "Healthcare",
  "Education",
  "Water Supply",
  "Electricity",
  "Sanitation & Waste",
  "Transport",
  "Revenue & Land",
  "Social Welfare",
  "Public Safety",
  "Agriculture",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DEPARTMENTS_SEED = [
  {
    code: "PWD",
    name: "Public Works Department",
    shortName: "Public Works",
    description:
      "Roads, bridges, public buildings and street infrastructure across the state.",
    headName: "Er. K. R. Nandakumar",
    contactEmail: "pwd@example.gov.in",
    contactPhone: "0471-251 8000",
  },
  {
    code: "HEALTH",
    name: "Health & Family Welfare",
    shortName: "Health",
    description:
      "Primary health centres, district hospitals, ambulance services and public health programmes.",
    headName: "Dr. Meera Vasudevan",
    contactEmail: "health@example.gov.in",
    contactPhone: "0471-251 8100",
  },
  {
    code: "EDU",
    name: "General Education",
    shortName: "Education",
    description:
      "Government schools, teacher appointments, scholarships and higher secondary education.",
    headName: "Smt. Latha Krishnan",
    contactEmail: "education@example.gov.in",
    contactPhone: "0471-251 8200",
  },
  {
    code: "KWA",
    name: "Kerala Water Authority",
    shortName: "Water Authority",
    description:
      "Drinking water supply, pipelines, treatment plants and public water tanks.",
    headName: "Er. Anil Mathew",
    contactEmail: "kwa@example.gov.in",
    contactPhone: "0471-251 8300",
  },
  {
    code: "KSEB",
    name: "Kerala State Electricity Board",
    shortName: "Electricity Board",
    description:
      "Power distribution, street lighting, transformers and electricity billing services.",
    headName: "Er. S. Rajeev",
    contactEmail: "kseb@example.gov.in",
    contactPhone: "0471-251 8400",
  },
  {
    code: "REV",
    name: "Revenue Department",
    shortName: "Revenue",
    description:
      "Land records, survey, certificates, disaster relief and taluk administration.",
    headName: "Shri P. Harikrishnan",
    contactEmail: "revenue@example.gov.in",
    contactPhone: "0471-251 8500",
  },
  {
    code: "LSGD",
    name: "Local Self Government",
    shortName: "Local Government",
    description:
      "Panchayats, municipalities, waste management, drainage, and local civic services.",
    headName: "Smt. Rekha Menon",
    contactEmail: "lsgd@example.gov.in",
    contactPhone: "0471-251 8600",
  },
  {
    code: "TRANS",
    name: "Transport Department",
    shortName: "Transport",
    description:
      "Public buses, driving licences, vehicle registration and road safety.",
    headName: "Shri V. Suresh Kumar",
    contactEmail: "transport@example.gov.in",
    contactPhone: "0471-251 8700",
  },
  {
    code: "AGRI",
    name: "Agriculture Department",
    shortName: "Agriculture",
    description:
      "Farmer support, crop protection, irrigation assistance and agricultural markets.",
    headName: "Dr. Jose Thomas",
    contactEmail: "agriculture@example.gov.in",
    contactPhone: "0471-251 8800",
  },
  {
    code: "SWD",
    name: "Social Justice Department",
    shortName: "Social Justice",
    description:
      "Welfare pensions, disability support, anganwadis and care for vulnerable groups.",
    headName: "Smt. Fathima Rasheed",
    contactEmail: "socialjustice@example.gov.in",
    contactPhone: "0471-251 8900",
  },
  {
    code: "HOME",
    name: "Home Department",
    shortName: "Home & Safety",
    description:
      "Police services, public safety, cyber crime support and emergency response.",
    headName: "Shri M. Anoop",
    contactEmail: "home@example.gov.in",
    contactPhone: "0471-251 9000",
  },
] as const;

export const DEPARTMENT_BY_CODE = Object.fromEntries(
  DEPARTMENTS_SEED.map((d) => [d.code, d]),
) as Record<string, (typeof DEPARTMENTS_SEED)[number]>;

export const SLA_DAYS: Record<"LOW" | "MEDIUM" | "HIGH", number> = {
  HIGH: 3,
  MEDIUM: 7,
  LOW: 14,
};

export const STATUS_META: Record<
  string,
  { label: string; description: string; className: string; dot: string }
> = {
  SUBMITTED: {
    label: "Submitted",
    description: "Received by the portal and queued for CMO review.",
    className: "bg-sky-50 text-sky-800 ring-sky-200",
    dot: "bg-sky-500",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    description: "The CMO has opened the grievance and is reviewing it.",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    description: "Assigned to a department and under active investigation.",
    className: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  RESOLVED: {
    label: "Resolved",
    description: "The CMO has confirmed the department's action-taken report.",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  REOPENED: {
    label: "Reopened",
    description: "The resolution was not accepted and the case is open again.",
    className: "bg-rose-50 text-rose-800 ring-rose-200",
    dot: "bg-rose-500",
  },
};

export const PRIORITY_META: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  LOW: {
    label: "Low",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  HIGH: {
    label: "High",
    className: "bg-rose-50 text-rose-800 ring-rose-200",
    dot: "bg-rose-500",
  },
};

export const ROLE_META: Record<string, { label: string; home: string }> = {
  CITIZEN: { label: "Citizen", home: "/citizen" },
  CMO_ADMIN: { label: "CMO Administrator", home: "/cmo" },
  OFFICER: { label: "Department Officer", home: "/officer" },
};

export const DEMO_ACCOUNTS = [
  {
    role: "CMO Administrator",
    email: "cmo@kerala.demo",
    password: "Demo@CMO2026",
    home: "/cmo",
  },
  {
    role: "Department Officer (Health)",
    email: "health.officer@kerala.demo",
    password: "Demo@Officer2026",
    home: "/officer",
  },
  {
    role: "Department Officer (Public Works)",
    email: "pwd.officer@kerala.demo",
    password: "Demo@Officer2026",
    home: "/officer",
  },
  {
    role: "Citizen",
    email: "ananya@example.com",
    password: "Demo@Citizen2026",
    home: "/citizen",
  },
] as const;

export const OFFICER_PASSWORD = "Demo@Officer2026";
export const CITIZEN_PASSWORD = "Demo@Citizen2026";
export const CMO_PASSWORD = "Demo@CMO2026";

// Deterministic keyword tables used only by the labelled fallback analyser.
export const DEPARTMENT_KEYWORDS: Record<string, string[]> = {
  PWD: [
    "road", "pothole", "bridge", "street light", "streetlight", "footpath", "building",
    "culvert", "drainage cover", "highway", "tarring", "pavement", "signal",
  ],
  HEALTH: [
    "hospital", "doctor", "nurse", "medicine", "ambulance", "health", "phc",
    "clinic", "dengue", "fever", "outbreak", "vaccine", "surgery", "medical",
  ],
  EDU: [
    "school", "teacher", "student", "education", "classroom", "scholarship",
    "textbook", "exam", "college", "hostel", "midday meal",
  ],
  KWA: [
    "water", "pipe", "pipeline", "tank", "drinking water", "borewell", "kwa",
    "water supply", "contaminated", "well",
  ],
  KSEB: [
    "electricity", "power", "transformer", "kseb", "outage", "street lamp",
    "meter", "voltage", "wire", "shock", "electric pole",
  ],
  REV: [
    "land", "revenue", "pattayam", "survey", "certificate", "encroachment",
    "taluk", "village office", "disaster relief", "property",
  ],
  LSGD: [
    "garbage", "waste", "sanitation", "toilet", "mosquito", "sewage", "drain",
    "panchayat", "municipality", "street cleaning", "stray dog",
  ],
  TRANS: [
    "bus", "transport", "licence", "license", "vehicle", "auto", "ksrtc",
    "route", "permit", "road safety",
  ],
  AGRI: [
    "farmer", "crop", "agriculture", "paddy", "fertilizer", "irrigation",
    "harvest", "livestock", "plantation",
  ],
  SWD: [
    "pension", "disability", "welfare", "anganwadi", "orphan", "elderly",
    "ration card", "social security", "widow",
  ],
  HOME: [
    "police", "theft", "cyber", "crime", "safety", "harassment", "violence",
    "traffic", "missing",
  ],
};

export const DEPARTMENT_DEFAULT_CATEGORY: Record<string, Category> = {
  PWD: "Roads & Infrastructure",
  HEALTH: "Healthcare",
  EDU: "Education",
  KWA: "Water Supply",
  KSEB: "Electricity",
  REV: "Revenue & Land",
  LSGD: "Sanitation & Waste",
  TRANS: "Transport",
  AGRI: "Agriculture",
  SWD: "Social Welfare",
  HOME: "Public Safety",
};

export const HIGH_PRIORITY_SIGNALS = [
  "urgent", "emergency", "immediately", "danger", "dangerous", "collapse",
  "collapsed", "accident", "death", "died", "electrocution", "fire", "flood",
  "outbreak", "contaminated", "hospital", "critical", "life", "safety risk",
  "children", "school bus", "sinkhole", "caved in",
];

export const LOW_PRIORITY_SIGNALS = [
  "suggestion", "request", "minor", "convenience", "when possible", "information",
  "query", "feedback", "improvement",
];

export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];
