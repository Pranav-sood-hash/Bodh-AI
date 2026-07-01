import React from "react";
import ChangePassword from "./ChangePassword";
import ConnectedAccounts from "./ConnectedAccounts";
import ActiveSessions from "./ActiveSessions";
import DangerZone from "./DangerZone";

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      <ChangePassword />
      <ConnectedAccounts />
      <ActiveSessions />
      <DangerZone />
    </div>
  );
}
