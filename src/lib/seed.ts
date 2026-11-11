import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import {
  CITIZEN_PASSWORD,
  CMO_PASSWORD,
  DEPARTMENTS_SEED,
  DEPARTMENT_BY_CODE,
  OFFICER_PASSWORD,
  SLA_DAYS,
} from "./constants";

type SeedRecord = {
  ref: string;
  citizen: "ananya" | "rahul" | "fatima" | "arjun";
  district: string;
  category: string;
  subject: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "SUBMITTED" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REOPENED";
  deptCode?: string;
  createdDaysAgo: number;
  createdHour: number;
  ai?: {
    deptCode: string;
    category: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    confidence: number;
    summary: string;
    adopted: boolean;
    duplicates?: { referenceNo: string; subject: string; score: number }[];
  };
  reviewedHoursAfter?: number;
  assignedHoursAfter?: number;
  progressHoursAfter?: number;
  publicRemark?: { hoursAfter: number; note: string };
  internalRemark?: { hoursAfter: number; note: string };
  escalation?: { hoursAfter: number; note: string };
  resolutionHoursAfter?: number;
  resolutionReport?: string;
  resolvedHoursAfter?: number;
  reopenedHoursAfter?: number;
  reopenReason?: string;
  assignmentNote?: string;
  feedback?: { rating: number; comments: string; hoursAfter: number };
  attachment?: { filename: string; title: string; lines: string[] };
};

const OFFICERS: { code: string; name: string; designation: string }[] = [
  { code: "PWD", name: "Er. Vinod Thomas", designation: "Executive Engineer (Roads)" },
  { code: "HEALTH", name: "Dr. Sandhya Pillai", designation: "District Medical Officer" },
  { code: "EDU", name: "Smt. Bindu Raj", designation: "District Education Officer" },
  { code: "KWA", name: "Er. Prakash Nair", designation: "Assistant Executive Engineer" },
  { code: "KSEB", name: "Er. Shibu Jacob", designation: "Assistant Engineer (Distribution)" },
  { code: "REV", name: "Shri. Mohan Kumar", designation: "Tahsildar" },
  { code: "LSGD", name: "Smt. Deepa Suresh", designation: "Municipal Health Officer" },
  { code: "TRANS", name: "Shri. Jithin Raj", designation: "Motor Vehicles Inspector" },
  { code: "AGRI", name: "Dr. Anitha George", designation: "Principal Agricultural Officer" },
  { code: "SWD", name: "Smt. Lissy Mathew", designation: "District Social Justice Officer" },
  { code: "HOME", name: "Shri. Niyas Ahmed", designation: "Deputy Superintendent of Police" },
];

const CITIZENS = [
  { slug: "ananya", name: "Ananya Nair", email: "ananya@example.com", mobile: "9847012345" },
  { slug: "rahul", name: "Rahul Menon", email: "rahul@example.com", mobile: "9847023456" },
  { slug: "fatima", name: "Fatima Beevi", email: "fatima@example.com", mobile: "9847034567" },
  { slug: "arjun", name: "Arjun Das", email: "arjun@example.com", mobile: "9847045678" },
] as const;

