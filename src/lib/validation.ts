import { z } from "zod";
import { CATEGORIES, DISTRICTS, MAX_ATTACHMENT_BYTES } from "./constants";

const emailSchema = z
  .string()
  .trim()
  .min(5, "Enter a valid email address")
  .max(120)
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: emailSchema,
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(72),
});

export const grievanceSubmitSchema = z.object({
  district: z.enum(DISTRICTS),
  category: z.enum(CATEGORIES),
  subject: z.string().trim().min(6, "Subject must be at least 6 characters").max(120),
  description: z
    .string()
    .trim()
    .min(30, "Please describe the grievance in at least 30 characters")
    .max(4000, "Description must be under 4000 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  aiAdopted: z.boolean().default(false),
  aiSummary: z.string().trim().max(600).optional(),
  aiSuggestedCategory: z.enum(CATEGORIES).optional(),
  aiSuggestedDepartment: z.string().trim().max(80).optional(),
  aiSuggestedPriority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  aiProvider: z.string().trim().max(120).optional(),
  aiModel: z.string().trim().max(120).optional(),
  aiDuplicateRefs: z
    .array(
      z.object({
        referenceNo: z.string().trim().max(40),
        subject: z.string().trim().max(160),
        score: z.number().min(0).max(1),
      }),
    )
    .max(5)
    .optional(),
});

export const aiAnalyzeSchema = z.object({
  subject: z.string().trim().max(160).optional(),
  description: z
    .string()
    .trim()
    .min(20, "Add at least 20 characters so the assistant can analyse the complaint")
    .max(4000),
  district: z.enum(DISTRICTS).optional(),
  category: z.enum(CATEGORIES).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailSchema,
  subject: z.string().trim().min(4, "Enter a subject").max(120),
  message: z.string().trim().min(10, "Enter at least 10 characters").max(2000),
});

export const assignSchema = z.object({
  departmentId: z.string().cuid("Select a department"),
  officerId: z.string().cuid().optional().or(z.literal("")),
  note: z.string().trim().max(500).optional(),
  dueAt: z.string().datetime().optional().or(z.literal("")),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "REOPENED"]),
  note: z.string().trim().max(1000).optional(),
});

export const remarkSchema = z.object({
  note: z.string().trim().min(2, "Enter a remark").max(1000),
  visibleToCitizen: z.boolean().default(false),
});

export const escalateSchema = z.object({
  reason: z.string().trim().min(5, "Explain why this case is being escalated").max(500),
});

export const resolutionSchema = z.object({
  report: z
    .string()
    .trim()
    .min(20, "Describe the action taken in at least 20 characters")
    .max(4000),
});

export const reviewResolutionSchema = z.object({
  action: z.enum(["APPROVE", "REOPEN"]),
  note: z.string().trim().max(1000).optional(),
});

export const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comments: z.string().trim().max(1000).optional(),
});

export const reopenSchema = z.object({
  reason: z.string().trim().min(10, "Explain why the issue is not resolved").max(1000),
});

export const validateAttachment = (file: File | null): string | null => {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return "Attachment must be 4 MB or smaller";
  }
  return null;
};

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GrievanceSubmitInput = z.infer<typeof grievanceSubmitSchema>;
export type AiAnalyzeInput = z.infer<typeof aiAnalyzeSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
