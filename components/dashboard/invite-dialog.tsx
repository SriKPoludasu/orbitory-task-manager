"use client";

import { WorkspaceRole } from "@prisma/client";
import { UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { inviteMember } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteDialog({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await inviteMember(workspaceId, {
        email: formData.get("email"),
        role: formData.get("role") ?? WorkspaceRole.MEMBER
      });
      setMessage("Invite created. Wire an email provider to send it automatically.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite teammate</DialogTitle>
          <DialogDescription>Add collaborators with role-based workspace access.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" name="email" type="email" placeholder="teammate@company.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select id="invite-role" name="role" className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value={WorkspaceRole.MEMBER}>Member</option>
              <option value={WorkspaceRole.ADMIN}>Admin</option>
              <option value={WorkspaceRole.VIEWER}>Viewer</option>
            </select>
          </div>
          <Button className="w-full" disabled={isPending}>{isPending ? "Inviting..." : "Create invite"}</Button>
        </form>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </DialogContent>
    </Dialog>
  );
}
