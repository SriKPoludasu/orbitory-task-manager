import { Priority, TaskStatus } from "@prisma/client";
import { addDays, isBefore, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getDemoDashboardData, getDemoProjectData, isDemoUserId } from "@/lib/demo-fallback";
import { formatPercent } from "@/lib/utils";

export async function getDashboardData(userId: string) {
  if (isDemoUserId(userId)) return getDemoDashboardData() as never;

  try {
    const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
    orderBy: { createdAt: "asc" }
  });

  if (!membership) return null;

  const workspaceId = membership.workspaceId;
  const projects = await prisma.project.findMany({
    where: { workspaceId, archivedAt: null },
    include: {
      tasks: {
        where: { archivedAt: null },
        include: {
          assignee: true,
          labels: { include: { label: true } }
        },
        orderBy: [{ status: "asc" }, { position: "asc" }]
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  const activities = await prisma.activity.findMany({
    where: { workspaceId },
    include: { user: true, project: true },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  const tasks = projects.flatMap((project) => project.tasks.map((task) => ({ ...task, project })));
  const now = startOfDay(new Date());
  const soon = addDays(now, 7);
  const done = tasks.filter((task) => task.status === TaskStatus.DONE).length;
  const overdue = tasks.filter((task) => task.dueDate && isBefore(task.dueDate, now) && task.status !== TaskStatus.DONE);
  const upcoming = tasks.filter((task) => task.dueDate && task.dueDate <= soon && task.status !== TaskStatus.DONE);
  const myTasks = tasks.filter((task) => task.assigneeId === userId && task.status !== TaskStatus.DONE);

  const productivity = Object.values(TaskStatus).map((status) => ({
    name: status.replace("_", " "),
    tasks: tasks.filter((task) => task.status === status).length
  }));

  const priorityCounts = Object.values(Priority).map((priority) => ({
    name: priority,
    value: tasks.filter((task) => task.priority === priority).length
  }));

  const projectProgress = projects.map((project) => {
    const total = project.tasks.length;
    const completed = project.tasks.filter((task) => task.status === TaskStatus.DONE).length;
    return {
      id: project.id,
      name: project.name,
      progress: formatPercent(completed, total),
      total,
      completed,
      color: project.color
    };
  });

    return {
    membership,
    workspace: membership.workspace,
    projects,
    activities,
    members,
    tasks,
    stats: {
      totalTasks: tasks.length,
      done,
      overdue: overdue.length,
      upcoming: upcoming.length,
      myTasks: myTasks.length,
      progress: formatPercent(done, tasks.length)
    },
    myTasks,
    overdue,
    upcoming,
    productivity,
    priorityCounts,
    projectProgress
  };
  } catch {
    return getDemoDashboardData() as never;
  }
}

export async function getProjectData(projectId: string, userId: string) {
  if (isDemoUserId(userId)) return getDemoProjectData() as never;

  try {
    const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspace: {
        members: { some: { userId } }
      }
    },
    include: {
      workspace: true,
      labels: true,
      tasks: {
        where: { archivedAt: null },
        include: {
          assignee: true,
          creator: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: "asc" }
          },
          labels: { include: { label: true } }
        },
        orderBy: [{ status: "asc" }, { position: "asc" }]
      }
    }
  });

  if (!project) return null;

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: project.workspaceId },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

    return { project, members };
  } catch {
    return getDemoProjectData() as never;
  }
}