export const SEED_RECORDS: SeedRecord[] = [
  {
    ref: "KLG-2026-7K2M9P",
    citizen: "ananya",
    district: "Thiruvananthapuram",
    category: "Roads & Infrastructure",
    subject: "Deep pothole near Kazhakkoottam junction is causing accidents",
    description:
      "A deep pothole has formed on the main road near Kazhakkoottam junction, close to the bus stop. Two-wheelers have skidded here in the past week and an ambulance had to slow down dangerously last night. The hole fills with rainwater and is invisible after dark. Local residents have marked it with branches, but a permanent repair is needed urgently.",
    priority: "HIGH",
    status: "SUBMITTED",
    createdDaysAgo: 1,
    createdHour: 8,
    ai: {
      deptCode: "PWD",
      category: "Roads & Infrastructure",
      priority: "HIGH",
      confidence: 0.84,
      summary:
        "Residents report a deep pothole at Kazhakkoottam junction that has caused two-wheeler skids and forced an ambulance to slow down. The hazard is hidden by rainwater after dark.",
      adopted: true,
    },
    attachment: {
      filename: "pothole-site-note.pdf",
      title: "Supporting note - pothole at Kazhakkoottam",
      lines: [
        "Location: Main road near Kazhakkoottam bus stop, Thiruvananthapuram.",
        "Observed: Deep pothole, approximately 3 feet wide, filled with rainwater.",
        "Risk: Two-wheelers skidding; ambulance movement obstructed at night.",
        "Reported by: Ananya Nair (citizen account).",
        "This document is sample data prepared for this portal.",
      ],
    },
  },
  {
    ref: "KLG-2026-4R8T2N",
    citizen: "rahul",
    district: "Ernakulam",
    category: "Water Supply",
    subject: "Salty drinking water in Kalamassery ward 12 for two weeks",
    description:
      "For the last two weeks, tap water in Kalamassery ward 12 has a strong salty taste and leaves white deposits on utensils. Several families have stopped using it for drinking. Elderly residents with blood pressure issues are particularly worried. We reported it to the local office twice but no inspection has happened. Please test the supply and arrange safe drinking water.",
    priority: "HIGH",
    status: "UNDER_REVIEW",
    createdDaysAgo: 4,
    createdHour: 9,
    reviewedHoursAfter: 5,
    internalRemark: {
      hoursAfter: 50,
      note: "Case is past its 3-day SLA. Water quality testing needs to be prioritised before assigning.",
    },
    ai: {
      deptCode: "KWA",
      category: "Water Supply",
      priority: "HIGH",
      confidence: 0.81,
      summary:
        "Households in Kalamassery ward 12 report salty tap water and white deposits for two weeks. Residents have stopped drinking the supply and request water quality testing.",
      adopted: true,
    },
    attachment: {
      filename: "water-quality-note.pdf",
      title: "Water quality complaint note",
      lines: [
        "Ward: Kalamassery ward 12, Ernakulam.",
        "Issue: Salty taste and white residue reported for approximately two weeks.",
        "Affected: Multiple households; elderly residents with hypertension are concerned.",
        "Requested action: Test the distribution line and arrange safe drinking water.",
        "This document is sample data prepared for this portal.",
      ],
    },
  },
  {
    ref: "KLG-2026-9W3H6J",
    citizen: "fatima",
    district: "Kozhikode",
    category: "Healthcare",
    subject: "Only one doctor at PHC; patients waiting for hours",
    description:
      "The primary health centre at Kunnamangalam has had only one doctor for the past month. Patients start queuing by 7 am and many return without being examined. Pregnant women and elderly patients are the worst affected. The pharmacy also runs out of basic medicines by noon. We request a temporary second doctor and a regular medicine supply.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    deptCode: "HEALTH",
    createdDaysAgo: 6,
    createdHour: 7,
    reviewedHoursAfter: 5,
    assignedHoursAfter: 7,
    progressHoursAfter: 50,
    publicRemark: {
      hoursAfter: 70,
      note: "A medical officer from the taluk hospital will attend this PHC on Tuesdays and Fridays starting this week. A medicine stock request has been forwarded to the district drug warehouse.",
    },
    assignmentNote: "Forwarded to Health & Family Welfare for review of staffing and medicine supply.",
    ai: {
      deptCode: "HEALTH",
      category: "Healthcare",
      priority: "MEDIUM",
      confidence: 0.76,
      summary:
        "The Kunnamangalam PHC has operated with one doctor for a month, causing long queues and leaving patients unexamined. Basic medicines run out by noon.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-2F7L5D",
    citizen: "arjun",
    district: "Thrissur",
    category: "Education",
    subject: "Government school science lab lacks equipment",
    description:
      "The higher secondary school in Ollur has a science lab room but almost no working equipment. Students preparing for the practical examination are sharing two microscopes and there are no functional lab reagents. Teachers are using videos instead of experiments. Around 180 students will be affected in the upcoming board practicals. Please supply basic apparatus and reagents.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    deptCode: "EDU",
    createdDaysAgo: 5,
    createdHour: 10,
    reviewedHoursAfter: 4,
    assignedHoursAfter: 6,
    progressHoursAfter: 48,
    assignmentNote: "Forwarded to General Education for lab equipment assessment.",
    ai: {
      deptCode: "EDU",
      category: "Education",
      priority: "MEDIUM",
      confidence: 0.7,
      summary:
        "Around 180 students at a higher secondary school in Ollur face practical exams with two microscopes and no lab reagents. Teachers are substituting videos for experiments.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-6B1X8C",
    citizen: "ananya",
    district: "Palakkad",
    category: "Electricity",
    subject: "Transformer failure leaves village without power for three days",
    description:
      "The transformer serving our village near Ottapalam failed three days ago after a loud explosion. Around 60 houses and a small health sub-centre have had no power since then. Food in refrigerators has spoiled and the sub-centre cannot run its vaccine refrigerator. We have called the section office repeatedly but no repair team has arrived. Please restore supply on an emergency basis.",
    priority: "HIGH",
    status: "RESOLVED",
    deptCode: "KSEB",
    createdDaysAgo: 20,
    createdHour: 9,
    reviewedHoursAfter: 3,
    assignedHoursAfter: 5,
    progressHoursAfter: 24,
    resolutionHoursAfter: 96,
    resolvedHoursAfter: 120,
    resolutionReport:
      "A damaged 100 kVA transformer was replaced with a spare unit. Supply was restored to all 62 connections the same evening. The section office has been instructed to inspect the feeder monthly.",
    assignmentNote: "Emergency forwarding to KSEB distribution section, Ottapalam.",
    ai: {
      deptCode: "KSEB",
      category: "Electricity",
      priority: "HIGH",
      confidence: 0.85,
      summary:
        "A transformer failure near Ottapalam has cut power to about 60 homes and a health sub-centre for three days, affecting vaccine storage and food.",
      adopted: true,
    },
    feedback: {
      rating: 5,
      comments: "Power was restored the same evening after the report. Thank you for the quick follow-up.",
      hoursAfter: 144,
    },
  },
  {
    ref: "KLG-2026-3N5V7Q",
    citizen: "fatima",
    district: "Alappuzha",
    category: "Sanitation & Waste",
    subject: "Garbage not collected near market for ten days",
    description:
      "Garbage has not been collected from the market area in Alappuzha for the last ten days. Waste is piling up near the vegetable stalls and stray dogs are scattering it across the road. The smell is unbearable in the afternoon and shopkeepers have complained of flies. There is a risk of dengue if this continues. Please arrange collection and clean the bins.",
    priority: "MEDIUM",
    status: "RESOLVED",
    deptCode: "LSGD",
    createdDaysAgo: 18,
    createdHour: 8,
    reviewedHoursAfter: 4,
    assignedHoursAfter: 6,
    progressHoursAfter: 24,
    resolutionHoursAfter: 168,
    resolvedHoursAfter: 216,
    resolutionReport:
      "The municipality deployed an additional collection vehicle. Accumulated waste was cleared and the bins were disinfected. A daily 7 am collection schedule has been restored for the market ward.",
    assignmentNote: "Forwarded to the municipality for urgent waste clearance.",
    ai: {
      deptCode: "LSGD",
      category: "Sanitation & Waste",
      priority: "MEDIUM",
      confidence: 0.78,
      summary:
        "Market-area waste in Alappuzha has gone uncollected for ten days, attracting stray dogs and flies and raising a dengue risk. Shopkeepers request immediate clearance.",
      adopted: true,
    },
    feedback: {
      rating: 4,
      comments: "Waste was cleared after the follow-up. Regular collection has resumed this week, though one day was missed.",
      hoursAfter: 240,
    },
  },
  {
    ref: "KLG-2026-8D4S2K",
    citizen: "rahul",
    district: "Kannur",
    category: "Transport",
    subject: "Private bus skips stops and overcharges passengers",
    description:
      "A private bus operating on the Kannur-Thalassery route regularly skips the Cherukunnu stop during peak hours and charges more than the displayed fare. When passengers object, the conductor asks them to get off. School students and daily commuters are affected. The bus number is KL-13-AB-1234. Please verify the fare board and take action.",
    priority: "LOW",
    status: "REOPENED",
    deptCode: "TRANS",
    createdDaysAgo: 25,
    createdHour: 11,
    reviewedHoursAfter: 3,
    assignedHoursAfter: 5,
    progressHoursAfter: 24,
    resolutionHoursAfter: 264,
    resolvedHoursAfter: 288,
    reopenedHoursAfter: 360,
    reopenReason:
      "The same bus skipped our stop again yesterday morning and is still charging extra. The warning has not changed anything. Please inspect the bus on the route.",
    resolutionReport:
      "The operator was summoned to the RTO office and warned in writing. The fare board was verified and the conductor instructed to follow approved stops.",
    assignmentNote: "Forwarded to the Motor Vehicles Department for route inspection.",
    ai: {
      deptCode: "TRANS",
      category: "Transport",
      priority: "LOW",
      confidence: 0.68,
      summary:
        "A private bus on the Kannur-Thalassery route reportedly skips the Cherukunnu stop and overcharges. Passengers request fare and stop verification.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-5G9M3T",
    citizen: "ananya",
    district: "Malappuram",
    category: "Social Welfare",
    subject: "Widow pension pending for six months",
    description:
      "My mother, a widow aged 68, has not received her social security pension for the last six months. The bank account is active and the last payment was in April. The village office says the file has moved to the block office, where no one is able to confirm the status. She depends on this pension for medicines. Please trace the application and release the pending amount.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    deptCode: "SWD",
    createdDaysAgo: 8,
    createdHour: 9,
    reviewedHoursAfter: 4,
    assignedHoursAfter: 5,
    progressHoursAfter: 48,
    publicRemark: {
      hoursAfter: 72,
      note: "The pension file has been located at the block office. A verification visit is scheduled this week.",
    },
    escalation: {
      hoursAfter: 96,
      note: "Case is past its 3-day SLA and involves a vulnerable pensioner. Escalated to the District Social Justice Officer.",
    },
    assignmentNote: "Forwarded to the Social Justice Department for pension file trace.",
    ai: {
      deptCode: "SWD",
      category: "Social Welfare",
      priority: "HIGH",
      confidence: 0.72,
      summary:
        "A 68-year-old widow has not received her pension for six months. The file is reportedly at the block office and the family depends on the amount for medicines.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-1Q6Y4H",
    citizen: "fatima",
    district: "Kollam",
    category: "Public Safety",
    subject: "Street lights near women's hostel not working",
    description:
      "All six street lights on the road leading to the women's hostel in Asramam have been off for more than a week. The road is very dark after 7 pm and residents are afraid to walk back from the bus stop. There have been reports of suspicious activity near the compound wall. Please repair the lights urgently.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    deptCode: "KSEB",
    createdDaysAgo: 2,
    createdHour: 8,
    reviewedHoursAfter: 4,
    assignedHoursAfter: 6,
    progressHoursAfter: 24,
    assignmentNote: "Forwarded to KSEB for street light repair near Asramam.",
    ai: {
      deptCode: "KSEB",
      category: "Public Safety",
      priority: "HIGH",
      confidence: 0.8,
      summary:
        "Six street lights near a women's hostel in Asramam have been off for over a week, leaving the approach road dark and raising safety concerns for residents.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-7A2C9R",
    citizen: "arjun",
    district: "Pathanamthitta",
    category: "Revenue & Land",
    subject: "Property survey pending for eight months",
    description:
      "We applied for a resurvey of our ancestral property in Kozhencherry in February. The application number is SR/2026/1187. Despite several visits to the taluk survey office, no surveyor has been assigned. The delay is blocking a family partition. Please provide a timeline for the survey or assign an officer.",
    priority: "MEDIUM",
    status: "UNDER_REVIEW",
    deptCode: undefined,
    createdDaysAgo: 3,
    createdHour: 10,
    reviewedHoursAfter: 24,
    ai: {
      deptCode: "REV",
      category: "Revenue & Land",
      priority: "MEDIUM",
      confidence: 0.66,
      summary:
        "A resurvey application from Kozhencherry has been pending for eight months despite repeated visits. The delay is blocking a family property partition.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-3Z8W5B",
    citizen: "rahul",
    district: "Kottayam",
    category: "Agriculture",
    subject: "Paddy crop damage compensation not received",
    description:
      "Our paddy fields in Vaikom were flooded during the recent rains and about two acres of crop were destroyed. We submitted the damage report with photographs to the Krishi Bhavan on 20 October. Other farmers in the area have received partial compensation, but our application is still pending. Please verify the report and process the compensation.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    deptCode: "AGRI",
    createdDaysAgo: 12,
    createdHour: 9,
    reviewedHoursAfter: 5,
    assignedHoursAfter: 8,
    progressHoursAfter: 48,
    internalRemark: {
      hoursAfter: 72,
      note: "Field report received from Krishi Bhavan; awaiting revenue endorsement before compensation release.",
    },
    assignmentNote: "Forwarded to the Agriculture Department for field verification.",
    ai: {
      deptCode: "AGRI",
      category: "Agriculture",
      priority: "MEDIUM",
      confidence: 0.71,
      summary:
        "Two acres of paddy in Vaikom were destroyed by flooding. A damage report was submitted to the Krishi Bhavan, but compensation remains pending while other farmers have received partial payment.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-9C4N6F",
    citizen: "ananya",
    district: "Idukki",
    category: "Roads & Infrastructure",
    subject: "Landslide debris blocking village road",
    description:
      "A small landslide near Adimali has blocked the only road connecting three wards. Debris and a fallen tree are covering the full width of the road, and around 40 families are unable to reach the town. An ambulance had to take a 12 km detour yesterday. Please clear the road and inspect the slope before the next rain.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    deptCode: "PWD",
    createdDaysAgo: 2,
    createdHour: 7,
    reviewedHoursAfter: 3,
    assignedHoursAfter: 4,
    progressHoursAfter: 18,
    publicRemark: {
      hoursAfter: 20,
      note: "A JCB and clearance team have been mobilised. The road will be partially opened today and fully cleared within 24 hours.",
    },
    assignmentNote: "Emergency forwarding to the PWD roads section, Adimali.",
    ai: {
      deptCode: "PWD",
      category: "Roads & Infrastructure",
      priority: "HIGH",
      confidence: 0.82,
      summary:
        "Landslide debris and a fallen tree have blocked the only road serving three wards near Adimali. About 40 families are cut off and an ambulance was forced to detour 12 km.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-6H7B3M",
    citizen: "fatima",
    district: "Wayanad",
    category: "Healthcare",
    subject: "No night ambulance service at community health centre",
    description:
      "The community health centre at Mananthavady has no ambulance available at night. Last week a patient with chest pain had to arrange a private vehicle to reach the district hospital, which took over an hour. The staff say the vehicle is under repair but this has been the situation for a month. Please arrange an alternate ambulance for night duty.",
    priority: "HIGH",
    status: "RESOLVED",
    deptCode: "HEALTH",
    createdDaysAgo: 30,
    createdHour: 8,
    reviewedHoursAfter: 3,
    assignedHoursAfter: 5,
    progressHoursAfter: 24,
    resolutionHoursAfter: 72,
    resolvedHoursAfter: 96,
    resolutionReport:
      "A spare ambulance from the district pool has been stationed at the CHC from 8 pm to 8 am. The damaged vehicle has been sent for repair. The medical officer will confirm availability in the night shift register.",
    assignmentNote: "Forwarded to Health & Family Welfare as a patient-safety priority.",
    ai: {
      deptCode: "HEALTH",
      category: "Healthcare",
      priority: "HIGH",
      confidence: 0.83,
      summary:
        "A Wayanad community health centre has no night ambulance, forcing a chest-pain patient to travel by private vehicle for over an hour. An alternate night vehicle is requested.",
      adopted: true,
    },
    feedback: {
      rating: 5,
      comments: "An ambulance was available within two days. My father was taken to hospital quickly last week.",
      hoursAfter: 120,
    },
  },
  {
    ref: "KLG-2026-2K5D8X",
    citizen: "arjun",
    district: "Kasaragod",
    category: "Education",
    subject: "Classrooms leak during monsoon",
    description:
      "Two classrooms in the government upper primary school at Udma leak badly during rain. The roof has visible cracks and water drips onto the benches, so classes are shifted to the veranda. Electrical fittings near the wall are also exposed. Parents have submitted a written complaint to the head teacher. Please repair the roof before the next spell of rain.",
    priority: "MEDIUM",
    status: "UNDER_REVIEW",
    createdDaysAgo: 5,
    createdHour: 9,
    reviewedHoursAfter: 24,
    internalRemark: {
      hoursAfter: 48,
      note: "Education department to confirm whether the roof work falls under PWD or the local body.",
    },
    ai: {
      deptCode: "EDU",
      category: "Education",
      priority: "MEDIUM",
      confidence: 0.69,
      summary:
        "Two classrooms at a government school in Udma leak during rain, with exposed electrical fittings near the wall. Parents request roof repair before the next monsoon spell.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-8T1Q7L",
    citizen: "rahul",
    district: "Thiruvananthapuram",
    category: "Water Supply",
    subject: "Pipeline leak wasting drinking water",
    description:
      "A drinking water pipeline near Sasthamangalam junction has been leaking continuously for several days. A large quantity of water is flowing onto the road and the footpath has started to sink. Residents have informed the valve office but no repair has been done. Please fix the leak and check the surrounding pipeline.",
    priority: "LOW",
    status: "RESOLVED",
    deptCode: "KWA",
    createdDaysAgo: 40,
    createdHour: 10,
    reviewedHoursAfter: 4,
    assignedHoursAfter: 6,
    progressHoursAfter: 24,
    resolutionHoursAfter: 72,
    resolvedHoursAfter: 96,
    resolutionReport:
      "The leaking joint on the 150 mm distribution line was replaced. Road restoration was completed after the repair.",
    assignmentNote: "Forwarded to Kerala Water Authority for leak repair.",
    ai: {
      deptCode: "KWA",
      category: "Water Supply",
      priority: "LOW",
      confidence: 0.62,
      summary:
        "A drinking water pipeline near Sasthamangalam junction has leaked for several days, wasting water and causing the footpath to sink. A repair is requested.",
      adopted: true,
    },
  },
  {
    ref: "KLG-2026-4S9F2P",
    citizen: "fatima",
    district: "Ernakulam",
    category: "Other",
    subject: "Request for public toilet near bus stand",
    description:
      "There is no public toilet near the Ernakulam KSRTC bus stand on the eastern side. Passengers, especially women and elderly people, have to walk a long distance or pay at private establishments. We request the corporation to construct or designate a clean public toilet with water and lighting. This would benefit thousands of daily commuters.",
    priority: "LOW",
    status: "SUBMITTED",
    createdDaysAgo: 0,
    createdHour: 9,
    ai: {
      deptCode: "LSGD",
      category: "Other",
      priority: "LOW",
      confidence: 0.58,
      summary:
        "A citizen requests a public toilet near the eastern side of Ernakulam KSRTC bus stand, citing difficulties for women and elderly commuters.",
      adopted: false,
    },
  },
  {
    ref: "KLG-2026-5M3R8T",
    citizen: "ananya",
    district: "Ernakulam",
    category: "Water Supply",
    subject: "Salty water from taps in Kalamassery ward 12",
    description:
      "For the last two weeks, tap water in Kalamassery ward 12 has a strong salty taste and leaves white deposits on utensils. Several families have stopped using it for drinking. Elderly residents with blood pressure issues are particularly worried. We reported it to the local office twice but no inspection has happened. Please test the supply and arrange safe drinking water.",
    priority: "HIGH",
    status: "SUBMITTED",
    createdDaysAgo: 0,
    createdHour: 7,
    ai: {
      deptCode: "KWA",
      category: "Water Supply",
      priority: "HIGH",
      confidence: 0.8,
      summary:
        "A second household in Kalamassery ward 12 reports salty tap water and white deposits for two weeks, requesting testing and safe drinking water.",
      adopted: true,
      duplicates: [
        {
          referenceNo: "KLG-2026-4R8T2N",
          subject: "Salty drinking water in Kalamassery ward 12 for two weeks",
          score: 0.86,
        },
      ],
    },
  },
];

const ENQUIRIES = [
  {
    name: "Meera Suresh",
    email: "meera.suresh@example.com",
    subject: "Clarification on grievance categories",
    message:
      "I want to report an issue with a damaged footpath. Should I select Roads & Infrastructure or Sanitation & Waste? Please clarify.",
    status: "NEW" as const,
    daysAgo: 1,
  },
  {
    name: "Joseph K. Mathew",
    email: "joseph.km@example.com",
    subject: "Accessibility of the portal",
    message:
      "The portal is easy to use on my phone. It would help if the status page could be opened without logging in. Thank you.",
    status: "READ" as const,
    daysAgo: 4,
  },
  {
    name: "Sneha R.",
    email: "sneha.r@example.com",
    subject: "Media enquiry about the portal",
    message:
      "Could you share more information about the scope of this portal? I would like to understand how enquiries are handled.",
    status: "RESPONDED" as const,
    daysAgo: 8,
  },
];

function makeCuid(slug: string): string {
  const base = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `c${base}`.padEnd(25, "0").slice(0, 25);
}

function daysAgoDate(days: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() > Date.now()) date.setTime(Date.now() - 60 * 60 * 1000);
  return date;
}

function after(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function wrap(text: string, width = 88): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > width) {
      if (line) lines.push(line.trim());
      line = word;
    } else {
      line += ` ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function escapePdf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildDemoPdf(title: string, body: string[]): Buffer {
  const lines: string[] = [title, ""];
  for (const entry of body) {
    lines.push(...wrap(entry));
    lines.push("");
  }
  let content = "BT /F1 16 Tf 50 780 Td (" + escapePdf(lines[0]) + ") Tj ET\n";
  let y = 750;
  for (const line of lines.slice(1)) {
    if (y < 60) break;
    content += `BT /F1 11 Tf 50 ${y} Td (${escapePdf(line)}) Tj ET\n`;
    y -= 17;
  }
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

export type SeedResult = {
  seeded: boolean;
  departments: number;
  users: number;
  grievances: number;
  message: string;
};

export async function runSeed(prisma: PrismaClient, force = false): Promise<SeedResult> {
  const existing = await prisma.grievance.count();
  if (existing > 0 && !force) {
    return {
      seeded: false,
      departments: await prisma.department.count(),
      users: await prisma.user.count(),
      grievances: existing,
      message: "Demo data already present. Seed skipped.",
    };
  }

  const passwordHashes = await Promise.all(
    Array.from({ length: 3 }, (_, index) => {
      const password = [CMO_PASSWORD, OFFICER_PASSWORD, CITIZEN_PASSWORD][index];
      return bcrypt.hash(password, 10);
    }),
  );
  const [cmoHash, officerHash, citizenHash] = passwordHashes;

  const departmentIds = new Map<string, string>();
  for (const department of DEPARTMENTS_SEED) {
    const record = await prisma.department.upsert({
      where: { code: department.code },
      update: {
        name: department.name,
        description: department.description,
        headName: department.headName,
        contactEmail: department.contactEmail,
        contactPhone: department.contactPhone,
      },
      create: {
        id: makeCuid(`dept-${department.code}`),
        code: department.code,
        name: department.name,
        description: department.description,
        headName: department.headName,
        contactEmail: department.contactEmail,
        contactPhone: department.contactPhone,
      },
    });
    departmentIds.set(department.code, record.id);
  }

  const cmoId = makeCuid("cmo-admin");
  await prisma.user.upsert({
    where: { email: "cmo@kerala.demo" },
    update: { name: "S. Harish", role: "CMO_ADMIN", designation: "Special Officer, Chief Minister's Office" },
    create: {
      id: cmoId,
      name: "S. Harish",
      email: "cmo@kerala.demo",
      mobile: "9847000001",
      passwordHash: cmoHash,
      role: "CMO_ADMIN",
      designation: "Special Officer, Chief Minister's Office",
    },
  });

  const officerIds = new Map<string, string>();
  for (const officer of OFFICERS) {
    const user = await prisma.user.upsert({
      where: { email: `${officer.code.toLowerCase()}.officer@kerala.demo` },
      update: {
        name: officer.name,
        role: "OFFICER",
        designation: officer.designation,
        departmentId: departmentIds.get(officer.code),
      },
      create: {
        id: makeCuid(`officer-${officer.code}`),
        name: officer.name,
        email: `${officer.code.toLowerCase()}.officer@kerala.demo`,
        mobile: `9847100${String(OFFICERS.indexOf(officer) + 1).padStart(3, "0")}`,
        passwordHash: officerHash,
        role: "OFFICER",
        designation: officer.designation,
        departmentId: departmentIds.get(officer.code),
      },
    });
    officerIds.set(officer.code, user.id);
  }

  const citizenIds = new Map<string, string>();
  for (const citizen of CITIZENS) {
    const user = await prisma.user.upsert({
      where: { email: citizen.email },
      update: { name: citizen.name, mobile: citizen.mobile },
      create: {
        id: makeCuid(`citizen-${citizen.slug}`),
        name: citizen.name,
        email: citizen.email,
        mobile: citizen.mobile,
        passwordHash: citizenHash,
        role: "CITIZEN",
      },
    });
    citizenIds.set(citizen.slug, user.id);
  }

  let createdCount = 0;
  for (const record of SEED_RECORDS) {
    const exists = await prisma.grievance.findUnique({ where: { referenceNo: record.ref } });
    if (exists) continue;

    const citizenId = citizenIds.get(record.citizen)!;
    const citizenName = CITIZENS.find((citizen) => citizen.slug === record.citizen)!.name;
    const department = record.deptCode ? DEPARTMENT_BY_CODE[record.deptCode] : undefined;
    const departmentId = record.deptCode ? departmentIds.get(record.deptCode) : undefined;
    const officerId = record.deptCode ? officerIds.get(record.deptCode) : undefined;
    const officerName = record.deptCode
      ? OFFICERS.find((officer) => officer.code === record.deptCode)?.name ?? "Department Officer"
      : null;

    const createdAt = daysAgoDate(record.createdDaysAgo, record.createdHour);
    const dueAt = after(createdAt, SLA_DAYS[record.priority] * 24);
    const reviewedAt = record.reviewedHoursAfter ? after(createdAt, record.reviewedHoursAfter) : null;
    const assignedAt = record.assignedHoursAfter ? after(createdAt, record.assignedHoursAfter) : null;
    const progressAt = record.progressHoursAfter ? after(createdAt, record.progressHoursAfter) : null;
    const resolutionAt = record.resolutionHoursAfter
      ? after(createdAt, record.resolutionHoursAfter)
      : null;
    const resolvedAt = record.resolvedHoursAfter ? after(createdAt, record.resolvedHoursAfter) : null;
    const reopenedAt = record.reopenedHoursAfter ? after(createdAt, record.reopenedHoursAfter) : null;
    const aiDepartment = record.ai ? DEPARTMENT_BY_CODE[record.ai.deptCode] : undefined;

    const grievanceId = makeCuid(`grievance-${record.ref}`);
    await prisma.grievance.create({
      data: {
        id: grievanceId,
        referenceNo: record.ref,
        citizenId,
        departmentId: departmentId ?? null,
        assignedOfficerId: officerId ?? null,
        district: record.district,
        category: record.category,
        subject: record.subject,
        description: record.description,
        priority: record.priority,
        status: record.status,
        slaDays: SLA_DAYS[record.priority],
        dueAt,
        escalationLevel: record.escalation ? 1 : 0,
        resolutionReport: record.resolutionReport ?? null,
        resolutionSubmittedAt: resolutionAt,
        cmoApprovedAt: record.status === "RESOLVED" ? resolvedAt : null,
        resolvedAt: record.status === "RESOLVED" ? resolvedAt : null,
        reopenedAt: record.status === "REOPENED" ? reopenedAt : null,
        reopenReason: record.status === "REOPENED" ? record.reopenReason : null,
        aiSummary: record.ai?.summary ?? null,
        aiSuggestedCategory: record.ai?.category ?? null,
        aiSuggestedDepartment: aiDepartment?.name ?? null,
        aiSuggestedPriority: record.ai?.priority ?? null,
        aiConfidence: record.ai?.confidence ?? null,
        aiProvider: record.ai ? "fallback" : null,
        aiModel: null,
        aiDuplicateRefs: record.ai?.duplicates ?? undefined,
        aiAdopted: record.ai?.adopted ?? false,
        aiAnalyzedAt: record.ai ? after(createdAt, 0.1) : null,
        createdAt,
        updatedAt: resolvedAt ?? reopenedAt ?? progressAt ?? resolutionAt ?? assignedAt ?? reviewedAt ?? createdAt,
      },
    });

    type HistoryRow = {
      type: "CREATED" | "STATUS_CHANGE" | "ASSIGNMENT" | "REMARK" | "ESCALATION" | "RESOLUTION" | "AI_ANALYSIS" | "FEEDBACK" | "REOPEN";
      at: Date;
      title: string;
      note: string | null;
      status?: "SUBMITTED" | "UNDER_REVIEW" | "IN_PROGRESS" | "RESOLVED" | "REOPENED" | null;
      isInternal?: boolean;
      actorId: string | null;
      actorName: string;
      actorRole: "CITIZEN" | "CMO_ADMIN" | "OFFICER";
    };

    const events: HistoryRow[] = [
      {
        type: "CREATED",
        at: createdAt,
        title: "Grievance submitted",
        note: `Reference ${record.ref} generated and queued for CMO review.`,
        status: "SUBMITTED",
        actorId: citizenId,
        actorName: citizenName,
        actorRole: "CITIZEN",
      },
    ];

    if (record.ai) {
      events.push({
        type: "AI_ANALYSIS",
        at: after(createdAt, 0.1),
        title: "AI triage suggestion recorded",
        note: `Suggested ${aiDepartment?.name ?? "department"} · ${record.ai.priority} priority · ${Math.round(
          record.ai.confidence * 100,
        )}% confidence. Advisory only — reviewed by a human.`,
        isInternal: false,
        actorId: null,
        actorName: "AI Grievance Assistant",
        actorRole: "CITIZEN",
      });
    }

    if (reviewedAt) {
      events.push({
        type: "STATUS_CHANGE",
        at: reviewedAt,
        title: "Opened for CMO review",
        note: "The CMO office has started reviewing this grievance.",
        status: "UNDER_REVIEW",
        actorId: cmoId,
        actorName: "S. Harish",
        actorRole: "CMO_ADMIN",
      });
    }

    if (assignedAt && department) {
      events.push({
        type: "ASSIGNMENT",
        at: assignedAt,
        title: `Forwarded to ${department.name}`,
        note: record.assignmentNote ?? "Forwarded for departmental action.",
        actorId: cmoId,
        actorName: "S. Harish",
        actorRole: "CMO_ADMIN",
      });
      await prisma.assignment.create({
        data: {
          id: randomUUID(),
          grievanceId,
          departmentId: departmentId!,
          officerId: officerId ?? null,
          assignedById: cmoId,
          note: record.assignmentNote ?? "Forwarded for departmental action.",
          dueAt,
          status: record.status === "RESOLVED" ? "COMPLETED" : progressAt ? "ACKNOWLEDGED" : "ASSIGNED",
          acknowledgedAt: progressAt,
          completedAt: record.status === "RESOLVED" ? resolvedAt : null,
          createdAt: assignedAt,
        },
      });
    }

    if (progressAt) {
      events.push({
        type: "STATUS_CHANGE",
        at: progressAt,
        title: "Investigation started by department",
        note: "The assigned department has begun investigating this grievance.",
        status: "IN_PROGRESS",
        actorId: officerId ?? null,
        actorName: officerName ?? "Department Officer",
        actorRole: "OFFICER",
      });
    }

    if (record.publicRemark) {
      events.push({
        type: "REMARK",
        at: after(createdAt, record.publicRemark.hoursAfter),
        title: "Department update to citizen",
        note: record.publicRemark.note,
        actorId: officerId ?? null,
        actorName: officerName ?? "Department Officer",
        actorRole: "OFFICER",
      });
    }

    if (record.internalRemark) {
      events.push({
        type: "REMARK",
        at: after(createdAt, record.internalRemark.hoursAfter),
        title: "CMO internal note",
        note: record.internalRemark.note,
        isInternal: true,
        actorId: cmoId,
        actorName: "S. Harish",
        actorRole: "CMO_ADMIN",
      });
    }

    if (record.escalation) {
      events.push({
        type: "ESCALATION",
        at: after(createdAt, record.escalation.hoursAfter),
        title: "Grievance escalated to Level 1",
        note: record.escalation.note,
        isInternal: true,
        actorId: cmoId,
        actorName: "S. Harish",
        actorRole: "CMO_ADMIN",
      });
    }

    if (resolutionAt && record.resolutionReport) {
      events.push({
        type: "RESOLUTION",
        at: resolutionAt,
        title: "Action-taken report submitted",
        note: record.resolutionReport,
        actorId: officerId ?? null,
        actorName: officerName ?? "Department Officer",
        actorRole: "OFFICER",
      });
    }

    if (resolvedAt) {
      events.push({
        type: "STATUS_CHANGE",
        at: resolvedAt,
        title: "Resolution confirmed by CMO",
        note: "The CMO office reviewed the action-taken report and confirmed the resolution.",
        status: "RESOLVED",
        actorId: cmoId,
        actorName: "S. Harish",
        actorRole: "CMO_ADMIN",
      });
    }

    if (reopenedAt) {
      events.push({
        type: "REOPEN",
        at: reopenedAt,
        title: "Grievance reopened by citizen",
        note: record.reopenReason ?? "The citizen reported that the issue was not resolved.",
        status: "REOPENED",
        actorId: citizenId,
        actorName: citizenName,
        actorRole: "CITIZEN",
      });
    }

    if (record.feedback) {
      events.push({
        type: "FEEDBACK",
        at: after(createdAt, record.feedback.hoursAfter),
        title: "Citizen feedback received",
        note: `${record.feedback.rating}/5 — ${record.feedback.comments}`,
        isInternal: true,
        actorId: citizenId,
        actorName: citizenName,
        actorRole: "CITIZEN",
      });
    }

    events.sort((a, b) => a.at.getTime() - b.at.getTime());

    await prisma.grievanceHistory.createMany({
      data: events.map((event) => ({
        id: randomUUID(),
        grievanceId,
        type: event.type,
        status: event.status ?? null,
        title: event.title,
        note: event.note,
        isInternal: event.isInternal ?? false,
        actorId: event.actorId,
        actorName: event.actorName,
        actorRole: event.actorRole,
        createdAt: event.at,
      })),
    });

    if (record.feedback) {
      await prisma.citizenFeedback.create({
        data: {
          id: randomUUID(),
          grievanceId,
          citizenId,
          rating: record.feedback.rating,
          comments: record.feedback.comments,
          createdAt: after(createdAt, record.feedback.hoursAfter),
        },
      });
    }

    if (record.attachment) {
      const pdf = buildDemoPdf(record.attachment.title, [
        `Reference: ${record.ref}`,
        `District: ${record.district}`,
        `Category: ${record.category}`,
        "",
        ...record.attachment.lines,
        "",
        "Prepared for the CM Kerala Grievance Portal.",
      ]);
      await prisma.attachment.create({
        data: {
          id: randomUUID(),
          grievanceId,
          filename: record.attachment.filename,
          mimeType: "application/pdf",
          size: pdf.length,
          data: new Uint8Array(pdf),
          uploadedById: citizenId,
          createdAt: after(createdAt, 0.2),
        },
      });
    }

    createdCount += 1;
  }

  const enquiryCount = await prisma.contactEnquiry.count();
  if (enquiryCount === 0) {
    await prisma.contactEnquiry.createMany({
      data: ENQUIRIES.map((enquiry) => ({
        id: randomUUID(),
        name: enquiry.name,
        email: enquiry.email,
        subject: enquiry.subject,
        message: enquiry.message,
        status: enquiry.status,
        createdAt: daysAgoDate(enquiry.daysAgo, 11),
        updatedAt: daysAgoDate(enquiry.daysAgo, 11),
      })),
    });
  }

  return {
    seeded: true,
    departments: await prisma.department.count(),
    users: await prisma.user.count(),
    grievances: await prisma.grievance.count(),
    message: `Demo data ready: ${createdCount} new grievances, ${CITIZENS.length} citizens, ${OFFICERS.length} officers.`,
  };
}

let seedPromise: Promise<SeedResult> | null = null;

export function ensureSeeded(prisma: PrismaClient): Promise<SeedResult> {
  if (!seedPromise) {
    seedPromise = runSeed(prisma).finally(() => {
      seedPromise = null;
    });
  }
  return seedPromise;
}
