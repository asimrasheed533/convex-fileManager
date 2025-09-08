import CreateTodo from "@/components/CreateTodo";
import TodoList from "@/components/TodoList";
import React from "react";

export default function page() {
  return (
    <>
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
        <div>
          <CreateTodo />
          <TodoList />
        </div>
      </div>
    </>
  );
}
