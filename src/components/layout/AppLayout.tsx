import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pb-20 md:pb-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
