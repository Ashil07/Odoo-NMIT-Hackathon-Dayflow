// live feed. one long-lived sse stream per tab, pushed the moment data moves.
import { errorResponse, requireUser } from "@/lib/auth";
import { since, subscribe, type LiveEvent } from "@/lib/realtime";

// proxies drop idle sockets. a comment line every 25s keeps ours warm
const HEARTBEAT_MS = 25_000;

export async function GET(req: Request) {
  try {
    const me = await requireUser();
    const tab = new URL(req.url).searchParams.get("tab") ?? "";
    const lastSeen = Number(req.headers.get("last-event-id") ?? 0) || 0;

    // hr hears the whole org, an employee only hears their own rows
    const visible = (ev: LiveEvent) => me.role === "HR_ADMIN" || !ev.userId || ev.userId === me.id;

    const encoder = new TextEncoder();
    let beat: ReturnType<typeof setInterval> | null = null;
    let unsub: (() => void) | null = null;

    const stream = new ReadableStream({
      start(controller) {
        const send = (chunk: string) => {
          try {
            controller.enqueue(encoder.encode(chunk));
          } catch {
            stop();
          }
        };
        const push = (ev: LiveEvent) => {
          if (!visible(ev)) return;
          const body = JSON.stringify({ topic: ev.topic, self: !!tab && ev.origin === tab });
          send(`id: ${ev.id}\nevent: ${ev.topic}\ndata: ${body}\n\n`);
        };

        // reconnect fast, and hand back anything missed while the socket was down
        send("retry: 1500\n\n");
        if (lastSeen) since(lastSeen).forEach(push);

        unsub = subscribe(push);
        beat = setInterval(() => send(":\n\n"), HEARTBEAT_MS);
        req.signal.addEventListener("abort", stop);
      },
      cancel: () => stop(),
    });

    function stop() {
      if (beat) clearInterval(beat);
      beat = null;
      unsub?.();
      unsub = null;
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        // nginx and friends must not buffer a live stream
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
