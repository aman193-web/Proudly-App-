import {
  BarChart3,
  FolderOpen,
  Home as HomeIcon,
  Trophy,
  User,
} from "lucide-react";

export type TabKey = "home" | "activities" | "achievements" | "portfolio" | "profile";

export default function BottomBar({
  activeTab,
  onSelectTab,
}: {
  activeTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
}) {
  const currentTab = activeTab || "home";

  const items: {
    id: TabKey;
    label: string;
    icon: typeof HomeIcon;
  }[] = [
    { id: "home", label: "Home", icon: HomeIcon },
    { id: "activities", label: "Activities", icon: BarChart3 },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="bg-surface border-t border-hairline w-full" data-name="Bottom Bar">
      <div className="flex flex-row items-center justify-between px-3 pt-2 pb-5 w-full">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab?.(item.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95"
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? "bg-[#217C72]/12" : "hover:bg-canvas"
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className={isActive ? "text-[#217C72]" : "text-[#66716E]"}
                />
              </div>
              <span
                className={`text-[10.5px] font-[600] mt-0.5 tracking-tight transition-colors ${
                  isActive ? "text-[#217C72]" : "text-[#66716E]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}