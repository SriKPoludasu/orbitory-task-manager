import { Priority, TaskStatus, WorkspaceRole } from "@prisma/client";
import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(2, "Workspace name is required").max(80),
  description: z.string().max(180).optional()
});

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required").max(80),
  description: z.string().max(220).optional(),
  dueDate: z.string().optional()
});

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Task title is required").max(120),
  description: z.string().max(2000).optional(),
  priority: z.nativeEnum(Priority),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  labelIds: z.array(z.string()).default([])
});

export const commentSchema = z.object({
  taskId: z.string(),
  body: z.string().min(1, "Comment cannot be empty").max(1200)
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(WorkspaceRole)
});

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  image: z.string().url().optional().or(z.literal(""))
});
