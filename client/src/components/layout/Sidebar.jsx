import {
  LayoutDashboard,
  GitBranch,
  Users,
  CheckSquare,
  Mail,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NAV_ITEMS } from '../../lib/constants';
import SidebarItem from './SidebarItem';

const ICON_MAP = {
  LayoutDashboard,
  GitBranch,
  Users,
  CheckSquare,
  Mail,
  Zap,
};

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useApp();

  return (
    <aside
      className="h-screen bg-navy-800 flex flex-col transition-all duration-300 ease-in-out shrink-0"
      style={{
        width: sidebarCollapsed
          ? 'var(--sidebar-collapsed)'
          : 'var(--sidebar-width)',
      }}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-navy-600">
        <div className="w-8 h-8 rounded-lg bg-info flex items-center justify-center text-white font-bold text-sm shrink-0">
          M
        </div>
        {!sidebarCollapsed && (
          <span className="text-white font-semibold text-lg tracking-tight">
            MENTORI
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const IconComponent = ICON_MAP[item.icon];
          return (
            <SidebarItem
              key={item.id}
              icon={IconComponent}
              label={item.label}
              path={item.path}
              collapsed={sidebarCollapsed}
            />
          );
        })}
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-12 border-t border-navy-600 text-gray-400 hover:text-white hover:bg-navy-700 transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight size={18} />
        ) : (
          <ChevronLeft size={18} />
        )}
      </button>
    </aside>
  );
}
