"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";

export default function CreateTodo() {
  const createTodo = useMutation(api.todo.createTodo);
  const [todo, setTodo] = useState("");
  const [error, setError] = useState("");

  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await createTodo({
            task: todo,
          });
          if (!todo.trim()) {
            setError(" Please enter a task");
            return;
          }
          setTodo("");
          setError("");
        }}
        className="w-full flex gap-2 mt-5"
      >
        <Input
          type="text"
          placeholder="What are you planning to do?"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <Button type="submit">Add Todo</Button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </>
  );
}
