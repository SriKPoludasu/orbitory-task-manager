"use client";

import { format } from "date-fns";
import { ProjectWithRelations, TaskWithRelations, MemberWithUser } from "@/components/board/project-workspace";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TaskListView({ project, tasks, members }: { project: ProjectWithRelations; tasks: TaskWithRelations[]; members: MemberWithUser[] }) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card shadow-panel">
      <div className="grid grid-cols-[1.4fr_130px_130px_120px] gap-4 border-b px-4 py-3 text-xs font-semibold uppercase text-muted-foreground max-lg:hidden">
        <span>Task</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Owner</span>
      </div>
      {tasks.length ? (
        tasks.map((task) => (
          <TaskDialog key={task.id} project={project} members={members} task={task}>
            <button className="grid w-full grid-cols-1 gap-3 border-b px-4 py-4 text-left transition hover:bg-muted/60 lg:grid-cols-[1.4fr_130px_130px_120px] lg:items-center">
              <div>
                <p className="font-semibold">{task.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{task.dueDate ? `Due ${format(task.dueDate, "MMM d")}` : "No due date"}</p>
              </div>
              <Badge>{task.status.replace("_", " ")}</Badge>
              <Badge>{task.priority}</Badge>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={task.assignee?.image ?? undefined} />
                  <AvatarFallback name={task.assignee?.name} />
                </Avatar>
                <span className="truncate text-sm">{task.assignee?.name ?? "Unassigned"}</span>
              </div>
            </button>
          </TaskDialog>
        ))
      ) : (
        <div className="p-10 text-center text-sm text-muted-foreground">No tasks match those filters.</div>
      )}
    </section>
  );
}
