"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
        callbackUrl: searchParams.get("callbackUrl") ?? "/dashboard"
      });

      if (result?.error) {
        setError("Sign-in failed. Use exactly kay@example.com / password123.");
        return;
      }

      router.push(result?.url ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <motion.div className="relative z-10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <Card className="neon-panel overflow-hidden">
        <div className="h-1 neon-line" />
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-lime-50">Enter the control room</CardTitle>
          <CardDescription className="text-lime-50/60">Demo login auto-prepares the workspace if seed data is missing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lime-50">Email</Label>
              <Input id="email" name="email" type="email" defaultValue="kay@example.com" required className="border-lime-200/20 bg-white/[0.08] text-lime-50 placeholder:text-lime-50/40 focus-visible:ring-lime-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-lime-50">Password</Label>
              <Input id="password" name="password" type="password" defaultValue="password123" required className="border-lime-200/20 bg-white/[0.08] text-lime-50 placeholder:text-lime-50/40 focus-visible:ring-lime-300" />
            </div>
            {error ? <p className="rounded-md border border-red-300/30 bg-red-500/12 px-3 py-2 text-sm text-red-100">{error}</p> : null}
            <Button className="h-12 w-full text-base" type="submit" disabled={isPending}>
              {isPending ? "Opening workspace..." : "Launch dashboard"}
            </Button>
          </form>
          <div className="mt-5 rounded-lg border border-lime-200/[0.12] bg-white/[0.06] p-3 text-xs leading-5 text-lime-50/60">
            Demo credentials: <span className="font-semibold text-lime-50">kay@example.com</span> / <span className="font-semibold text-lime-50">password123</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
