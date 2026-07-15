"use client";

import { api } from "@workspace/backend/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <Button size="sm" onClick={() => void addUser({})}>
        Add user
      </Button>
      {users === undefined ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">No users yet</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {users.map((u) => (
            <li key={u._id}>{u.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
