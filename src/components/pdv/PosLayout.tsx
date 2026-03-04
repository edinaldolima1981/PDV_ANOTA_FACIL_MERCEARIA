import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface PosLayoutProps {
  children: ReactNode;
  showCartPanel?: boolean;
}

const PosLayout = ({ children, showCartPanel = false }: PosLayoutProps) => {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {children}
      </div>
      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default PosLayout;
