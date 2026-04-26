"use client";

import { useState } from "react";
import { createProject } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProjectDialog({ workspaceId, children }: { workspaceId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    await createProject(workspaceId, formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Give your team a focused place to plan the next outcome.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" name="name" placeholder="Signal Sprint" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea id="project-description" name="description" placeholder="What success looks like for this project." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-due">Due date</Label>
            <Input id="project-due" name="dueDate" type="date" />
          </div>
          <Button className="w-full" type="submit">Create project</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
