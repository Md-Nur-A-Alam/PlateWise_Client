"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { notify } from "@/lib/notify";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Utensils } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isLoading, setIsLoading] = React.useState(false);
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleLoginSuccess = () => {
    notify.success("Logged in successfully!");
    router.push(callbackUrl);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (error) {
        notify.error(error.message || "Invalid credentials");
      } else {
        handleLoginSuccess();
      }
    } catch (err) {
      notify.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: "demo@platewise.com",
        password: "DemoPassword123!",
      });

      if (error) {
        notify.error("Demo login failed: " + error.message);
      } else {
        handleLoginSuccess();
      }
    } catch (err) {
      notify.error("An unexpected error occurred");
    } finally {
      setIsDemoLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
      if (error) {
        notify.error("Google login error: " + error.message);
      }
    } catch (err) {
      notify.error("Failed to initialize Google login. Check environment variables.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Utensils className="w-6 h-6 text-primary" /> Welcome Back
          </h1>
          <p className="text-sm text-neutral-foreground mt-2">
            Log in to manage your recipes.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            placeholder="********"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Log In
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border"></div>
          <span className="px-3 text-sm text-neutral-foreground">OR</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onDemoLogin}
            isLoading={isDemoLoading}
            disabled={isLoading || isGoogleLoading}
          >
            Demo Login (Evaluator)
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={onGoogleLogin}
            isLoading={isGoogleLoading}
            disabled={isLoading || isDemoLoading}
          >
            Sign in with Google
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex justify-center py-12">Loading...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
