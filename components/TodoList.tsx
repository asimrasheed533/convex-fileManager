"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TodoList() {
  const todos = useQuery(api.todo.getTodo);

  if (todos === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-96  gap-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (todos?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96  gap-4">
        <div className="text-2xl font-semibold text-muted-foreground">
          No task yet
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-96  gap-2">
      {todos?.map((todo) => (
        <>
          <div
            className="ile:text-foreground placeholder:text-muted-foreground max-w-2xl min-w-2xl bg-blue-50 dark:bg-input/30 p-2 rounded"
            key={todo._id}
          >
            {todo.task}
          </div>
        </>
      ))}
    </div>
  );
}
