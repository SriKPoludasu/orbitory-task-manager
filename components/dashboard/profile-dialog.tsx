"use client";

import { Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { updateProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileDialog() {
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      await updateProfile({
        name: formData.get("name"),
        image: formData.get("image")
      });
      await update();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button><Settings className="mr-2 h-4 w-4" /> Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile settings</DialogTitle>
          <DialogDescription>Keep your identity clear for task ownership and comments.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" name="name" defaultValue={session?.user?.name ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-image">Avatar URL</Label>
            <Input id="profile-image" name="image" defaultValue={session?.user?.image ?? ""} />
          </div>
          <Button disabled={isPending}>{isPending ? "Saving..." : "Save profile"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
