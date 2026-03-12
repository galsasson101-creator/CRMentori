import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const MOCK_USER = {
  id: '1',
  name: 'Admin User',
  email: 'admin@mentori.io',
  role: 'admin',
  avatar: null,
};

function getInitialDarkMode() {
  const stored = localStorage.getItem('darkMode');
  if (stored !== null) return stored === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function AppProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  function toggleSidebar() {
    setSidebarCollapsed((prev) => !prev);
  }

  function toggleDarkMode() {
    setDarkMode((prev) => !prev);
  }

  return (
    <AppContext.Provider
      value={{
        sidebarCollapsed,
        toggleSidebar,
        searchQuery,
        setSearchQuery,
        currentUser: MOCK_USER,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

export default AppContext;
