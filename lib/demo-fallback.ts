import { Priority, TaskStatus, WorkspaceRole } from "@prisma/client";
import { formatPercent } from "@/lib/utils";

export const DEMO_USER_ID = "demo-user-kay";
export const DEMO_WORKSPACE_ID = "demo-workspace-orbitory";
export const DEMO_PROJECT_ID = "seed-project-launch";

const now = new Date();

const users = [
  {
    id: DEMO_USER_ID,
    name: "Kay Poludasu",
    email: "kay@example.com",
    emailVerified: null,
    image: "/kay-poludasu.jpeg",
    passwordHash: null,
    role: "USER",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "demo-user-contributor",
    name: "Contributor",
    email: "contributor@demo.local",
    emailVerified: null,
    image: null,
    passwordHash: null,
    role: "USER",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "demo-user-reviewer",
    name: "Reviewer",
    email: "reviewer@demo.local",
    emailVerified: null,
    image: null,
    passwordHash: null,
    role: "USER",
    createdAt: now,
    updatedAt: now
  }
];

const workspace = {
  id: DEMO_WORKSPACE_ID,
  name: "Orbitory",
  slug: "orbitory",
  description: "A sharp workspace for keeping product work in motion.",
  color: "#d7ff3d",
  createdAt: now,
  updatedAt: now
};

const labels = [
  { id: "demo-label-design", name: "Design", color: "#ff5a36", projectId: DEMO_PROJECT_ID },
  { id: "demo-label-engineering", name: "Engineering", color: "#d7ff3d", projectId: DEMO_PROJECT_ID },
  { id: "demo-label-growth", name: "Growth", color: "#ffe45c", projectId: DEMO_PROJECT_ID },
  { id: "demo-label-customer", name: "Customer", color: "#ffb000", projectId: DEMO_PROJECT_ID }
];

const rawTasks = [
  {
    id: "demo-task-1",
    title: "Design the investor-ready launch board",
    description: "Tighten the dashboard hierarchy and prep screenshots for the portfolio case study.",
    status: TaskStatus.TODO,
    priority: Priority.HIGH,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    position: 0,
    archivedAt: null,
    projectId: DEMO_PROJECT_ID,
    assigneeId: users[1].id,
    creatorId: DEMO_USER_ID,
    createdAt: now,
    updatedAt: now,
    assignee: users[1],
    creator: users[0],
    label: labels[0]
  },
  {
    id: "demo-task-2",
    title: "Verify realtime card movement",
    description: "Confirm Pusher events refresh other collaborators after a status change.",
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.URGENT,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
    position: 0,
    archivedAt: null,
    projectId: DEMO_PROJECT_ID,
    assigneeId: users[2].id,
    creatorId: DEMO_USER_ID,
    createdAt: now,
    updatedAt: now,
    assignee: users[2],
    creator: users[0],
    label: labels[1]
  },
  {
    id: "demo-task-3",
    title: "Polish onboarding microcopy",
    description: "Make the first run feel crisp, confident, and founder-grade.",
    status: TaskStatus.REVIEW,
    priority: Priority.MEDIUM,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    position: 0,
    archivedAt: null,
    projectId: DEMO_PROJECT_ID,
    assigneeId: DEMO_USER_ID,
    creatorId: DEMO_USER_ID,
    createdAt: now,
    updatedAt: now,
    assignee: users[0],
    creator: users[0],
    label: labels[2]
  },
  {
    id: "demo-task-4",
    title: "Ship beta customer recap",
    description: "Summarize launch feedback and highlight the next three product decisions.",
    status: TaskStatus.DONE,
    priority: Priority.LOW,
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    position: 0,
    archivedAt: null,
    projectId: DEMO_PROJECT_ID,
    assigneeId: users[0].id,
    creatorId: DEMO_USER_ID,
    createdAt: now,
    updatedAt: now,
    assignee: users[0],
    creator: users[0],
    label: labels[3]
  }
];

const tasks = rawTasks.map((task) => ({
  ...task,
  comments: [
    {
      id: `${task.id}-comment`,
      body: "Demo mode is active, so this sample thread is ready without a database.",
      taskId: task.id,
      authorId: task.assigneeId ?? DEMO_USER_ID,
      createdAt: now,
      updatedAt: now,
      author: task.assignee ?? users[0]
    }
  ],
  labels: [{ taskId: task.id, labelId: task.label.id, label: task.label }]
}));

const project = {
  id: DEMO_PROJECT_ID,
  name: "Signal Sprint",
  description: "A focused launch board for the most important product work.",
  color: "#d7ff3d",
  dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
  archivedAt: null,
  workspaceId: DEMO_WORKSPACE_ID,
  createdAt: now,
  updatedAt: now,
  workspace,
  labels,
  tasks
};

const members = users.map((user, index) => ({
  id: `demo-member-${user.id}`,
  role: index === 0 ? WorkspaceRole.OWNER : WorkspaceRole.MEMBER,
  userId: user.id,
  workspaceId: DEMO_WORKSPACE_ID,
  createdAt: now,
  user
}));

export function isDemoUserId(userId?: string | null) {
  return userId === DEMO_USER_ID;
}

export function isDemoEmail(email?: string | null) {
  const value = email?.toLowerCase().trim();
  return value === "kay@example.com";
}

export function getDemoCurrentUser() {
  return {
    ...users[0],
    memberships: [{ ...members[0], workspace }]
  };
}

export function getDemoDashboardData() {
  const projectTasks = tasks.map((task) => ({ ...task, project }));
  const done = projectTasks.filter((task) => task.status === TaskStatus.DONE).length;
  const activeMyTasks = projectTasks.filter((task) => task.assigneeId === DEMO_USER_ID && task.status !== TaskStatus.DONE);
  const upcoming = projectTasks.filter((task) => task.status !== TaskStatus.DONE);

  return {
    membership: { ...members[0], workspace },
    workspace,
    projects: [project],
    activities: [
      {
        id: "demo-activity-1",
        type: "WORKSPACE_CREATED",
        message: "Kay opened Orbitory in demo mode.",
        userId: DEMO_USER_ID,
        workspaceId: DEMO_WORKSPACE_ID,
        projectId: null,
        taskId: null,
        createdAt: now,
        user: users[0],
        project: null
      },
      {
        id: "demo-activity-2",
        type: "TASK_UPDATED",
        message: "Reviewer moved realtime QA into active work.",
        userId: users[2].id,
        workspaceId: DEMO_WORKSPACE_ID,
        projectId: DEMO_PROJECT_ID,
        taskId: "demo-task-2",
        createdAt: now,
        user: users[2],
        project
      }
    ],
    members,
    tasks: projectTasks,
    stats: {
      totalTasks: projectTasks.length,
      done,
      overdue: 0,
      upcoming: upcoming.length,
      myTasks: activeMyTasks.length,
      progress: formatPercent(done, projectTasks.length)
    },
    myTasks: activeMyTasks,
    overdue: [],
    upcoming,
    productivity: Object.values(TaskStatus).map((status) => ({
      name: status.replace("_", " "),
      tasks: projectTasks.filter((task) => task.status === status).length
    })),
    priorityCounts: Object.values(Priority).map((priority) => ({
      name: priority,
      value: projectTasks.filter((task) => task.priority === priority).length
    })),
    projectProgress: [
      {
        id: project.id,
        name: project.name,
        progress: formatPercent(done, projectTasks.length),
        total: projectTasks.length,
        completed: done,
        color: project.color
      }
    ]
  };
}

export function getDemoProjectData() {
  return { project, members };
}
