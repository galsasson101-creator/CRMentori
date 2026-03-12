import { Bell, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import SearchInput from '../shared/SearchInput';

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/pipelines': 'Pipelines',
  '/users': 'Users',
  '/tasks': 'Tasks',
  '/comms': 'Communications',
};

function getPageTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/users/')) return 'User Profile';
  return 'MENTORI';
}

export default function TopBar() {
  const { searchQuery, setSearchQuery, currentUser, darkMode, toggleDarkMode } = useApp();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h1>

      <div className="flex items-center gap-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />

        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-info flex items-center justify-center text-white text-sm font-medium">
          {currentUser.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
      </div>
    </header>
  );
}
