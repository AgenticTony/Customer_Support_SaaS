import { Button } from "@workspace/ui/components/button";
import { add } from "@workspace/math/add";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello from Widget</h1>
        <Button size="sm">Button</Button>
        <p className="text-muted-foreground">2 + 2 = {add(2, 2)}</p>
      </div>
    </div>
  );
}
