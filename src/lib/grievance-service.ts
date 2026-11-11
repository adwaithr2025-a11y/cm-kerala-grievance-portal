import { Prisma } from "@prisma/client";
import type { GrievanceStatus, Priority } from "@prisma/client";
import { prisma } from "./db";
import { ApiError } from "./api";
import type { CurrentUser } from "./auth";
import { addDays, generateReferenceNo, isOverdue, truncate } from "./utils";
import { SLA_DAYS } from "./constants";

export const PAGE_SIZE = 8;

export type GrievanceFilters = {
  district?: string;
  category?: string;
  priority?: string;
  status?: string;
  departmentId?: string;
  q?: string;
  overdue?: string;
  view?: string;
  page?: string;
};

type ListActor = Pick<CurrentUser, "id" | "role" | "department">;

function baseWhereForActor(actor: ListActor): Prisma.GrievanceWhereInput {
  if (actor.role === "CMO_ADMIN") return {};
  if (actor.role === "OFFICER") {
    return { departmentId: actor.department?.id ?? "__none__" };
  }
  return { citizenId: actor.id };
}

export function buildGrievanceWhere(
  actor: ListActor,
  filters: GrievanceFilters,
): Prisma.GrievanceWhereInput {
  const where: Prisma.GrievanceWhereInput = { ...baseWhereForActor(actor) };

  if (filters.district) where.district = filters.district;
  if (filters.category) where.category = filters.category;
  if (filters.priority) where.priority = filters.priority as Priority;
  if (filters.status) where.status = filters.status as GrievanceStatus;
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.overdue === "1") {
    where.dueAt = { lt: new Date() };
    where.status = { not: "RESOLVED" };
  }
  if (filters.view === "awaiting") {
    where.resolutionSubmittedAt = { not: null };
    where.cmoApprovedAt = null;
    where.status = { not: "RESOLVED" };
  }
  if (filters.q) {
    const query = filters.q.trim();
    if (query) {
      where.OR = [
        { referenceNo: { contains: query, mode: "insensitive" } },
        { subject: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
  }
  return where;
}

export async function listGrievances(
  actor: ListActor,
  filters: GrievanceFilters,
) {
  const where = buildGrievanceWhere(actor, filters);
  const page = Math.max(Number.parseInt(filters.page ?? "1", 10) || 1, 1);
  const [total, grievances] = await Promise.all([
    prisma.grievance.count({ where }),
    prisma.grievance.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        department: { select: { id: true, name: true, code: true } },
        citizen: { select: { id: true, name: true, email: true } },
        assignedOfficer: { select: { id: true, name: true } },
        _count: { select: { attachments: true, history: true } },
      },
    }),
  ]);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  return {
    grievances,
    total,
    page: Math.min(page, totalPages),
    totalPages,
    pageSize: PAGE_SIZE,
  };
}

