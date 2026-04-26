"use server";

import { ActivityType, Prisma, TaskStatus, WorkspaceRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { getDemoProjectData, isDemoUserId } from "@/lib/demo-fallback";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/pusher";
import { inviteSchema, projectSchema, taskSchema, workspaceSchema, profileSchema, commentSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

async function requireWorkspaceAccess(workspaceId: string, roles?: WorkspaceRole[]) {
  const user = await requireUser();
  if (isDemoUserId(user.id)) {
    return {
      user,
      membership: {
        id: "demo-member-demo-user-kay",
        role: WorkspaceRole.OWNER,
        userId: user.id,
        workspaceId,
        createdAt: new Date()
      }
    };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } }
  });

  if (!membership || (roles && !roles.includes(membership.role))) {
    throw new Error("You do not have access to this workspace.");
  }

  return { user, membership };
}

async function createActivity(data: {
  type: ActivityType;
  message: string;
  userId: string;
  workspaceId: string;
  projectId?: string;
  taskId?: string;
}) {
  await prisma.activity.create({ data });
}

export async function createWorkspace(formData: FormData) {
  const user = await requireUser();
  const parsed = workspaceSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.name,
      slug: `${slugify(parsed.name)}-${Math.random().toString(36).slice(2, 7)}`,
      description: parsed.description,
      members: { create: { userId: user.id, role: WorkspaceRole.OWNER } }
    }
  });

  await createActivity({
    type: "WORKSPACE_CREATED",
    message: `${user.name ?? "Someone"} created ${workspace.name}.`,
    userId: user.id,
    workspaceId: workspace.id
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createProject(workspaceId: string, formData: FormData) {
  const { user } = await requireWorkspaceAccess(workspaceId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]);
  const parsed = projectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined
  });

  const project = await prisma.project.create({
    data: {
      name: parsed.name,
      description: parsed.description,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
      color: "#d7ff3d",
      workspaceId
    }
  });

  await createActivity({
    type: "PROJECT_CREATED",
    message: `${user.name ?? "Someone"} created project ${project.name}.`,
    userId: user.id,
    workspaceId,
    projectId: project.id
  });

  await broadcast(`workspace-${workspaceId}`, "project:created", { projectId: project.id });
  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function upsertTask(projectId: string, values: unknown) {
  const user = await requireUser();
  if (isDemoUserId(user.id)) {
    const parsed = taskSchema.parse(values);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/dashboard");
    return {
      id: parsed.id ?? `demo-task-${Date.now()}`,
      title: parsed.title,
      description: parsed.description ?? null,
      status: parsed.status,
      priority: parsed.priority,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      position: 0,
      archivedAt: null,
      projectId,
      assigneeId: parsed.assigneeId ?? null,
      creatorId: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspace: { members: { some: { userId: user.id } } } }
  });
  if (!project) throw new Error("Project not found.");

  const parsed = taskSchema.parse(values);
  const baseData = {
    title: parsed.title,
    description: parsed.description,
    priority: parsed.priority,
    status: parsed.status,
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
    assigneeId: parsed.assigneeId || null
  };

  const task = parsed.id
    ? await prisma.task.update({
        where: { id: parsed.id },
        data: {
          ...baseData,
          labels: {
            deleteMany: {},
            create: parsed.labelIds.map((labelId) => ({ labelId }))
          }
        }
      })
    : await prisma.task.create({
        data: {
          ...baseData,
          creatorId: user.id,
          projectId,
          position: await prisma.task.count({ where: { projectId, status: parsed.status } }),
          labels: {
            create: parsed.labelIds.map((labelId) => ({ labelId }))
          }
        }
      });

  await createActivity({
    type: parsed.id ? "TASK_UPDATED" : "TASK_CREATED",
    message: `${user.name ?? "Someone"} ${parsed.id ? "updated" : "created"} ${task.title}.`,
    userId: user.id,
    workspaceId: project.workspaceId,
    projectId,
    taskId: task.id
  });

  await broadcast(`project-${projectId}`, "task:changed", { taskId: task.id });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return task;
}

