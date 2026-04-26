"use client";

import { DndContext, DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskStatus } from "@prisma/client";
import { format } from "date-fns";
import { GripVertical, MessageCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { moveTask } from "@/lib/actions";
import { ProjectWithRelations, TaskWithRelations, MemberWithUser } from "@/components/board/project-workspace";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const columns = [
  { id: TaskStatus.TODO, title: "Todo" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress" },
  { id: TaskStatus.REVIEW, title: "Review" },
  { id: TaskStatus.DONE, title: "Done" }
];

export function KanbanBoard({ project, tasks, members }: { project: ProjectWithRelations; tasks: TaskWithRelations[]; members: MemberWithUser[] }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [localTasks, setLocalTasks] = useState(tasks);
  const [, startTransition] = useTransition();

  useEffect(() => setLocalTasks(tasks), [tasks]);

  function onDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) return;

    const targetStatus = Object.values(TaskStatus).includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : localTasks.find((task) => task.id === overId)?.status;

    if (!targetStatus) return;
    const position = localTasks.filter((task) => task.status === targetStatus).length;

    setLocalTasks((current) => current.map((task) => (task.id === activeId ? { ...task, status: targetStatus, position } : task)));
    startTransition(async () => {
      await moveTask(activeId, targetStatus, position);
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn key={column.id} id={column.id} title={column.title} tasks={localTasks.filter((task) => task.status === column.id)} project={project} members={members} />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({ id, title, tasks, project, members }: { id: TaskStatus; title: string; tasks: TaskWithRelations[]; project: ProjectWithRelations; members: MemberWithUser[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section ref={setNodeRef} className={cn("min-h-96 rounded-lg border bg-card p-3 shadow-panel transition", isOver && "ring-2 ring-primary")}>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="font-semibold">{title}</h2>
        <span className="rounded-sm bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} project={project} members={members} />
          ))}
          {!tasks.length ? <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Drop work here.</div> : null}
        </div>
      </SortableContext>
    </section>
  );
}

function TaskCard({ task, project, members }: { task: TaskWithRelations; project: ProjectWithRelations; members: MemberWithUser[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("rounded-lg border bg-background p-4 shadow-sm transition", isDragging && "rotate-1 opacity-70 shadow-soft")}
    >
      <div className="flex items-start gap-2">
        <button className="mt-0.5 text-muted-foreground" {...attributes} {...listeners} aria-label="Drag task">
          <GripVertical className="h-4 w-4" />
        </button>
        <TaskDialog project={project} members={members} task={task}>
          <button className="min-w-0 flex-1 text-left">
            <p className="font-semibold leading-5">{task.title}</p>
            {task.description ? <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{task.description}</p> : null}
          </button>
        </TaskDialog>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className={priorityClass(task.priority)}>{task.priority}</Badge>
        {task.labels.map(({ label }) => (
          <Badge key={label.id} style={{ borderColor: label.color, color: label.color }}>{label.name}</Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{task.dueDate ? format(task.dueDate, "MMM d") : "No due date"}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {task.comments.length}</span>
          <Avatar className="h-7 w-7">
            <AvatarImage src={task.assignee?.image ?? undefined} />
            <AvatarFallback name={task.assignee?.name} />
          </Avatar>
        </div>
      </div>
    </div>
  );
}

function priorityClass(priority: string) {
  if (priority === "URGENT") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "HIGH") return "border-amber-200 bg-amber-50 text-amber-700";
  if (priority === "MEDIUM") return "border-lime-200 bg-lime-50 text-lime-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}
