import { Priority, TaskStatus, WorkspaceRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const demoUsers = [
  { name: "Kay Poludasu", email: "kay@example.com", image: "/kay-poludasu.jpeg" },
  { name: "Contributor", email: "contributor@demo.local", image: null },
  { name: "Reviewer", email: "reviewer@demo.local", image: null },
  { name: "Observer", email: "observer@demo.local", image: null }
];

export async function ensureDemoData() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const users = await Promise.all(
    demoUsers.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: { ...user, passwordHash },
        create: { ...user, passwordHash }
      })
    )
  );

  const workspace = await prisma.workspace.upsert({
    where: { slug: "orbitory" },
    update: { name: "Orbitory", description: "A sharp workspace for keeping product work in motion." },
    create: {
      name: "Orbitory",
      slug: "orbitory",
      description: "A sharp workspace for keeping product work in motion.",
      color: "#d7ff3d"
    }
  });

  await Promise.all(
    users.map((user, index) =>
      prisma.workspaceMember.upsert({
        where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
        update: {},
        create: {
          userId: user.id,
          workspaceId: workspace.id,
          role: index === 0 ? WorkspaceRole.OWNER : index === 1 ? WorkspaceRole.ADMIN : WorkspaceRole.MEMBER
        }
      })
    )
  );

  const launch = await prisma.project.upsert({
    where: { id: "seed-project-launch" },
    update: {
      name: "Signal Sprint",
      description: "A focused launch board for the most important product work.",
      color: "#d7ff3d"
    },
    create: {
      id: "seed-project-launch",
      name: "Signal Sprint",
      description: "A focused launch board for the most important product work.",
      color: "#d7ff3d",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      workspaceId: workspace.id
    }
  });

  await prisma.project.upsert({
    where: { id: "seed-project-mobile" },
    update: {
      name: "Mobile Signal",
      description: "Plan fast mobile workflows for managers moving between meetings.",
      color: "#ffb000"
    },
    create: {
      id: "seed-project-mobile",
      name: "Mobile Signal",
      description: "Plan fast mobile workflows for managers moving between meetings.",
      color: "#ffb000",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      workspaceId: workspace.id
    }
  });

  const labels = await Promise.all(
    [
      { name: "Design", color: "#ff5a36" },
      { name: "Engineering", color: "#d7ff3d" },
      { name: "Growth", color: "#ffe45c" },
      { name: "Customer", color: "#ffb000" }
    ].map((label) =>
      prisma.label.upsert({
        where: { projectId_name: { projectId: launch.id, name: label.name } },
        update: label,
        create: { ...label, projectId: launch.id }
      })
    )
  );

  const existingTasks = await prisma.task.count({ where: { projectId: launch.id } });
  if (existingTasks === 0) {
    const taskInputs = [
      ["Design the investor-ready launch board", TaskStatus.TODO, Priority.HIGH, 0, users[1].id, labels[0].id],
      ["Verify realtime card movement", TaskStatus.IN_PROGRESS, Priority.URGENT, 0, users[2].id, labels[1].id],
      ["Polish onboarding microcopy", TaskStatus.REVIEW, Priority.MEDIUM, 0, users[0].id, labels[2].id],
      ["Ship beta customer recap", TaskStatus.DONE, Priority.LOW, 0, users[3].id, labels[3].id]
    ] as const;

    for (const [title, status, priority, position, assigneeId, labelId] of taskInputs) {
      const task = await prisma.task.create({
        data: {
          title,
          status,
          priority,
          position,
          assigneeId,
          creatorId: users[0].id,
          projectId: launch.id,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (position + 3)),
          description: "Keep the work crisp, visible, and ready for quick team handoffs.",
          labels: { create: { labelId } }
        }
      });

      await prisma.comment.create({
        data: {
          taskId: task.id,
          authorId: assigneeId,
          body: "I added context and will update this before the next review."
        }
      });
    }
  }

  const activityCount = await prisma.activity.count({ where: { workspaceId: workspace.id } });
  if (activityCount === 0) {
    await prisma.activity.createMany({
      data: [
        {
          type: "WORKSPACE_CREATED",
          message: "Kay opened Orbitory.",
          userId: users[0].id,
          workspaceId: workspace.id
        },
        {
          type: "PROJECT_CREATED",
          message: "Contributor set up Signal Sprint.",
          userId: users[1].id,
          workspaceId: workspace.id,
          projectId: launch.id
        }
      ]
    });
  }
}
