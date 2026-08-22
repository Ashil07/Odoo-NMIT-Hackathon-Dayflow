"use client";

// session + server state. auth lives in an httpOnly cookie; role comes from
// the db via /api/auth/me. every mutation hits a role-checked route, then
// reloads. no role or permission is trusted from this file.

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dayspan, type Payroll } from "@/lib/dayflow";
import { fmtDay, hhmm } from "@/lib/format";
import type { LeaveRow, LogRow, Me, Person } from "@/lib/types";

export type Role = "EMPLOYEE" | "HR_ADMIN";
export type LeaveType = "Paid" | "Sick" | "Unpaid";
export type ProfileTab = "resume" | "private" | "salary" | "settings";
export type Toast = { id: number; text: string; kind: "good" | "bad" };
export type WageRow = { id: string; empId: string; name: string; title: string; dept: string; wage: number };

// this tab's id. rides on every write so the live feed can skip our own echo
const TAB_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);

export type Topic = "leave" | "attendance" | "payroll" | "profile";
const TOPICS: Topic[] = ["leave", "attendance", "payroll", "profile"];

// fetch wrapper. throws the server's error text.
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "x-dayflow-tab": TAB_ID };
  if (init?.body) headers["Content-Type"] = "application/json";
  const res = await fetch(path, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Store = {
  me: Me | null;
  loading: boolean;
  authed: boolean;
  isEmp: boolean;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;

  // true while the push feed is connected. drives the header dot
  live: boolean;

  clock: string;

  // punch clock: 0 not in, 1 in, 2 done — derived from today's server row
  checked: 0 | 1 | 2;
  inAt: string | null;
  outAt: string | null;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;

  myLog: LogRow[];
  range: "week" | "month";
  setRange: (r: "week" | "month") => void;

  requests: LeaveRow[];
  decide: (id: string, status: "Approved" | "Rejected", comment?: string) => Promise<void>;
  submitLeave: () => Promise<void>;

  people: Person[];
  registerDate: string;
  stepRegisterDay: (dir: number) => Promise<void>;

  leaveOpen: boolean;
  openLeave: () => void;
  closeLeave: () => void;
  leaveType: LeaveType;
  setLeaveType: (t: LeaveType) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  remarks: string;
  setRemarks: (v: string) => void;
  leaveDays: number;
  attach: boolean;
  toggleAttach: () => void;

  bellOpen: boolean;
  toggleBell: () => void;
  closeBell: () => void;

  search: string;
  setSearch: (v: string) => void;

  selected: string | null;
  select: (id: string | null) => void;

  tab: ProfileTab;
  setTab: (t: ProfileTab) => void;

  // payroll editor (hr). wage mirrors whichever employee is targeted.
  payrollList: WageRow[];
  payrollTarget: WageRow | null;
  choosePayrollTarget: (id: string) => void;
  wage: string;
  setWage: (v: string) => void;
  saveWage: () => Promise<void>;

  myPayroll: Payroll | null;
  myWage: number;

  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  saveProfile: () => Promise<void>;

  toasts: Toast[];
  toast: (text: string, kind?: "good" | "bad") => void;
};

const Ctx = createContext<Store | null>(null);

export function DayflowProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const roleRef = useRef<Role | null>(null);
  const [clock, setClock] = useState("--:--");

  const [myLog, setMyLog] = useState<LogRow[]>([]);
  const [myPayroll, setMyPayroll] = useState<Payroll | null>(null);
  const [requests, setRequests] = useState<LeaveRow[]>([]);
  const [range, setRange] = useState<"week" | "month">("week");

  const [people, setPeople] = useState<Person[]>([]);
  const [registerDate, setRegisterDate] = useState("");
  const registerDayRef = useRef<string | null>(null);
  const [payrollList, setPayrollList] = useState<WageRow[]>([]);
  const [payrollTargetId, setPayrollTargetId] = useState<string | null>(null);
  const targetRef = useRef<string | null>(null);
  const [wage, setWageState] = useState("50000");

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("Paid");
  const [from, setFrom] = useState(isoToday());
  const [to, setTo] = useState(isoToday());
  const [remarks, setRemarks] = useState("");
  const [attach, setAttach] = useState(false);

  const [bellOpen, setBellOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState<ProfileTab>("resume");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  // clock ticks client-side only, keeps hydration honest
  useEffect(() => {
    const tick = () => setClock(hhmm());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const toast = useCallback((text: string, kind: "good" | "bad" = "good") => {
    const id = ++seq.current;
    setToasts((list) => [...list, { id, text, kind }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3000);
  }, []);

  // one pull per slice. a live nudge refreshes only what actually moved
  const pullMe = useCallback(async (): Promise<Me> => {
    const { me } = await api<{ me: Me }>("/api/auth/me");
    roleRef.current = me.role;
    setMe(me);
    setPhone(me.profile.phone);
    setAddress(me.profile.address);
    return me;
  }, []);

  const pullRequests = useCallback(async () => {
    const path = roleRef.current === "HR_ADMIN" ? "/api/leave" : "/api/leave/me";
    const d = await api<{ requests: LeaveRow[] }>(path);
    setRequests(d.requests);
  }, []);

  const pullAttendance = useCallback(async () => {
    const d = await api<{ log: LogRow[] }>("/api/attendance/me");
    setMyLog(d.log);
  }, []);

  const pullMyPayroll = useCallback(async () => {
    const d = await api<{ payroll: Payroll }>("/api/payroll/me");
    setMyPayroll(d.payroll);
  }, []);

  // hr only. the register follows whichever day is on screen
  const pullRegister = useCallback(async () => {
    if (roleRef.current !== "HR_ADMIN") return;
    const d = await api<{ people: Person[]; today: string }>(
      registerDayRef.current ? `/api/people?day=${registerDayRef.current}` : "/api/people",
    );
    setPeople(d.people);
    setRegisterDate(fmtDay(new Date(d.today)));
    registerDayRef.current = new Date(d.today).toISOString().slice(0, 10);
  }, []);

  // hr only. wage book, keeps the editor pointed at the same employee
  const pullWageBook = useCallback(async () => {
    if (roleRef.current !== "HR_ADMIN") return;
    const d = await api<{ list: WageRow[] }>("/api/payroll");
    setPayrollList(d.list);
    const id = targetRef.current ?? d.list.find((w) => w.empId === "OIAARA20230012")?.id ?? d.list[0]?.id ?? null;
    targetRef.current = id;
    setPayrollTargetId(id);
    const row = d.list.find((w) => w.id === id);
    if (row) setWageState(String(row.wage));
  }, []);

  // boot: who am i, then pull my slice of the world
  const reload = useCallback(async () => {
    try {
      const me = await pullMe();

      // temp-password users are locked to change-password; skip their data
      if (me.mustChangePassword) return;

      // one slow slice must not look like a dead session
      await Promise.allSettled([pullRequests(), pullAttendance(), pullMyPayroll(), pullRegister(), pullWageBook()]);
    } catch {
      roleRef.current = null;
      setMe(null);
      // dead token (version bumped, logout elsewhere): clear the cookie so
      // the proxy stops bouncing us between / and /dashboard
      await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      setLoading(false);
    }
  }, [pullMe, pullRequests, pullAttendance, pullMyPayroll, pullRegister, pullWageBook]);

  // targeted refetch. the only thing a push event or a write triggers
  const refresh = useCallback(
    async (topics: Topic[]) => {
      const want = new Set(topics);
      const jobs: Promise<unknown>[] = [];
      if (want.has("leave")) {
        jobs.push(pullRequests());
        // an approval flips someone to on-leave in the register
        jobs.push(pullRegister());
      }
      if (want.has("attendance")) {
        jobs.push(pullAttendance());
        jobs.push(pullRegister());
      }
      if (want.has("payroll")) {
        jobs.push(pullMyPayroll());
        jobs.push(pullWageBook());
      }
      if (want.has("profile")) {
        jobs.push(pullMe());
        // a roster add or edit lands in the register and the wage book
        jobs.push(pullRegister());
        jobs.push(pullWageBook());
      }
      await Promise.allSettled(jobs);
    },
    [pullRequests, pullAttendance, pullMyPayroll, pullRegister, pullWageBook, pullMe],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one fetch on mount, state lands after await
    void reload();
  }, [reload]);

  // live feed. server pushes the moment anything moves, we refetch just that slice
  const authedId = me && !me.mustChangePassword ? me.id : null;
  useEffect(() => {
    if (!authedId || typeof window === "undefined" || typeof EventSource === "undefined") return;

    let source: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let fails = 0;
    let gone = false;
    const pending = new Set<Topic>();

    // bursts collapse into one refetch per slice
    const flush = () => {
      flushTimer = null;
      if (!pending.size) return;
      const topics = [...pending];
      pending.clear();
      void refresh(topics);
    };
    const queue = (topic: Topic) => {
      pending.add(topic);
      if (!flushTimer) flushTimer = setTimeout(flush, 60);
    };

    // only used if the stream cannot hold. slow on purpose
    const startPoll = () => {
      if (poll || gone) return;
      poll = setInterval(() => {
        if (document.visibilityState === "visible") void refresh(TOPICS);
      }, 15_000);
    };
    const stopPoll = () => {
      if (poll) clearInterval(poll);
      poll = null;
    };

    const open = () => {
      if (gone) return;
      source = new EventSource(`/api/events?tab=${TAB_ID}`);
      source.onopen = () => {
        fails = 0;
        stopPoll();
        setLive(true);
      };
      const onEvent = (e: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(e.data) as { topic: Topic; self?: boolean };
          // our own write already refetched. no second round trip
          if (!msg.self) queue(msg.topic);
        } catch {
          void refresh(TOPICS);
        }
      };
      for (const t of TOPICS) source.addEventListener(t, onEvent as EventListener);
      source.onerror = () => {
        setLive(false);
        fails += 1;
        // the browser retries on its own. after a few misses, fall back to polling
        if (fails >= 4) {
          source?.close();
          source = null;
          startPoll();
        }
      };
    };

    // coming back to the tab: reopen if we gave up, and catch up either way
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!source) {
        fails = 0;
        open();
      }
      void refresh(TOPICS);
    };

    open();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      gone = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (flushTimer) clearTimeout(flushTimer);
      stopPoll();
      source?.close();
      setLive(false);
    };
  }, [authedId, refresh]);

  // pick whose structure the editor shows; wage follows the pick
  const choosePayrollTarget = useCallback(
    (id: string) => {
      targetRef.current = id;
      setPayrollTargetId(id);
      const row = payrollList.find((w) => w.id === id);
      if (row) setWageState(String(row.wage));
    },
    [payrollList],
  );

  // today's punch state falls out of the log's top row
  const todayKey = useMemo(() => fmtDay(new Date()), []);
  const todayRow = myLog.find((r) => r.day === todayKey);
  const checked: 0 | 1 | 2 = !todayRow || todayRow.in === "—" ? 0 : todayRow.out !== "—" ? 2 : 1;
  const inAt = todayRow && todayRow.in !== "—" ? todayRow.in : null;
  const outAt = todayRow && todayRow.out !== "—" ? todayRow.out : null;

  const signOut = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    roleRef.current = null;
    setMe(null);
    router.push("/");
  }, [router]);

  const checkIn = useCallback(async () => {
    try {
      await api("/api/attendance/check-in", { method: "POST" });
      toast("Checked in at " + hhmm());
      await refresh(["attendance"]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Check-in failed", "bad");
    }
  }, [toast, refresh]);

  // walk the register across weekdays, refetch for that day
  const stepRegisterDay = useCallback(
    async (dir: number) => {
      if (!registerDayRef.current) return;
      const cur = new Date(registerDayRef.current + "T00:00:00");
      const next = new Date(cur);
      do {
        next.setDate(next.getDate() + dir);
      } while (next.getDay() === 0 || next.getDay() === 6);
      const iso = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
      registerDayRef.current = iso;
      try {
        const d = await api<{ people: Person[]; today: string }>(`/api/people?day=${iso}`);
        setPeople(d.people);
        setRegisterDate(fmtDay(new Date(d.today)));
      } catch (e) {
        toast(e instanceof Error ? e.message : "Could not load day", "bad");
      }
    },
    [toast],
  );

  const checkOut = useCallback(async () => {
    try {
      const d = await api<{ outAt: string; hrs: string }>("/api/attendance/check-out", { method: "POST" });
      toast("Checked out at " + d.outAt + " · " + d.hrs + "h");
      await refresh(["attendance"]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Check-out failed", "bad");
    }
  }, [toast, refresh]);

  const leaveDays = useMemo(() => dayspan(from, to), [from, to]);

  const submitLeave = useCallback(async () => {
    try {
      await api("/api/leave", {
        method: "POST",
        body: JSON.stringify({ type: leaveType, from, to, remarks, attach }),
      });
      setLeaveOpen(false);
      setRemarks("");
      toast("Request sent to " + (me?.profile.manager ?? "your manager"));
      await refresh(["leave"]);
      router.push("/time-off");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not send request", "bad");
    }
  }, [leaveType, from, to, remarks, attach, me, toast, refresh, router]);

  const decide = useCallback(
    async (id: string, status: "Approved" | "Rejected", comment = "") => {
      try {
        await api(`/api/leave/${id}/decide`, {
          method: "POST",
          body: JSON.stringify({ status, comment }),
        });
        toast("Request " + status.toLowerCase());
        await refresh(["leave", "payroll"]);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Decision failed", "bad");
      }
    },
    [toast, refresh],
  );

  // digits only, feeds the payroll maths
  const setWage = useCallback((v: string) => setWageState(v.replace(/[^0-9]/g, "")), []);

  const saveWage = useCallback(async () => {
    if (!payrollTargetId) return;
    try {
      await api(`/api/payroll/${payrollTargetId}`, {
        method: "PATCH",
        body: JSON.stringify({ monthlyWage: Number(wage) || 0 }),
      });
      toast("Salary structure saved");
      await refresh(["payroll"]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed", "bad");
    }
  }, [payrollTargetId, wage, toast, refresh]);

  const saveProfile = useCallback(async () => {
    try {
      await api("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ phone, address }),
      });
      toast("Profile updated");
      await refresh(["profile"]);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Save failed", "bad");
    }
  }, [phone, address, toast, refresh]);

  const payrollTarget = useMemo(
    () => payrollList.find((w) => w.id === payrollTargetId) ?? null,
    [payrollList, payrollTargetId],
  );

  const value: Store = {
    me,
    loading,
    authed: !!me,
    isEmp: me?.role === "EMPLOYEE",
    signOut,
    reload,
    live,
    clock,
    checked,
    inAt,
    outAt,
    checkIn,
    checkOut,
    myLog,
    range,
    setRange,
    requests,
    decide,
    submitLeave,
    people,
    registerDate,
    stepRegisterDay,
    leaveOpen,
    openLeave: () => setLeaveOpen(true),
    closeLeave: () => setLeaveOpen(false),
    leaveType,
    setLeaveType,
    from,
    setFrom,
    to,
    setTo,
    remarks,
    setRemarks,
    leaveDays,
    attach,
    toggleAttach: () => setAttach((a) => !a),
    bellOpen,
    toggleBell: () => setBellOpen((b) => !b),
    closeBell: () => setBellOpen(false),
    search,
    setSearch,
    selected,
    select: setSelected,
    tab,
    setTab,
    payrollList,
    payrollTarget,
    choosePayrollTarget,
    wage,
    setWage,
    saveWage,
    myPayroll,
    myWage: me?.profile.monthlyWage ?? 0,
    phone,
    setPhone,
    address,
    setAddress,
    saveProfile,
    toasts,
    toast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDayflow(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDayflow must sit inside DayflowProvider");
  return ctx;
}
