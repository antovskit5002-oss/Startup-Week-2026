import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { ArrowUp, Camera, Image as ImageIcon, Leaf, Radio, X } from "lucide-react";
import { threadQuery } from "@/lib/queries";
import { sendChatMessage } from "@/lib/plants.functions";
import { ActionCard } from "@/components/ActionCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/assistant/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  return <ChatWindow key={threadId} threadId={threadId} />;
}

const SUGGESTIONS = [
  "Why are my leaves turning yellow?",
  "Does my plant need water?",
  "Is my plant receiving enough sunlight?",
  "Why is the soil always wet?",
  "Is my plant healthy?",
  "What should I change to improve its growth?",
];

async function toDataUrl(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

function ChatWindow({ threadId }: { threadId: string }) {
  const { data } = useQuery(threadQuery(threadId));
  const send = useServerFn(sendChatMessage);
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [pending, setPending] = useState<{ text: string; image: string | null } | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    taRef.current?.focus();
  }, [pending]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length, pending]);

  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  const plant = data.thread.plants;
  const hasDevice = !!plant?.devices;

  async function submit(q?: string) {
    const msg = (q ?? text).trim();
    if ((!msg && !image) || pending) return;
    setPending({ text: msg, image });
    setText("");
    const img = image;
    setImage(null);
    try {
      await send({ data: { threadId, text: msg, imageDataUrl: img } });
    } catch (e) {
      toast.error((e as Error).message);
      setText(msg);
      setImage(img);
    }
    await qc.invalidateQueries({ queryKey: ["thread", threadId] });
    await qc.invalidateQueries({ queryKey: ["threads"] });
    setPending(null);
  }

  const actionsByMsg = data.actions;

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col rounded-3xl border bg-card">
      <div className="flex items-center gap-3 border-b px-5 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <Leaf className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold">Fern {plant ? `· ${plant.name}` : ""}</p>
          {hasDevice ? (
            <p className="flex items-center gap-1.5 text-xs text-primary">
              <Radio className="h-3 w-3 animate-live" />
              Analyzing your plant using live sensor data.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Camera className="h-3 w-3" />
              Analyzing your plant using photo analysis and plant care information.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {!data.messages.length && !pending && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="rounded-full border px-3 py-1.5 text-sm hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {data.messages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.content} image={m.imageUrl} />
        ))}
        {pending && (
          <>
            <Bubble
              role="user"
              text={pending.text || "Please analyze this photo of my plant."}
              image={pending.image ?? undefined}
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-live" />
              {hasDevice ? "Reading sensors and analyzing…" : "Analyzing…"}
            </div>
          </>
        )}
        {actionsByMsg.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Suggested device actions
            </p>
            {actionsByMsg.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t p-3"
      >
        {image && (
          <div className="relative mb-2 inline-block">
            <img src={image} alt="Selected plant" className="h-20 rounded-lg object-cover" />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => setImage(null)}
              className="absolute -right-2 -top-2 rounded-full bg-foreground p-0.5 text-background"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border bg-background p-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setImage(await toDataUrl(f));
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Add photo"
            onClick={() => fileRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask about your plant…"
            className="max-h-40 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full"
            disabled={!!pending || (!text.trim() && !image)}
            aria-label="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ role, text, image }: { role: string; text: string; image?: string | undefined }) {
  if (role === "user") {
    return (
      <div className="ml-auto max-w-[80%] space-y-2">
        {image && (
          <img
            src={image}
            alt="Plant photo"
            className="ml-auto max-h-60 rounded-2xl object-cover"
          />
        )}
        <div className="rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-[90%] text-sm leading-relaxed [&_li]:ml-5 [&_li]:list-disc [&_p]:my-2 [&_strong]:font-semibold">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