export async function moveTask(taskId: string, status: TaskStatus, position: number) {
  const user = await requireUser();
  if (isDemoUserId(user.id)) {
    revalidatePath("/dashboard");
    revalidatePath(`/projects/${getDemoProjectData().project.id}`);
    return;
  }

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: { workspace: { members: { some: { userId: user.id } } } }
    },
    include: { project: true }
  });
  if (!task) throw new Error("Task not found.");

  await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: { projectId: task.projectId, status, position: { gte: position }, id: { not: taskId } },
      data: { position: { increment: 1 } }
    });
    await tx.task.update({
      where: { id: taskId },
      data: { status, position }
    });
  });

  await createActivity({
    type: "TASK_MOVED",
    message: `${user.name ?? "Someone"} moved ${task.title} to ${status.replace("_", " ")}.`,
    userId: user.id,
    workspaceId: task.project.workspaceId,
    projectId: task.projectId,
    taskId
  });

  await broadcast(`project-${task.projectId}`, "task:moved", { taskId, status });
  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  const user = await requireUser();
  if (isDemoUserId(user.id)) {
    revalidatePath("/dashboard");
    revalidatePath(`/projects/${getDemoProjectData().project.id}`);
    return;
  }

  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { workspace: { members: { some: { userId: user.id } } } } },
    include: { project: true }
  });
  if (!task) throw new Error("Task not found.");

  await prisma.task.delete({ where: { id: taskId } });
  await createActivity({
    type: "TASK_DELETED",
    message: `${user.name ?? "Someone"} deleted ${task.title}.`,
    userId: user.id,
    workspaceId: task.project.workspaceId,
    projectId: task.projectId
  });

  await broadcast(`project-${task.projectId}`, "task:deleted", { taskId });
  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath("/dashboard");
}

export async function archiveCompleted(projectId: string) {
  const user = await requireUser();
  if (isDemoUserId(user.id)) {
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/dashboard");
    return;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, workspace: { members: { some: { userId: user.id } } } }
  });
  if (!project) throw new Error("Project not found.");

  await prisma.task.updateMany({
    where: { projectId, status: TaskStatus.DONE },
    data: { archivedAt: new Date() }
  });

  await createActivity({
    type: "TASK_ARCHIVED",
    message: `${user.name ?? "Someone"} archived completed tasks in ${project.name}.`,
    userId: user.id,
    workspaceId: project.workspaceId,
    projectId
  });

  await broadcast(`project-${projectId}`, "task:archived", {});
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
}

export async function createComment(taskId: string, body: string) {
  const user = await requireUser();
  const parsed = commentSchema.parse({ taskId, body });
  if (isDemoUserId(user.id)) {
    return {
      id: `demo-comment-${Date.now()}`,
      body: parsed.body,
      taskId: parsed.taskId,
      authorId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: user
    };
  }

  const task = await prisma.task.findFirst({
    where: { id: parsed.taskId, project: { workspace: { members: { some: { userId: user.id } } } } },
    include: { project: true }
  });
  if (!task) throw new Error("Task not found.");

  const comment = await prisma.comment.create({
    data: { body: parsed.body, taskId: parsed.taskId, authorId: user.id },
    include: { author: true }
  });

  await createActivity({
    type: "COMMENT_CREATED",
    message: `${user.name ?? "Someone"} commented on ${task.title}.`,
    userId: user.id,
    workspaceId: task.project.workspaceId,
    projectId: task.projectId,
    taskId: task.id
  });

  await broadcast(`project-${task.projectId}`, "comment:created", { taskId: task.id });
  revalidatePath(`/projects/${task.projectId}`);
  return comment;
}

export async function inviteMember(workspaceId: string, values: unknown) {
  const { user } = await requireWorkspaceAccess(workspaceId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);
  const parsed = inviteSchema.parse(values);
  const invite = await prisma.invite.create({
    data: {
      email: parsed.email.toLowerCase(),
      role: parsed.role,
      token: randomUUID(),
      workspaceId
    }
  });

  await createActivity({
    type: "MEMBER_INVITED",
    message: `${user.name ?? "Someone"} invited ${invite.email}.`,
    userId: user.id,
    workspaceId
  });

  revalidatePath("/dashboard");
  return invite;
}

export async function updateProfile(values: unknown) {
  const user = await requireUser();
  const parsed = profileSchema.parse(values);
  if (isDemoUserId(user.id)) {
    revalidatePath("/dashboard");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.name,
      image: parsed.image || null
    }
  });
  revalidatePath("/dashboard");
}

export async function searchTasks(query: string, projectId?: string) {
  const user = await requireUser();
  if (isDemoUserId(user.id)) {
    const tasks = getDemoProjectData().project.tasks;
    return tasks
      .filter((task) => {
        const text = `${task.title} ${task.description ?? ""}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (!projectId || task.projectId === projectId);
      })
      .map((task) => ({ ...task, project: getDemoProjectData().project, assignee: task.assignee }));
  }

  const where: Prisma.TaskWhereInput = {
    archivedAt: null,
    project: { workspace: { members: { some: { userId: user.id } } } }
  };

  if (projectId) where.projectId = projectId;
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } }
    ];
  }

  return prisma.task.findMany({
    where,
    include: { project: true, assignee: true },
    orderBy: { updatedAt: "desc" },
    take: 20
  });
}
