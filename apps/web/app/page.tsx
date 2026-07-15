"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6">
      <Authenticated>
        <UserButton />
        <Users />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </main>
  );
}

function Users() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="sm"
        onClick={() => {
          addUser({}).catch((error) => console.error(error));
        }}
      >
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
