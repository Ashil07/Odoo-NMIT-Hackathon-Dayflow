// live bus. mutations publish here, the sse route fans out. one per process.
import { EventEmitter } from "node:events";

export type Topic = "leave" | "attendance" | "payroll" | "profile";

export type LiveEvent = {
  id: number;
  topic: Topic;
  // tab that caused it, so that tab can skip its own echo
  origin?: string;
  // who the change is about. employees only hear their own rows
  userId?: string;
};

// keep a short tail so a reconnect can replay what it missed
const BACKLOG = 128;

type Bus = { emitter: EventEmitter; seq: number; tail: LiveEvent[] };

const g = globalThis as unknown as { dayflowBus?: Bus };

function bus(): Bus {
  if (!g.dayflowBus) {
    const emitter = new EventEmitter();
    // one listener per open stream, no artificial ceiling
    emitter.setMaxListeners(0);
    g.dayflowBus = { emitter, seq: 0, tail: [] };
  }
  return g.dayflowBus;
}

// fire and forget. never throws into the request path
export function publish(topic: Topic, opts: { userId?: string; origin?: string } = {}): void {
  try {
    const b = bus();
    const ev: LiveEvent = { id: ++b.seq, topic, userId: opts.userId, origin: opts.origin };
    b.tail.push(ev);
    if (b.tail.length > BACKLOG) b.tail.shift();
    b.emitter.emit("ev", ev);
  } catch {
    // a dropped notification must never fail the mutation
  }
}

export function subscribe(fn: (ev: LiveEvent) => void): () => void {
  const b = bus();
  b.emitter.on("ev", fn);
  return () => b.emitter.off("ev", fn);
}

// everything after the id a reconnecting client last saw
export function since(id: number): LiveEvent[] {
  return bus().tail.filter((e) => e.id > id);
}

// tab id off a request, set by the client fetch wrapper
export function originOf(req: Request): string | undefined {
  return req.headers.get("x-dayflow-tab") ?? undefined;
}