export async function getGrievanceForActor(id: string, actor: CurrentUser) {
  const grievance = await prisma.grievance.findUnique({
    where: { id },
    include: {
      citizen: { select: { id: true, name: true, email: true, mobile: true } },
      department: { select: { id: true, name: true, code: true, contactEmail: true } },
      assignedOfficer: { select: { id: true, name: true, designation: true, email: true } },
      feedback: true,
      attachments: {
        select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      assignments: {
        orderBy: { createdAt: "desc" },
        include: {
          department: { select: { name: true, code: true } },
          officer: { select: { name: true } },
          assignedBy: { select: { name: true } },
        },
      },
      history: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!grievance) throw new ApiError("Grievance not found.", 404);

  if (actor.role === "CITIZEN" && grievance.citizenId !== actor.id) {
    throw new ApiError("You can only view your own grievances.", 403);
  }
  if (actor.role === "OFFICER" && grievance.departmentId !== actor.department?.id) {
    throw new ApiError("This grievance is not assigned to your department.", 403);
  }

  const history =
    actor.role === "CITIZEN"
      ? grievance.history.filter((entry) => !entry.isInternal)
      : grievance.history;

  return { ...grievance, history };
}

export type CreateGrievanceInput = {
  district: string;
  category: string;
  subject: string;
  description: string;
  priority: Priority;
  aiAdopted: boolean;
  aiSummary?: string;
  aiSuggestedCategory?: string;
  aiSuggestedDepartment?: string;
  aiSuggestedPriority?: Priority;
  aiConfidence?: number;
  aiProvider?: string;
  aiModel?: string;
  aiDuplicateRefs?: unknown;
};

export async function createGrievance(
  actor: CurrentUser,
  input: CreateGrievanceInput,
  attachment?: { filename: string; mimeType: string; size: number; data: Uint8Array } | null,
) {
  if (actor.role !== "CITIZEN") {
    throw new ApiError("Only citizens can submit grievances.", 403);
  }

  const slaDays = SLA_DAYS[input.priority];
  const dueAt = addDays(new Date(), slaDays);

  let created: { id: string; referenceNo: string } | null = null;
  for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
    const referenceNo = generateReferenceNo();
    try {
      created = await prisma.$transaction(async (tx) => {
        const grievance = await tx.grievance.create({
          data: {
            referenceNo,
            citizenId: actor.id,
            district: input.district,
            category: input.category,
            subject: input.subject,
            description: input.description,
            priority: input.priority,
            slaDays,
            dueAt,
            aiSummary: input.aiSummary ?? null,
            aiSuggestedCategory: input.aiSuggestedCategory ?? null,
            aiSuggestedDepartment: input.aiSuggestedDepartment ?? null,
            aiSuggestedPriority: input.aiSuggestedPriority ?? null,
            aiConfidence: input.aiConfidence ?? null,
            aiProvider: input.aiProvider ?? null,
            aiModel: input.aiModel ?? null,
            aiDuplicateRefs: (input.aiDuplicateRefs ?? undefined) as Prisma.InputJsonValue | undefined,
            aiAdopted: input.aiAdopted,
            aiAnalyzedAt: input.aiProvider ? new Date() : null,
          },
          select: { id: true, referenceNo: true },
        });

        await tx.grievanceHistory.create({
          data: {
            grievanceId: grievance.id,
            type: "CREATED",
            status: "SUBMITTED",
            title: "Grievance submitted",
            note: `Reference ${grievance.referenceNo} generated and queued for CMO review.`,
            actorId: actor.id,
            actorName: actor.name,
            actorRole: actor.role,
          },
        });

        if (input.aiProvider) {
          await tx.grievanceHistory.create({
            data: {
              grievanceId: grievance.id,
              type: "AI_ANALYSIS",
              title: "AI triage suggestion recorded",
              note: [
                input.aiSuggestedDepartment ? `Department: ${input.aiSuggestedDepartment}` : null,
                input.aiSuggestedCategory ? `Category: ${input.aiSuggestedCategory}` : null,
                input.aiSuggestedPriority ? `Priority: ${input.aiSuggestedPriority}` : null,
                typeof input.aiConfidence === "number"
                  ? `Confidence: ${Math.round(input.aiConfidence * 100)}%`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") + ". Advisory only — reviewed by a human.",
              actorId: null,
              actorName: "AI Grievance Assistant",
              actorRole: "CITIZEN",
            },
          });
        }

        if (attachment) {
          await tx.attachment.create({
            data: {
              grievanceId: grievance.id,
              filename: attachment.filename,
              mimeType: attachment.mimeType,
              size: attachment.size,
              data: attachment.data as Uint8Array<ArrayBuffer>,
              uploadedById: actor.id,
            },
          });
        }

        return grievance;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        created = null;
        continue;
      }
      throw error;
    }
  }

  if (!created) throw new ApiError("Could not generate a unique reference. Please retry.", 500);
  return created;
}

export async function assignGrievance(
  actor: CurrentUser,
  id: string,
  input: { departmentId: string; officerId?: string; note?: string; dueAt?: string },
) {
  if (actor.role !== "CMO_ADMIN") throw new ApiError("Only CMO administrators can assign grievances.", 403);

  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new ApiError("Grievance not found.", 404);
  if (grievance.status === "RESOLVED") {
    throw new ApiError("This grievance is already resolved. Reopen it before reassigning.", 409);
  }

  const department = await prisma.department.findUnique({ where: { id: input.departmentId } });
  if (!department) throw new ApiError("Selected department was not found.", 422);

  let officer: { id: string; name: string } | null = null;
  if (input.officerId) {
    officer = await prisma.user.findFirst({
      where: { id: input.officerId, role: "OFFICER", departmentId: department.id },
      select: { id: true, name: true },
    });
    if (!officer) throw new ApiError("Selected officer does not belong to this department.", 422);
  }

  const nextStatus: GrievanceStatus =
    grievance.status === "IN_PROGRESS" ? "IN_PROGRESS" : "UNDER_REVIEW";

  const dueAt = input.dueAt ? new Date(input.dueAt) : grievance.dueAt;

  await prisma.$transaction(async (tx) => {
    await tx.grievance.update({
      where: { id },
      data: {
        departmentId: department.id,
        assignedOfficerId: officer?.id ?? null,
        status: nextStatus,
        dueAt,
        resolutionReport: null,
        resolutionSubmittedAt: null,
        cmoApprovedAt: null,
        resolvedAt: null,
        reopenedAt: null,
        reopenReason: null,
      },
    });

    await tx.assignment.create({
      data: {
        grievanceId: id,
        departmentId: department.id,
        officerId: officer?.id ?? null,
        assignedById: actor.id,
        note: input.note ?? null,
        dueAt,
      },
    });

    await tx.grievanceHistory.create({
      data: {
        grievanceId: id,
        type: "ASSIGNMENT",
        status: nextStatus,
        title: `Forwarded to ${department.name}`,
        note: [officer ? `Assigned officer: ${officer.name}.` : null, input.note].filter(Boolean).join(" ") || null,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
      },
    });
  });

  return { department: department.name, officer: officer?.name ?? null, status: nextStatus };
}

export async function updateGrievanceStatus(
  actor: CurrentUser,
  id: string,
  status: GrievanceStatus,
  note?: string,
) {
  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new ApiError("Grievance not found.", 404);

  if (actor.role === "CITIZEN") throw new ApiError("Citizens cannot change grievance status.", 403);
  if (actor.role === "OFFICER") {
    if (grievance.departmentId !== actor.department?.id) {
      throw new ApiError("This grievance is not assigned to your department.", 403);
    }
    if (status !== "IN_PROGRESS") {
      throw new ApiError("Officers can only move a grievance to In Progress. Submit an action-taken report to propose resolution.", 403);
    }
  }

  if (grievance.status === status) {
    throw new ApiError(`Grievance is already marked ${status.toLowerCase().replace("_", " ")}.`, 409);
  }

  const data: Prisma.GrievanceUpdateInput = { status };
  if (status === "RESOLVED") {
    data.resolvedAt = new Date();
    data.cmoApprovedAt = new Date();
  }
  if (status === "REOPENED") {
    data.reopenedAt = new Date();
    data.reopenReason = note ?? "Reopened for further action.";
    data.resolvedAt = null;
    data.cmoApprovedAt = null;
    data.resolutionSubmittedAt = null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.grievance.update({ where: { id }, data });
    await tx.grievanceHistory.create({
      data: {
        grievanceId: id,
        type: "STATUS_CHANGE",
        status,
        title: `Status changed to ${status.replaceAll("_", " ").toLowerCase()}`,
        note: note ?? null,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
      },
    });
  });
}

export async function addRemark(
  actor: CurrentUser,
  id: string,
  note: string,
  visibleToCitizen: boolean,
) {
  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new ApiError("Grievance not found.", 404);

  if (actor.role === "CITIZEN") throw new ApiError("Citizens cannot add official remarks.", 403);
  if (actor.role === "OFFICER" && grievance.departmentId !== actor.department?.id) {
    throw new ApiError("This grievance is not assigned to your department.", 403);
  }

  const isInternal = actor.role === "OFFICER" ? false : !visibleToCitizen;

  await prisma.grievanceHistory.create({
    data: {
      grievanceId: id,
      type: "REMARK",
      title: actor.role === "CMO_ADMIN" ? "CMO office remark" : "Department remark",
      note,
      isInternal,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
    },
  });

  return { internal: isInternal };
}

export async function escalateGrievance(actor: CurrentUser, id: string, reason: string) {
  if (actor.role !== "CMO_ADMIN") throw new ApiError("Only CMO administrators can escalate grievances.", 403);

  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new ApiError("Grievance not found.", 404);
  if (grievance.status === "RESOLVED") throw new ApiError("Resolved grievances cannot be escalated.", 409);

  const nextPriority: Priority =
    grievance.priority === "LOW" ? "MEDIUM" : grievance.priority === "MEDIUM" ? "HIGH" : "HIGH";
  const nextLevel = grievance.escalationLevel + 1;

  await prisma.$transaction(async (tx) => {
    await tx.grievance.update({
      where: { id },
      data: { escalationLevel: nextLevel, priority: nextPriority },
    });
    await tx.grievanceHistory.create({
      data: {
        grievanceId: id,
        type: "ESCALATION",
        title: `Escalated to Level ${nextLevel}`,
        note: `${reason}${nextPriority !== grievance.priority ? ` Priority raised from ${grievance.priority} to ${nextPriority}.` : ""}`,
        isInternal: true,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
      },
    });
  });

  return { level: nextLevel, priority: nextPriority };
}

export async function submitResolution(actor: CurrentUser, id: string, report: string) {
  if (actor.role !== "OFFICER") throw new ApiError("Only department officers can submit action-taken reports.", 403);

  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new ApiError("Grievance not found.", 404);
  if (grievance.departmentId !== actor.department?.id) {
    throw new ApiError("This grievance is not assigned to your department.", 403);
  }
  if (grievance.status === "RESOLVED") throw new ApiError("This grievance is already resolved.", 409);
  if (grievance.resolutionSubmittedAt && !grievance.cmoApprovedAt) {
    throw new ApiError("An action-taken report is already awaiting CMO review.", 409);
  }

  await prisma.$transaction(async (tx) => {
    await tx.grievance.update({
      where: { id },
      data: {
        resolutionReport: report,
        resolutionSubmittedAt: new Date(),
        status: "IN_PROGRESS",
      },
    });
    await tx.assignment.updateMany({
      where: { grievanceId: id, status: "ASSIGNED" },
      data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date() },
    });
    await tx.grievanceHistory.create({
      data: {
        grievanceId: id,
        type: "RESOLUTION",
        title: "Action-taken report submitted for CMO review",
        note: report,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
      },
    });
  });
}

export async function reviewResolution(
  actor: CurrentUser,
  id: string,
  action: "APPROVE" | "REOPEN",
  note?: string,
) {
  if (actor.role !== "CMO_ADMIN") throw new ApiError("Only CMO administrators can review resolutions.", 403);

  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new ApiError("Grievance not found.", 404);
  if (!grievance.resolutionReport || !grievance.resolutionSubmittedAt) {
    throw new ApiError("No action-taken report is awaiting review.", 409);
  }
  if (grievance.cmoApprovedAt) throw new ApiError("This resolution has already been reviewed.", 409);
  if (action === "REOPEN" && !note) throw new ApiError("Add a reason when reopening a grievance.", 422);

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    if (action === "APPROVE") {
      await tx.grievance.update({
        where: { id },
        data: { status: "RESOLVED", resolvedAt: now, cmoApprovedAt: now, reopenedAt: null, reopenReason: null },
      });
      await tx.assignment.updateMany({
        where: { grievanceId: id },
        data: { status: "COMPLETED", completedAt: now },
      });
      await tx.grievanceHistory.create({
        data: {
          grievanceId: id,
          type: "STATUS_CHANGE",
          status: "RESOLVED",
          title: "Resolution confirmed by CMO",
          note: note ?? "The CMO office reviewed the action-taken report and confirmed the resolution. The citizen has been notified.",
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
        },
      });
    } else {
      await tx.grievance.update({
        where: { id },
        data: {
          status: "REOPENED",
          reopenedAt: now,
          reopenReason: note,
          resolvedAt: null,
          cmoApprovedAt: null,
          resolutionSubmittedAt: null,
        },
      });
      await tx.grievanceHistory.create({
        data: {
          grievanceId: id,
          type: "REOPEN",
          status: "REOPENED",
          title: "Resolution rejected and grievance reopened",
          note,
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
        },
      });
    }
  });
}

