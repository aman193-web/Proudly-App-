import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Database,
  Images,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { AppHeader, ChildAvatar, PrimaryButton } from "../components/ui";
import { SourceCard } from "../components/SourceCard";
import { showToast } from "../components/states";
import { CHILDREN, PARENT, SOURCES, childById } from "../data";

export type SettingsTarget =
  | "sources"
  | "children"
  | "account"
  | "notifPrefs"
  | "data";

/* ============================================================= PROFILE TAB */
export function ProfileTab({ onOpen }: { onOpen: (t: SettingsTarget) => void }) {
  return (
    <div className="pt-14 pb-6">
      <div className="px-4 flex items-center gap-4">
        <ChildAvatar src={PARENT.photo} name={PARENT.name} size={60} ring="#217c72" />
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-[700] text-ink leading-tight truncate">
            {PARENT.name}
          </h1>
          <p className="text-[13.5px] text-ink-soft mt-0.5">
            Parent · {CHILDREN.length} children
          </p>
        </div>
      </div>

      <Group title="Family">
        <Row
          icon={<Users size={18} />}
          label="Children"
          value={`${CHILDREN.length}`}
          onClick={() => onOpen("children")}
        />
        <Row
          icon={<Images size={18} />}
          label="Connected sources"
          value="Calendar · Photos"
          onClick={() => onOpen("sources")}
        />
      </Group>

      <Group title="Preferences">
        <Row
          icon={<Bell size={18} />}
          label="Notifications"
          onClick={() => onOpen("notifPrefs")}
        />
        <Row
          icon={<ShieldCheck size={18} />}
          label="Account"
          onClick={() => onOpen("account")}
        />
        <Row
          icon={<Database size={18} />}
          label="Data & privacy"
          onClick={() => onOpen("data")}
        />
      </Group>

      <p className="text-center text-[11.5px] text-ink-soft/70 mt-8">PROUDLY · v1.0</p>
    </div>
  );
}

/* ---------- Reusable settings primitives ---------- */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-4 mt-7">
      <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.08em] mb-2.5 ml-0.5">
        {title}
      </p>
      <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-canvas transition-colors"
    >
      <span
        className={`grid place-items-center w-9 h-9 rounded-xl shrink-0 ${
          danger ? "bg-[#fbeceb] text-[#c0504a]" : "bg-canvas text-ink-soft"
        }`}
      >
        {icon}
      </span>
      <span className={`flex-1 text-[15px] font-[600] ${danger ? "text-[#c0504a]" : "text-ink"}`}>
        {label}
      </span>
      {value && <span className="text-[13px] text-ink-soft">{value}</span>}
      {onClick && <ChevronRight size={17} className="text-ink-soft/70" />}
    </button>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-canvas transition-colors"
    >
      <div className="pr-4">
        <p className="text-[15px] font-[600] text-ink">{label}</p>
        {desc && <p className="text-[12.5px] text-ink-soft mt-0.5">{desc}</p>}
      </div>
      <span
        className={`w-12 h-7 rounded-full p-0.5 shrink-0 transition-colors ${
          value ? "bg-teal" : "bg-hairline"
        }`}
      >
        <motion.span
          layout
          className="block w-6 h-6 rounded-full bg-white shadow"
          style={{ marginLeft: value ? 20 : 0 }}
        />
      </span>
    </button>
  );
}

