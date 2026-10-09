import { FileText, Home as HomeIcon, User, Waypoints } from "lucide-react";

export type TabKey = "home" | "activities" | "achievements" | "portfolio" | "profile";

/* Bottom nav — Oct-1 redesign.
   ----------------------------
   The prototype floats the bar: a translucent pill inset from the edges with
   the content scrolling under it, rather than an opaque strip the layout has
   to make room for. The active tab gets a filled lozenge behind its icon.

   Because it now overlays the content, every tab body carries its own bottom
   padding (pb-28) so nothing ends up trapped behind it. */
export default function BottomBar({
  activeTab,
  onSelectTab,
}: {
  activeTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
}) {
  const currentTab = activeTab || "home";

  /* Four tabs, as in the prototype. The achievements list and the photo
     portfolio are still in the app — they are reached from Home and from
     Profile rather than from here. */
  const items: {
    id: TabKey;
    label: string;
    icon: typeof HomeIcon;
  }[] = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "activities", label: "Timeline", icon: Waypoints },
    { id: "portfolio", label: "Brag sheet", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div
      data-name="Bottom Bar"
      className="absolute left-3.5 right-3.5 bottom-[30px] z-30 h-[70px] flex items-center px-1.5 rounded-[34px] border border-white/90"
      style={{
        background: "rgba(255,255,255,0.62)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        boxShadow: "0 14px 34px -12px rgba(20,50,44,0.32)",
      }}
    >
      {items.map((item) => {
        const isActive = currentTab === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab?.(item.id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform ${
              isActive ? "text-pine" : "text-ink-soft"
            }`}
          >
            <span
              className={`grid place-items-center w-14 h-[30px] rounded-[15px] transition-colors ${
                isActive ? "bg-pine-soft" : "bg-transparent"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.2 : 1.9} />
            </span>
            <span className="text-[10.5px] font-[600] tracking-tight truncate max-w-full">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
