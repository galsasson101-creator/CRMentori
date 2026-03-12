import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserProfile from './pages/UserProfile';
import TasksPage from './pages/TasksPage';
import CommsPage from './pages/CommsPage';
import EmailsPage from './pages/emails/EmailsPage';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/comms" element={<CommsPage />} />
          <Route path="/emails" element={<EmailsPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
