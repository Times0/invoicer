import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/clients")({
  component: Clients,
});

function Clients() {
  return (
    <div className="flex-1">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your clients here</p>
        </div>
      </div>
    </div>
  );
}