export async function addFeedback(
  actor: CurrentUser,
  id: string,
  rating: number,
  comments?: string,
) {
  if (actor.role !== "CITIZEN") throw new ApiError("Only citizens can submit feedback.", 403);

  const grievance = await prisma.grievance.findUnique({
    where: { id },
    include: { feedback: true },
  });
  if (!grievance) throw new ApiError("Grievance not found.", 404);
  if (grievance.citizenId !== actor.id) throw new ApiError("You can only review your own grievance.", 403);
  if (grievance.status !== "RESOLVED") throw new ApiError("Feedback can be submitted after the grievance is resolved.", 409);
  if (grievance.feedback) throw new ApiError("Feedback has already been submitted for this grievance.", 409);

  await prisma.$transaction(async (tx) => {
    await tx.citizenFeedback.create({
      data: { grievanceId: id, citizenId: actor.id, rating, comments: comments ?? null },
    });
    await tx.grievanceHistory.create({
      data: {
        grievanceId: id,
        type: "FEEDBACK",
        title: "Citizen feedback received",
        note: `${rating}/5${comments ? ` — ${comments}` : ""}`,
        isInternal: true,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
      },
    });
  });
}

export async function reopenByCitizen(actor: CurrentUser, id: string, reason: string) {
  if (actor.role !== "CITIZEN") throw new ApiError("Only citizens can reopen their grievance.", 403);

  const grievance = await prisma.grievance.findUnique({ where: { id } });
  if (!grievance) throw new ApiError("Grievance not found.", 404);
  if (grievance.citizenId !== actor.id) throw new ApiError("You can only reopen your own grievance.", 403);
  if (grievance.status !== "RESOLVED") throw new ApiError("Only a resolved grievance can be reopened.", 409);

  await prisma.$transaction(async (tx) => {
    await tx.grievance.update({
      where: { id },
      data: {
        status: "REOPENED",
        reopenedAt: new Date(),
        reopenReason: reason,
        resolvedAt: null,
        cmoApprovedAt: null,
        resolutionSubmittedAt: null,
      },
    });
    await tx.grievanceHistory.create({
      data: {
        grievanceId: id,
        type: "REOPEN",
        status: "REOPENED",
        title: "Grievance reopened by citizen",
        note: reason,
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
      },
    });
  });
}

