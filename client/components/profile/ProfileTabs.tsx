import React from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ProfileTabs() {
  const navigate = useNavigate();
  const { tab } = useParams<{ tab: string }>();

  // Determine current active tab
  const activeTab = tab || "overview";

  const tabItems = [
    { key: "overview", label: "Overview", path: "/profile" },
    { key: "security", label: "Security", path: "/profile/security" },
    { key: "notifications", label: "Notifications", path: "/profile/notifications" },
    { key: "connected-apps", label: "Connected Apps", path: "/profile/connected-apps" }
  ];

  return (
    <div className="flex border-b border-slate-200 mb-6 w-full select-none">
      <div className="flex gap-8">
        {tabItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                isActive
                  ? "text-blue-600 border-blue-600"
                  : "text-slate-500 hover:text-slate-700 border-transparent hover:border-slate-300"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
