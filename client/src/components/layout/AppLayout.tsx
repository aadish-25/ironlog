import { Outlet, useLocation } from "react-router-dom";
import { TabBar } from "./TabBar";
import { ProductTour } from "../Tour/ProductTour";

export function AppLayout() {
  const location = useLocation();
  const isSessionActive = location.pathname.startsWith("/session");

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen relative bg-bg border-x border-border/10 flex flex-col justify-between">
      <ProductTour />
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Hide the navigation bar during an active training session */}
      {!isSessionActive && <TabBar />}
    </div>
  );
}