export async function getPublicTracking(referenceNo: string) {
  const grievance = await prisma.grievance.findUnique({
    where: { referenceNo: referenceNo.trim().toUpperCase() },
    select: {
      referenceNo: true,
      subject: true,
      description: true,
      category: true,
      district: true,
      priority: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      dueAt: true,
      escalationLevel: true,
      resolvedAt: true,
      reopenedAt: true,
      resolutionReport: true,
      department: { select: { name: true, code: true } },
      history: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          status: true,
          title: true,
          note: true,
          actorName: true,
          actorRole: true,
          createdAt: true,
        },
      },
      feedback: { select: { rating: true, comments: true, createdAt: true } },
    },
  });

  if (!grievance) return null;
  return {
    ...grievance,
    isOverdue: isOverdue(grievance),
    description: truncate(grievance.description, 600),
  };
}

export async function getCitizenSummary(citizenId: string) {
  const [total, resolved, pending, reopened, recent] = await Promise.all([
    prisma.grievance.count({ where: { citizenId } }),
    prisma.grievance.count({ where: { citizenId, status: "RESOLVED" } }),
    prisma.grievance.count({
      where: { citizenId, status: { in: ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"] } },
    }),
    prisma.grievance.count({ where: { citizenId, status: "REOPENED" } }),
    prisma.grievance.findMany({
      where: { citizenId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { department: { select: { name: true } } },
    }),
  ]);
  return { total, resolved, pending, reopened, recent };
}

export async function getDepartmentSummary(departmentId: string) {
  const [total, active, resolved, awaitingReport, recent] = await Promise.all([
    prisma.grievance.count({ where: { departmentId } }),
    prisma.grievance.count({ where: { departmentId, status: { in: ["UNDER_REVIEW", "IN_PROGRESS", "REOPENED"] } } }),
    prisma.grievance.count({ where: { departmentId, status: "RESOLVED" } }),
    prisma.grievance.count({
      where: {
        departmentId,
        resolutionSubmittedAt: { not: null },
        cmoApprovedAt: null,
        status: { not: "RESOLVED" },
      },
    }),
    prisma.grievance.findMany({
      where: { departmentId, status: { in: ["UNDER_REVIEW", "IN_PROGRESS", "REOPENED"] } },
      orderBy: { dueAt: "asc" },
      take: 4,
    }),
  ]);
  return { total, active, resolved, awaitingReport, recent };
}

export async function getPublicStats() {
  const [total, resolved, departments, districts] = await Promise.all([
    prisma.grievance.count(),
    prisma.grievance.count({ where: { status: "RESOLVED" } }),
    prisma.department.count(),
    prisma.grievance.findMany({ distinct: ["district"], select: { district: true } }),
  ]);
  return { total, resolved, departments, districtsCovered: districts.length };
}

export type CmoStats = Awaited<ReturnType<typeof getCmoStats>>;

export async function getCmoStats() {
  const now = new Date();
  const [total, statusGroups, priorityGroups, districtGroups, departmentGroups, categoryGroups, awaitingReview, escalated, resolvedRows, recent, feedbackAgg] =
    await Promise.all([
      prisma.grievance.count(),
      prisma.grievance.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.grievance.groupBy({ by: ["priority"], _count: { _all: true } }),
      prisma.grievance.groupBy({ by: ["district"], _count: { _all: true }, orderBy: { _count: { district: "desc" } } }),
      prisma.grievance.groupBy({ by: ["departmentId"], _count: { _all: true }, orderBy: { _count: { departmentId: "desc" } } }),
      prisma.grievance.groupBy({ by: ["category"], _count: { _all: true }, orderBy: { _count: { category: "desc" } } }),
      prisma.grievance.count({
        where: { resolutionSubmittedAt: { not: null }, cmoApprovedAt: null, status: { not: "RESOLVED" } },
      }),
      prisma.grievance.count({ where: { escalationLevel: { gt: 0 }, status: { not: "RESOLVED" } } }),
      prisma.grievance.findMany({
        where: { status: "RESOLVED", resolvedAt: { not: null } },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.grievance.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          department: { select: { name: true } },
          citizen: { select: { name: true } },
        },
      }),
      prisma.citizenFeedback.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
    ]);

  const byStatus = Object.fromEntries(statusGroups.map((group) => [group.status, group._count._all]));
  const statusCount = (status: GrievanceStatus) => byStatus[status] ?? 0;
  const pending =
    statusCount("SUBMITTED") + statusCount("UNDER_REVIEW") + statusCount("IN_PROGRESS") + statusCount("REOPENED");
  const resolved = statusCount("RESOLVED");
  const overdue = await prisma.grievance.count({
    where: { dueAt: { lt: now }, status: { not: "RESOLVED" } },
  });

  const departments = await prisma.department.findMany({ select: { id: true, name: true, code: true } });
  const departmentName = new Map(departments.map((department) => [department.id, department.name]));

  const avgResolutionDays =
    resolvedRows.length === 0
      ? 0
      : Math.round(
          (resolvedRows.reduce((sum, row) => {
            const end = row.resolvedAt?.getTime() ?? now.getTime();
            return sum + (end - row.createdAt.getTime()) / (24 * 60 * 60 * 1000);
          }, 0) /
            resolvedRows.length) *
            10,
        ) / 10;

  const weeks: { label: string; created: number; resolved: number }[] = [];
  for (let index = 7; index >= 0; index -= 1) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - index * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    weeks.push({
      label: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(start),
      created: 0,
      resolved: 0,
    });
  }

  const allCreated = await prisma.grievance.findMany({ select: { createdAt: true } });
  const allResolved = await prisma.grievance.findMany({
    where: { resolvedAt: { not: null } },
    select: { resolvedAt: true },
  });

  const bucketFor = (date: Date) => {
    for (let index = 0; index < weeks.length; index += 1) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - start.getDay() - (weeks.length - 1 - index) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      if (date >= start && date < end) return index;
    }
    return -1;
  };

  for (const row of allCreated) {
    const index = bucketFor(row.createdAt);
    if (index >= 0) weeks[index].created += 1;
  }
  for (const row of allResolved) {
    if (!row.resolvedAt) continue;
    const index = bucketFor(row.resolvedAt);
    if (index >= 0) weeks[index].resolved += 1;
  }

  return {
    totals: {
      total,
      pending,
      resolved,
      overdue,
      awaitingReview,
      escalated,
      reopened: statusCount("REOPENED"),
      avgResolutionDays,
      feedbackCount: feedbackAgg._count._all,
      avgRating: feedbackAgg._avg.rating ? Math.round(feedbackAgg._avg.rating * 10) / 10 : null,
    },
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    byPriority: priorityGroups.map((group) => ({ priority: group.priority, count: group._count._all })),
    byDistrict: districtGroups.map((group) => ({ district: group.district, count: group._count._all })),
    byDepartment: departmentGroups
      .filter((group) => group.departmentId)
      .map((group) => ({
        name: departmentName.get(group.departmentId!) ?? "Unassigned",
        count: group._count._all,
      })),
    byCategory: categoryGroups.map((group) => ({ category: group.category, count: group._count._all })),
    trend: weeks,
    recent,
  };
}
