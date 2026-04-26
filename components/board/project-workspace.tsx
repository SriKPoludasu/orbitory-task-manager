"use client";

import { Label, Project, Task, TaskLabel, User, Workspace, WorkspaceMember } from "@prisma/client";
import { motion } from "framer-motion";
import { Archive, LayoutGrid, List, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { archiveCompleted } from "@/lib/actions";
import { useRealtime } from "@/hooks/use-realtime";
import { KanbanBoard } from "@/components/board/kanban-board";
import { TaskListView } from "@/components/board/task-list-view";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type TaskWithRelations = Task & {
  assignee: User | null;
  creator: User;
  comments: { id: string; body: string; createdAt: Date; author: User }[];
  labels: (TaskLabel & { label: Label })[];
};

export type ProjectWithRelations = Project & {
  workspace: Workspace;
  labels: Label[];
  tasks: TaskWithRelations[];
};

export type MemberWithUser = WorkspaceMember & { user: User };

export function ProjectWorkspace({ project, members }: { project: ProjectWithRelations; members: MemberWithUser[] }) {
  const router = useRouter();
  const [view, setView] = useState<"board" | "list">("board");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("ALL");
  const [assignee, setAssignee] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  useRealtime(`project-${project.id}`, "task:changed", () => router.refresh());
  useRealtime(`project-${project.id}`, "task:moved", () => router.refresh());
  useRealtime(`project-${project.id}`, "task:deleted", () => router.refresh());
  useRealtime(`project-${project.id}`, "comment:created", () => router.refresh());
  useRealtime(`project-${project.id}`, "task:archived", () => router.refresh());

  const filteredTasks = useMemo(() => {
    return project.tasks.filter((task) => {
      const matchesQuery =
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description ?? "").toLowerCase().includes(query.toLowerCase()) ||
        task.labels.some(({ label }) => label.name.toLowerCase().includes(query.toLowerCase()));
      const matchesPriority = priority === "ALL" || task.priority === priority;
      const matchesAssignee = assignee === "ALL" || task.assigneeId === assignee;
      return matchesQuery && matchesPriority && matchesAssignee;
    });
  }, [project.tasks, query, priority, assignee]);

  function archiveAction() {
    startTransition(async () => {
      await archiveCompleted(project.id);
    });
  }

  return (
    <div className="space-y-6">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border bg-card p-6 shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary">{project.workspace.name}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">{project.name}</h1>
            <p className="mt-2 text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TaskDialog project={project} members={members}>
              <Button>New task</Button>
            </TaskDialog>
            <Button variant="outline" onClick={archiveAction} disabled={isPending}>
              <Archive className="mr-2 h-4 w-4" /> Archive done
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-3 rounded-lg border bg-card p-4 shadow-panel lg:grid-cols-[1fr_150px_180px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tasks, notes, or labels" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="ALL">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
          <option value="ALL">All assignees</option>
          {members.map((member) => (
            <option key={member.userId} value={member.userId}>{member.user.name}</option>
          ))}
        </select>
        <div className="flex rounded-md border p-1">
          <Button variant={view === "board" ? "secondary" : "ghost"} size="sm" onClick={() => setView("board")}>
            <LayoutGrid className="mr-2 h-4 w-4" /> Board
          </Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}>
            <List className="mr-2 h-4 w-4" /> List
          </Button>
        </div>
      </section>

      {view === "board" ? (
        <KanbanBoard project={project} tasks={filteredTasks} members={members} />
      ) : (
        <TaskListView project={project} tasks={filteredTasks} members={members} />
      )}
    </div>
  );
}
