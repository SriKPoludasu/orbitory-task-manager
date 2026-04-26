"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function Avatar({ className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>) {
  return <AvatarPrimitive.Root className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-md", className)} {...props} />;
}

export function AvatarImage(props: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image className="aspect-square h-full w-full object-cover" {...props} />;
}

export function AvatarFallback({ className, name, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & { name?: string | null }) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#1a1f12,#34391c)] text-lime-100 ring-1 ring-lime-200/20",
        className
      )}
      {...props}
    >
      <UserRound className="h-1/2 w-1/2" aria-label={name ?? "User"} />
    </AvatarPrimitive.Fallback>
  );
}