/* ============================================================= CONNECTED SOURCES */
export function ConnectedSources({ onBack }: { onBack: () => void }) {
  const [calState, setCalState] = useState<"connected" | "reconnect">("connected");
  const [photoState, setPhotoState] = useState<"connected" | "reconnect">("reconnect");
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Connected sources" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <p className="text-[13px] text-ink-soft mt-1 mb-4 leading-relaxed">
          PROUDLY reads Google Calendar and Photos to build the activity journey. They stay
          together and nothing is posted or shared.
        </p>

        <div className="space-y-3">
          <SourceCard
            kind="calendar"
            title="Google Calendar"
            purpose={`${SOURCES.calendar.account} · Last synced ${SOURCES.calendar.lastSync}`}
            state={calState}
            onAction={() => {
              if (calState === "reconnect") {
                setCalState("connected");
                showToast("Google Calendar reconnected");
              }
            }}
          />
          <SourceCard
            kind="photos"
            title="Google Photos"
            purpose={
              photoState === "connected"
                ? `${SOURCES.photos.account} · Select more photos anytime`
                : "Permission expired — reconnect to keep memories in sync."
            }
            state={photoState}
            onAction={() => {
              if (photoState === "reconnect") {
                setPhotoState("connected");
                showToast("Google Photos reconnected");
              }
            }}
          />
        </div>

        {/* Sync */}
        <p className="text-[12px] font-[600] text-ink-soft uppercase tracking-[0.08em] mt-7 mb-2.5 ml-0.5">
          Sync
        </p>
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Toggle
            label="Background sync"
            desc="Keep the timeline up to date automatically"
            value={autoSync}
            onChange={setAutoSync}
          />
          <button
            onClick={() => showToast("Sync complete")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-canvas transition-colors"
          >
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-mint text-teal-dark shrink-0">
              <RefreshCw size={17} />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-[600] text-ink">Sync now</p>
              <p className="text-[12.5px] text-ink-soft">Last synced {SOURCES.calendar.lastSync}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= CHILD MANAGEMENT */
export function ChildManagement({
  onBack,
  onEditChild,
  onAddChild,
}: {
  onBack: () => void;
  onEditChild: (id: string) => void;
  onAddChild: () => void;
}) {
  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader
        title="Children"
        onBack={onBack}
        trailing={
          <button
            onClick={onAddChild}
            className="grid place-items-center w-10 h-10 rounded-full bg-surface border border-hairline text-teal active:scale-95 transition-transform"
          >
            <Plus size={19} />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <div className="space-y-2.5 mt-1">
          {CHILDREN.map((c) => (
            <button
              key={c.id}
              onClick={() => onEditChild(c.id)}
              className="w-full flex items-center gap-3.5 rounded-2xl bg-surface border border-hairline p-3.5 text-left active:scale-[0.99] transition-transform"
            >
              <ChildAvatar src={c.photo} name={c.name} size={48} />
              <div className="flex-1">
                <p className="text-[16px] font-[700] text-ink">{c.name}</p>
                <p className="text-[13px] text-ink-soft">{c.grade}</p>
              </div>
              <Pencil size={17} className="text-ink-soft" />
            </button>
          ))}
        </div>

        <button
          onClick={onAddChild}
          className="w-full mt-3 rounded-2xl border border-dashed border-teal/40 text-teal p-4 flex items-center justify-center gap-2 text-[14.5px] font-[600] active:scale-[0.99] transition-transform"
        >
          <Plus size={18} /> Add child
        </button>
      </div>
    </div>
  );
}

/* ============================================================= EDIT / ADD CHILD */
export function EditChild({
  id,
  onBack,
}: {
  id?: string;
  onBack: () => void;
}) {
  const existing = id ? childById(id) : undefined;
  const [name, setName] = useState(existing?.name ?? "");
  const [grade, setGrade] = useState(existing?.grade ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const save = () => {
    showToast(existing ? "Child updated" : "Child added");
    onBack();
  };

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title={existing ? "Edit child" : "Add child"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        {/* Reference photo */}
        <div className="flex flex-col items-center mt-2 mb-5">
          <div className="relative">
            <ChildAvatar src={existing?.photo} name={name || "?"} size={92} ring="#217c72" />
            <span className="absolute bottom-0 right-0 grid place-items-center w-8 h-8 rounded-full bg-teal text-white border-2 border-canvas">
              <Pencil size={14} />
            </span>
          </div>
          <p className="text-[12.5px] text-ink-soft mt-2.5">Reference photo helps match memories</p>
        </div>

        <FieldLabel label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus={!existing}
            placeholder="Child's name"
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
          />
        </FieldLabel>

        <FieldLabel label="Grade">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. Grade 6"
            className="h-[52px] w-full rounded-2xl bg-surface px-4 text-[16px] text-ink border border-hairline outline-none focus:border-teal focus:ring-4 focus:ring-teal/10 transition placeholder:text-ink-soft/60"
          />
        </FieldLabel>

        {existing && (
          <>
            <button
              onClick={() => setConfirmDelete((v) => !v)}
              className="mt-2 text-[13px] font-[600] text-ink-soft active:opacity-60"
            >
              {confirmDelete ? "Cancel" : "Remove child"}
            </button>
            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <button
                    onClick={() => {
                      showToast(`${existing.name} removed`);
                      onBack();
                    }}
                    className="w-full mt-3 flex items-center gap-3 rounded-2xl bg-[#fbeceb] border border-[#e2b6b0] p-4 text-left"
                  >
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-white text-[#c0504a]">
                      <Trash2 size={17} />
                    </span>
                    <div>
                      <p className="text-[14.5px] font-[600] text-[#c0504a]">
                        Delete {existing.name}
                      </p>
                      <p className="text-[12px] text-ink-soft">
                        Removes their activities and memories
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
      <div className="shrink-0 px-4 pt-3 pb-8 border-t border-hairline bg-canvas">
        <PrimaryButton onClick={save} disabled={!name || !grade}>
          {existing ? "Save changes" : "Add child"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-[13px] font-[500] text-ink-soft mb-1.5 ml-0.5">{label}</span>
      {children}
    </label>
  );
}

/* ============================================================= ACCOUNT */
export function AccountSettings({
  onBack,
  onSignOut,
}: {
  onBack: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Account" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <div className="flex items-center gap-4 mt-2 mb-2">
          <ChildAvatar src={PARENT.photo} name={PARENT.name} size={56} ring="#217c72" />
          <div>
            <p className="font-display text-[18px] font-[700] text-ink">{PARENT.name}</p>
            <p className="text-[13px] text-ink-soft">{PARENT.email}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Row icon={<Pencil size={18} />} label="Edit profile" onClick={() => showToast("Profile saved")} />
          <Row icon={<ShieldCheck size={18} />} label="Change password" onClick={() => {}} />
        </div>

        <button
          onClick={onSignOut}
          className="w-full mt-6 flex items-center justify-center gap-2 rounded-2xl bg-surface border border-hairline p-4 text-[15px] font-[600] text-[#c0504a] active:scale-[0.99] transition-transform"
        >
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </div>
  );
}

/* ============================================================= NOTIFICATION PREFS */
export function NotificationPrefs({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState({
    activities: true,
    achievements: true,
    photos: true,
    connection: true,
  });
  const set = (k: keyof typeof prefs) => (v: boolean) => setPrefs((p) => ({ ...p, [k]: v }));

  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <p className="text-[13px] text-ink-soft mt-1 mb-4 leading-relaxed">
          Choose what's worth a nudge. We only notify when something needs your attention.
        </p>
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Toggle label="New activities" desc="When we find activities to review" value={prefs.activities} onChange={set("activities")} />
          <Toggle label="Possible achievements" desc="When a moment looks like a milestone" value={prefs.achievements} onChange={set("achievements")} />
          <Toggle label="Photos to review" desc="When photos need a quick check" value={prefs.photos} onChange={set("photos")} />
          <Toggle label="Connection issues" desc="When a source needs reconnecting" value={prefs.connection} onChange={set("connection")} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================= DATA & PRIVACY */
export function DataPrivacy({
  onBack,
  onManageChildren,
}: {
  onBack: () => void;
  onManageChildren: () => void;
}) {
  return (
    <div className="size-full flex flex-col bg-canvas">
      <AppHeader title="Data & privacy" onBack={onBack} />
      <div className="flex-1 overflow-y-auto scroll-area px-4 pb-8">
        <p className="text-[13px] text-ink-soft mt-1 mb-4 leading-relaxed">
          Your family's record stays yours. Manage what PROUDLY keeps.
        </p>
        <div className="rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Row icon={<Database size={18} />} label="Manage imported items" onClick={() => showToast("Opened imported items")} />
          <Row icon={<Users size={18} />} label="Delete a child" onClick={onManageChildren} />
        </div>

        <div className="mt-6 rounded-2xl bg-surface border border-hairline divide-y divide-hairline overflow-hidden">
          <Row
            icon={<Trash2 size={18} />}
            label="Delete account"
            danger
            onClick={() => showToast("Contact support to delete")}
          />
        </div>
      </div>
    </div>
  );
}
