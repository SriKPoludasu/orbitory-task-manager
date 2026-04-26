import { Project, Task, User } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TaskWithProject = Task & { project: Project; assignee: User | null };

export function TaskListPanel({ title, tasks, empty }: { title: string; tasks: TaskWithProject[]; empty: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{tasks.length} tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length ? (
          tasks.slice(0, 6).map((task) => (
            <Link key={task.id} href={`/projects/${task.projectId}`} className="block rounded-lg border p-3 transition hover:bg-muted/60">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{task.title}</p>
                <Badge>{task.priority}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {task.project.name} {task.dueDate ? `- due ${format(task.dueDate, "MMM d")}` : ""}
              </p>
            </Link>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</div>
        )}
      </CardContent>
    </Card>
  );
}
