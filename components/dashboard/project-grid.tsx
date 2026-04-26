import { Project, Task } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ProjectDialog } from "@/components/dashboard/project-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function ProjectGrid({
  projects,
  progress,
  workspaceId
}: {
  projects: (Project & { tasks: Task[] })[];
  progress: { id: string; progress: number; total: number; completed: number; color: string }[];
  workspaceId: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Progress across active initiatives.</CardDescription>
        </div>
        <ProjectDialog workspaceId={workspaceId}>
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> New project</Button>
        </ProjectDialog>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const item = progress.find((entry) => entry.id === project.id);
          return (
            <Link key={project.id} href={`/projects/${project.id}`} className="rounded-lg border p-4 transition hover:-translate-y-1 hover:shadow-panel">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                </div>
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: project.color }} />
              </div>
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item?.completed ?? 0}/{item?.total ?? 0} done</span>
                  <span>{item?.progress ?? 0}%</span>
                </div>
                <Progress value={item?.progress ?? 0} />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Due {project.dueDate ? format(project.dueDate, "MMM d") : "when ready"}
              </p>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
