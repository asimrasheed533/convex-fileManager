"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const signupMutation = useMutation(api.user.signup);

  return (
    <Card className="w-full shadow-lg border-0 bg-muted backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold">
          {isSignUp ? "Create Account" : "Sign In"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Create your workspace and start collaborating"
            : "Enter your credentials to access your workspace"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-amber-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 border-amber-50"
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="tenant">Workspace Name</Label>
              <Input
                id="tenant"
                type="text"
                placeholder="Your Company"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-amber-50"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700"
          >
            {isSignUp ? "Create Workspace" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
