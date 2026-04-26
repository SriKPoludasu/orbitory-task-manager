"use client";

import { Priority, TaskStatus } from "@prisma/client";
import { format } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { createComment, deleteTask, upsertTask } from "@/lib/actions";
import { ProjectWithRelations, TaskWithRelations, MemberWithUser } from "@/components/board/project-workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TaskDialog({
  children,
  project,
  members,
  task
}: {
  children: React.ReactNode;
  project: ProjectWithRelations;
  members: MemberWithUser[];
  task?: TaskWithRelations;
}) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    const labelIds = formData.getAll("labelIds").map(String);
    startTransition(async () => {
      await upsertTask(project.id, {
        id: task?.id,
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority") ?? Priority.MEDIUM,
        status: formData.get("status") ?? TaskStatus.TODO,
        dueDate: formData.get("dueDate") || undefined,
        assigneeId: formData.get("assigneeId") || undefined,
        labelIds
      });
      setOpen(false);
    });
  }

  function onDelete() {
    if (!task) return;
    startTransition(async () => {
      await deleteTask(task.id);
      setOpen(false);
    });
  }

  function onComment() {
    if (!task || !comment.trim()) return;
    startTransition(async () => {
      await createComment(task.id, comment);
      setComment("");
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Create task"}</DialogTitle>
          <DialogDescription>{task ? "Update details, ownership, and discussion." : "Add clear next work for the team."}</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input id="task-title" name="title" defaultValue={task?.title ?? ""} placeholder="Review onboarding analytics" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea id="task-description" name="description" defaultValue={task?.description ?? ""} placeholder="Context, acceptance criteria, and links." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldSelect label="Status" name="status" defaultValue={task?.status ?? TaskStatus.TODO} values={Object.values(TaskStatus)} />
            <FieldSelect label="Priority" name="priority" defaultValue={task?.priority ?? Priority.MEDIUM} values={Object.values(Priority)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input id="task-due" name="dueDate" type="date" defaultValue={task?.dueDate ? format(task.dueDate, "yyyy-MM-dd") : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assignee</Label>
              <select id="task-assignee" name="assigneeId" defaultValue={task?.assigneeId ?? ""} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>{member.user.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              {project.labels.map((label) => {
                const checked = task?.labels.some((item) => item.labelId === label.id);
                return (
                  <label key={label.id} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <input type="checkbox" name="labelIds" value={label.id} defaultChecked={checked} />
                    <span style={{ color: label.color }}>{label.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            {task ? (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            ) : <span />}
            <Button disabled={isPending}>{isPending ? "Saving..." : "Save task"}</Button>
          </div>
        </form>

        {task ? (
          <section className="mt-2 border-t pt-4">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4" /> Comments
            </div>
            <div className="space-y-3">
              {task.comments.length ? (
                task.comments.map((item) => (
                  <div key={item.id} className="flex gap-3 rounded-lg bg-muted/45 p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.author.image ?? undefined} />
                      <AvatarFallback name={item.author.name} />
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{item.author.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Start the thread with the first note.</div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" />
              <Button type="button" onClick={onComment} disabled={isPending}>Post</Button>
            </div>
          </section>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FieldSelect({ label, name, defaultValue, values }: { label: string; name: string; defaultValue: string; values: string[] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
        {values.map((value) => (
          <option key={value} value={value}>{value.replace("_", " ")}</option>
        ))}
      </select>
    </div>
  );
}
