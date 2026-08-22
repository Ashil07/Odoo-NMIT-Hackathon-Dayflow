"use client";

// my own record. resume, private info, settings. salary tab is HR-only.
import { Field } from "@/components/app/bits";
import { CameraIcon, DocIcon } from "@/components/app/icons";
import { useDayflow, type ProfileTab } from "@/components/app/store";
import { DOCS } from "@/lib/dayflow";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "resume", label: "Resume" },
  { key: "private", label: "Private info" },
  { key: "settings", label: "Settings" },
];

const SKILLS = ["Interaction design", "Design systems", "Prototyping", "Motion"];

const CERTS = [
  ["Interaction Design Foundation · UX Certification", "2022"],
  ["NID Ahmedabad · M.Des Interaction Design", "2020"],
];

const JOB: [string, string][] = [
  ["Designation", "Product Designer"],
  ["Department", "Design"],
  ["Reports to", "Priya Nair"],
  ["Joined", "12 Mar 2023"],
  ["Location", "Bengaluru"],
  ["Employment", "Full-time"],
];

const BANK: [string, string][] = [
  ["Bank", "HDFC Bank"],
  ["Account", "•••• •••• 4471"],
  ["IFSC", "HDFC0001284"],
  ["PAN", "ABCPR•••4F"],
  ["UAN", "101234567890"],
  ["Nationality", "Indian"],
  ["Marital status", "Single"],
  ["Gender", "Male"],
];

const NOTIFS = [
  { on: true, title: "Leave decisions by email", note: "The moment Priya approves or rejects" },
  { on: true, title: "Missing check-out reminder", note: "19:30 on days you forget" },
  { on: false, title: "Weekly attendance digest", note: "Monday mornings" },
];

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 42,
        height: 25,
        borderRadius: 999,
        background: on ? "var(--df-indigo)" : "rgba(16,19,23,.14)",
        position: "relative",
        flex: "none",
        boxShadow: on ? "inset 0 1px 2px rgba(0,0,0,.14)" : undefined,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 19 : 2,
          width: 21,
          height: 21,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(16,19,23,.3)",
          transition: "left 160ms cubic-bezier(.23,1,.32,1)",
        }}
      />
    </span>
  );
}

