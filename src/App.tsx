import { useEffect, useState } from 'react';
import { useApp } from './lib/store';
import { MobileNav, SessionGuard, Sidebar, Toasts, TopBar } from './components/Shell';
import { CommandPalette } from './components/Palette';
import { navFor } from './components/nav';
import { t } from './lib/i18n';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Grades from './pages/Grades';
import Transcript from './pages/Transcript';
import Curriculum from './pages/Curriculum';
import Averages from './pages/Averages';
import Attendance from './pages/Attendance';
import Schedule from './pages/Schedule';
import Offered from './pages/Offered';
import Messages from './pages/Messages';
import Account from './pages/Account';
import GradCredit from './pages/GradCredit';

const PAGES: Record<string, () => JSX.Element> = {
  dashboard: Dashboard, courses: Courses, grades: Grades, transcript: Transcript, curriculum: Curriculum, averages: Averages,
  attendance: Attendance, schedule: Schedule, offered: Offered, messages: Messages, account: Account, gradcredit: GradCredit,
};

export default function App() {
  const { route, auth, settings } = useApp();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const title = !auth ? t('Giriş') : t(navFor(route.path)?.label ?? 'Ana Sayfa');
    document.title = `${title} · MSKÜ OBS`;
  }, [route.path, auth, settings.lang]);

  useEffect(() => {
    if (auth && route.path === 'login') window.location.hash = '#/dashboard';
  }, [auth, route.path]);

  if (!auth) {
    return (
      <>
        <Login />
        <Toasts />
      </>
    );
  }

  const Page = PAGES[route.path] ?? Dashboard;
  return (
    <div className="app">
      <a className="skip-link" href="#main">{t('İçeriğe geç')}</a>
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="main-col">
        <TopBar onMenu={() => setMenu(true)} />
        <main id="main" tabIndex={-1} key={route.path + "?" + route.query.toString()}>
          <Page />
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
      <SessionGuard />
      <Toasts />
    </div>
  );
}
