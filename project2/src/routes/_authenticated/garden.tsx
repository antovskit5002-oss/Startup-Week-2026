import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Cpu, Droplets, Plus, Sprout } from "lucide-react";
import { plantsQuery } from "@/lib/queries";
import { createPlant } from "@/lib/plants.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/garden")({
  head: () => ({
    meta: [
      { title: "My garden — Smart Plant" },
      { name: "description", content: "Your plants and Smart Plant devices." },
    ],
  }),
  component: Garden,
});

function Garden() {
  const { data: plants, isLoading } = useQuery(plantsQuery);
  const qc = useQueryClient();
  const create = useServerFn(createPlant);
  const [busy, setBusy] = useState(false);

  async function addDemo() {
    setBusy(true);
    try {
      await create({
        data: {
          name: "Monty",
          species: "Monstera deliciosa",
          location: "Living room",
          withDevice: true,
          demo: true,
        },
      });
      await qc.invalidateQueries({ queryKey: ["plants"] });
      toast.success("Demo Smart Plant added with 7 days of sensor history");
    } catch (e) {
      toast.error((e as Error).message);
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">My garden</h1>
          <p className="mt-1 text-muted-foreground">Your plants and their Smart Plant devices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={addDemo} disabled={busy}>
            <Cpu className="h-4 w-4" />
            Add demo Smart Plant
          </Button>
          <AddPlantDialog />
        </div>
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !plants?.length ? (
        <div className="rounded-3xl border border-dashed p-16 text-center">
          <Sprout className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-semibold">No plants yet</h2>
          <p className="mt-2 text-muted-foreground">
            Add a plant, or try the demo Monstera with a simulated sensor pot.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((p) => (
            <Link
              key={p.id}
              to="/plants/$plantId"
              params={{ plantId: p.id }}
              className="group rounded-3xl border bg-card p-6 transition-shadow hover:shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{p.name}</h3>
                  <p className="text-sm italic text-muted-foreground">{p.species}</p>
                </div>
                {p.device ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    <span className="h-2 w-2 rounded-full bg-success animate-live" />
                    Device
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    Standalone
                  </span>
                )}
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-water" />
                {p.latest?.soil_moisture != null ? (
                  <span>
                    <b>{p.latest.soil_moisture}%</b> soil moisture
                  </span>
                ) : (
                  <span className="text-muted-foreground">No sensor data</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AddPlantDialog() {
  const qc = useQueryClient();
  const create = useServerFn(createPlant);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");
  const [withDevice, setWithDevice] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await create({ data: { name, species, location, withDevice } });
      await qc.invalidateQueries({ queryKey: ["plants"] });
      setOpen(false);
      setName("");
      setSpecies("");
      setLocation("");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusy(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4" />
          Add plant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a plant</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kitchen basil"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Species</Label>
            <Input
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="Leave blank — the assistant can identify it from a photo"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="South window"
            />
          </div>
          <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
            <span>
              <b>Connect a Smart Plant device</b>
              <br />
              <span className="text-muted-foreground">
                Simulated until your real device is ready
              </span>
            </span>
            <Switch checked={withDevice} onCheckedChange={setWithDevice} />
          </label>
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            Add plant
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