export function Profile() {
  const s = useDayflow();
  // drawer reuses the salary tab, profile page never shows it
  const tab: ProfileTab = s.tab === "salary" ? "resume" : s.tab;

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))" }}>
      <div className="flex flex-col gap-4">
        <div className="df-card text-center" style={{ padding: 24 }}>
          <div className="relative mx-auto" style={{ width: 84, height: 84 }}>
            <div
              className="grid place-items-center rounded-full"
              style={{ width: 84, height: 84, background: "linear-gradient(160deg,#DDE3F6,#EAE5F8)", font: "500 28px/1 var(--font-geist-sans)", color: "var(--df-indigo)" }}
            >
              AR
            </div>
            <button
              type="button"
              aria-label="Change photo"
              onClick={() => s.toast("Photo upload opens the file picker")}
              className="grid place-items-center"
              style={{
                position: "absolute",
                right: -4,
                bottom: -4,
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "2px solid #fff",
                background: "var(--df-ink)",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(16,19,23,.3)",
              }}
            >
              <CameraIcon size={13} />
            </button>
          </div>
          <h3 style={{ margin: "16px 0 0", font: "600 19px/1.25 var(--font-geist-sans)", letterSpacing: "-.014em" }}>
            Aarav Rao
          </h3>
          <p style={{ margin: "5px 0 0", font: "400 13.5px/1.4 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
            Product Designer · Design
          </p>
          <div className="mt-4 flex justify-center gap-[7px]">
            <span className="df-mono" style={{ padding: "5px 11px", borderRadius: 999, background: "rgba(16,19,23,.05)", fontSize: 11.5, color: "var(--df-ink3)" }}>
              EMP-1042
            </span>
            <span
              style={{
                padding: "5px 11px",
                borderRadius: 999,
                background: "rgba(15,138,95,.1)",
                border: "1px solid rgba(15,138,95,.2)",
                font: "500 11.5px/1 var(--font-geist-sans)",
                color: "var(--df-green-lo)",
              }}
            >
              Active
            </span>
          </div>
        </div>

        <div className="df-card" style={{ padding: 22 }}>
          <p className="df-kicker" style={{ margin: "0 0 14px" }}>
            Documents
          </p>
          <div className="flex flex-col gap-[2px]">
            {DOCS.map((d) => (
              <div key={d.id} className="df-row flex items-center gap-[11px]" style={{ padding: 10, borderRadius: 11, borderTop: "none" }}>
                <span className="grid flex-none place-items-center" style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(16,19,23,.05)", color: "var(--df-ink4)" }}>
                  <DocIcon size={13} />
                </span>
                <span className="min-w-0 flex-1" style={{ font: "450 13px/1.3 var(--font-geist-sans)" }}>
                  {d.name}
                </span>
                <span className="df-mono flex-none" style={{ fontSize: 11.5, color: "var(--df-ink6)" }}>
                  {d.meta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="df-glass-thin flex gap-[3px]" style={{ padding: 4, borderRadius: 14 }}>
          {TABS.map((t) => (
            <button key={t.key} type="button" className="df-seg-btn" style={{ flex: 1, padding: "10px 12px", fontSize: 13 }} data-on={tab === t.key} onClick={() => s.setTab(t.key)}>
              {t.label}
            </button>
          ))}
          <span
            className="grid flex-1 place-items-center"
            style={{ padding: "10px 12px", font: "500 13px/1 var(--font-geist-sans)", color: "var(--df-ink6)", cursor: "not-allowed" }}
            title="HR only"
          >
            Salary info
          </span>
        </div>

        {tab === "resume" ? (
          <div className="df-card" style={{ padding: 24 }}>
            <h3 className="df-h3">About</h3>
            <p style={{ margin: "10px 0 0", maxWidth: "64ch", font: "400 14px/1.6 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
              Product designer on the People tooling team. I work on the attendance and time-off surfaces, and I care
              most about interfaces that ask for as little of someone’s attention as possible.
            </p>

            <div style={{ height: 1, background: "rgba(16,19,23,.07)", margin: "22px 0" }} />

            <div className="grid gap-[22px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
              <div>
                <h4 className="df-kicker" style={{ margin: "0 0 8px", fontSize: 11 }}>
                  What I love about my job
                </h4>
                <p style={{ margin: 0, font: "400 13.5px/1.6 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
                  Turning a policy document into three taps. Watching a support ticket disappear because the screen
                  finally explained itself.
                </p>
              </div>
              <div>
                <h4 className="df-kicker" style={{ margin: "0 0 8px", fontSize: 11 }}>
                  Interests and hobbies
                </h4>
                <p style={{ margin: 0, font: "400 13.5px/1.6 var(--font-geist-sans)", color: "var(--df-ink2)" }}>
                  Long-distance cycling on the Nandi Hills route, film photography, and slowly failing to learn the
                  mridangam.
                </p>
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(16,19,23,.07)", margin: "22px 0" }} />

            <h4 className="df-kicker" style={{ margin: "0 0 11px", fontSize: 11 }}>
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((sk) => (
                <span
                  key={sk}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 999,
                    background: "rgba(60,88,216,.09)",
                    border: "1px solid rgba(60,88,216,.18)",
                    font: "450 12.5px/1 var(--font-geist-sans)",
                    color: "var(--df-indigo-lo)",
                  }}
                >
                  {sk}
                </span>
              ))}
              <button
                type="button"
                onClick={() => s.toast("Skill picker lands with the real backend")}
                style={{
                  padding: "7px 13px",
                  borderRadius: 999,
                  background: "transparent",
                  border: "1px dashed rgba(16,19,23,.22)",
                  font: "450 12.5px/1 var(--font-geist-sans)",
                  color: "var(--df-ink3)",
                  cursor: "pointer",
                }}
              >
                + Add skill
              </button>
            </div>

            <div style={{ height: 1, background: "rgba(16,19,23,.07)", margin: "22px 0" }} />

            <h4 className="df-kicker" style={{ margin: "0 0 11px", fontSize: 11 }}>
              Certification
            </h4>
            <div className="flex flex-col gap-[9px]">
              {CERTS.map(([name, year]) => (
                <div
                  key={name}
                  className="flex items-center gap-3"
                  style={{ padding: "12px 14px", borderRadius: 13, background: "#FAFBFC", border: "1px solid rgba(16,19,23,.06)" }}
                >
                  <span className="min-w-0 flex-1" style={{ font: "450 13.5px/1.3 var(--font-geist-sans)" }}>
                    {name}
                  </span>
                  <span className="df-mono flex-none" style={{ fontSize: 12, color: "var(--df-ink5)" }}>
                    {year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "private" ? (
          <div className="flex flex-col gap-4">
            <div className="df-card" style={{ padding: 24 }}>
              <div className="mb-1 flex items-center gap-3">
                <h3 className="df-h3">Personal details</h3>
                <span
                  className="df-mono"
                  style={{ padding: "4px 9px", borderRadius: 7, background: "rgba(60,88,216,.1)", fontSize: 10.5, fontWeight: 500, color: "var(--df-indigo-lo)" }}
                >
                  2 EDITABLE
                </span>
              </div>
              <div className="mt-[18px] grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
                <div>
                  <label className="df-label" style={{ margin: "0 0 7px" }}>
                    Phone
                  </label>
                  <input className="df-input" value={s.phone} onChange={(e) => s.setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="df-label" style={{ margin: "0 0 7px" }}>
                    Address
                  </label>
                  <input className="df-input" value={s.address} onChange={(e) => s.setAddress(e.target.value)} />
                </div>
                <div>
                  <label className="df-label" style={{ margin: "0 0 7px", color: "var(--df-ink5)" }}>
                    Work email · locked
                  </label>
                  <div style={{ padding: "11px 13px", borderRadius: 11, background: "rgba(16,19,23,.04)", border: "1px solid rgba(16,19,23,.06)", font: "400 13.5px/1.2 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                    aarav.rao@dayflow.co
                  </div>
                </div>
                <div>
                  <label className="df-label" style={{ margin: "0 0 7px", color: "var(--df-ink5)" }}>
                    Date of birth · locked
                  </label>
                  <div style={{ padding: "11px 13px", borderRadius: 11, background: "rgba(16,19,23,.04)", border: "1px solid rgba(16,19,23,.06)", font: "400 13.5px/1.2 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                    14 Sep 1996
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <button type="button" onClick={() => s.toast("Profile updated")} className="df-btn df-btn-primary" style={{ padding: "11px 18px", borderRadius: 12 }}>
                  Save changes
                </button>
                <span style={{ font: "400 12.5px/1.4 var(--font-geist-sans)", color: "var(--df-ink4)" }}>
                  Locked fields are maintained by HR.
                </span>
              </div>
            </div>

            <div className="df-card" style={{ padding: 24 }}>
              <h3 className="df-h3" style={{ marginBottom: 18 }}>
                Job details
              </h3>
              <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
                {JOB.map(([k, v]) => (
                  <Field key={k} label={k}>
                    {v}
                  </Field>
                ))}
              </div>
            </div>

            <div className="df-card" style={{ padding: 24 }}>
              <div className="mb-[18px] flex items-center gap-3">
                <h3 className="df-h3">Bank &amp; statutory</h3>
                <span
                  className="df-mono"
                  style={{ padding: "4px 9px", borderRadius: 7, background: "rgba(16,19,23,.05)", fontSize: 10.5, fontWeight: 500, color: "var(--df-ink3)" }}
                >
                  HR MAINTAINED
                </span>
              </div>
              <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
                {BANK.map(([k, v]) => (
                  <Field key={k} label={k}>
                    {v}
                  </Field>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "settings" ? (
          <div className="df-card" style={{ padding: 24 }}>
            <h3 className="df-h3" style={{ marginBottom: 4 }}>
              Security
            </h3>
            <p style={{ margin: "0 0 20px", font: "400 13.5px/1.5 var(--font-geist-sans)", color: "var(--df-ink3)" }}>
              Your first password was generated by Dayflow. Changing it is the one thing we ask you to do on day one.
            </p>
            <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>
                  Current password
                </label>
                <input className="df-input" type="password" defaultValue="dayflow2026" />
              </div>
              <div>
                <label className="df-label" style={{ margin: "0 0 7px" }}>
                  New password
                </label>
                <input className="df-input" type="password" placeholder="8+ characters, one number" />
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(16,19,23,.07)", margin: "22px 0" }} />

            <h4 className="df-kicker" style={{ margin: "0 0 14px", fontSize: 11 }}>
              Notifications
            </h4>
            <div className="flex flex-col gap-3">
              {NOTIFS.map((n) => (
                <div key={n.title} className="flex items-center gap-3">
                  <Toggle on={n.on} />
                  <span className="min-w-0 flex-1">
                    <span style={{ display: "block", font: "450 13.5px/1.3 var(--font-geist-sans)", color: n.on ? undefined : "var(--df-ink4)" }}>
                      {n.title}
                    </span>
                    <span style={{ display: "block", font: "400 12px/1.4 var(--font-geist-sans)", color: n.on ? "var(--df-ink5)" : "var(--df-ink6)" }}>
                      {n.note}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => s.toast("Profile updated")}
              className="df-btn df-btn-primary"
              style={{ margin: "22px 0 0", padding: "11px 18px", borderRadius: 12 }}
            >
              Save settings
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
