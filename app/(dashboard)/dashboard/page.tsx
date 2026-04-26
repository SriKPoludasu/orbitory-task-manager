import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TaskListPanel } from "@/components/dashboard/task-list-panel";
import { ProductivityChart } from "@/components/charts/productivity-chart";
import { PriorityChart } from "@/components/charts/priority-chart";
import { OnboardingPanel } from "@/components/dashboard/onboarding-panel";
import { getDashboardData } from "@/lib/data";
import { requireUser } from "@/lib/current-user";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  if (!data) {
    return <OnboardingPanel />;
  }

  if (data.projects.length === 1 && data.projects[0].tasks.length > 0) {
    // Keep the dashboard as the default landing surface even for the demo seed.
  }

  return (
    <div className="space-y-6">
      <DashboardHeader workspace={data.workspace} members={data.members} />
      <DashboardStats stats={data.stats} />
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <ProjectGrid projects={data.projects} progress={data.projectProgress} workspaceId={data.workspace.id} />
        <ActivityFeed activities={data.activities} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ProductivityChart data={data.productivity} />
        <PriorityChart data={data.priorityCounts} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <TaskListPanel title="My tasks" tasks={data.myTasks} empty="Your assigned work is clear." />
        <TaskListPanel title="Overdue" tasks={data.overdue} empty="No overdue tasks. Beautiful." />
        <TaskListPanel title="Upcoming" tasks={data.upcoming} empty="No deadlines in the next week." />
      </div>
    </div>
  );
}
