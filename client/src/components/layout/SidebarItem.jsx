import { NavLink } from 'react-router-dom';

export default function SidebarItem({ icon: Icon, label, path, collapsed }) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
          isActive
            ? 'bg-navy-600 text-white'
            : 'text-gray-400 hover:bg-navy-700 hover:text-gray-200'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-info rounded-r" />
          )}
          <Icon size={20} className="shrink-0" />
          {!collapsed && <span>{label}</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50 transition-opacity">
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
