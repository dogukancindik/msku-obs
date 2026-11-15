import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, ChevronDown, Clock, LogOut, Mail, Menu, Moon, Sun, UserCog, X } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { cx, relDays } from '../lib/util';
import { byCode, student } from '../data/msku';
import { NAV, BOTTOM_NAV, MOBILE_NAV, groupFor, navFor } from './nav';
import { Button, Logo, Modal } from './ui';

export function Avatar({ size = 32 }: { size?: number }) {
  const { profile, me } = useApp();
  return profile.avatar ? (
    <img className="avatar img" src={profile.avatar} alt="" style={{ width: size, height: size }} />
  ) : (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>{me.initials}</span>
  );
}

// ------------------------------------------------------------------ Sidebar
export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { route, go, logout, inbox } = useApp();
  const unread = inbox.filter((m) => !m.read).length;
  const active = (p: string) => route.path === p;
  const Item = ({ path, label, icon: Icon, badge }: { path: string; label: string; icon: any; badge?: number }) => (
    <a
      href={`#/${path}`}
      className={cx('side-item', active(path) && 'active')}
      aria-current={active(path) ? 'page' : undefined}
      onClick={(e) => { e.preventDefault(); go(path); onClose(); }}
    >
      <Icon size={18} aria-hidden />
      <span>{label}</span>
      {!!badge && <span className="side-count" aria-label={`${badge} okunmamış`}>{badge}</span>}
    </a>
  );
  return (
    <>
      <div className={cx('scrim', open && 'show')} onClick={onClose} />
      <aside className={cx('sidebar', open && 'open')} aria-label="Ana menü">
        <div className="side-brand">
          <Logo size={52} />
          <div>
            <strong>MSKÜ OBS</strong>
            <span>Öğrenci Bilgi Sistemi</span>
          </div>
          <button className="icon-btn only-mobile side-close" onClick={onClose} aria-label="Menüyü kapat"><X size={18} /></button>
        </div>
        <nav className="side-nav">
          {NAV.map((g) => (
            <div key={g.label} className="side-group">
              <div className="side-label">{g.label}</div>
              {g.items.map((it) => <Item key={it.path} {...it} />)}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-label">İletişim & Hesap</div>
          {BOTTOM_NAV.map((it) => <Item key={it.path} {...it} badge={it.path === 'messages' ? unread : undefined} />)}
          <button className="side-item logout" onClick={logout}><LogOut size={18} aria-hidden /><span>Çıkış Yap</span></button>
        </div>
      </aside>
    </>
  );
}

export function MobileNav() {
  const { route, go } = useApp();
  return (
    <nav className="mobile-nav" aria-label="Hızlı gezinme">
      {MOBILE_NAV.map((it) => {
        const Icon = it.icon;
        const on = route.path === it.path;
        return (
          <button key={it.path} className={cx(on && 'on')} onClick={() => go(it.path)} aria-current={on ? 'page' : undefined}>
            <Icon size={20} aria-hidden />
            <span>{it.short ?? it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ------------------------------------------------------------------ Top bar
export function TopBar({ onMenu }: { onMenu: () => void }) {
  const D = useData();
  const { route, term, setTerm, settings, set } = useApp();
  const nav = navFor(route.path);
  const title = nav?.label ?? '';
  const group = groupFor(route.path);
  return (
    <header className="topbar">
      <button className="icon-btn only-mobile" onClick={onMenu} aria-label="Menüyü aç"><Menu size={20} /></button>
      <div className="top-title">
        {group && <span className="top-group">{group}</span>}
        <strong>{title}</strong>
      </div>
      <div className="top-actions">
        <label className="term-select">
          <CalendarDays size={16} aria-hidden />
          <span className="sr-only">Dönem</span>
          <select value={term} onChange={(e) => setTerm(e.target.value)} aria-label="Dönem seçimi">
            {[...D.terms].reverse().map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
          <ChevronDown size={14} aria-hidden className="sel-chev" />
        </label>
        <button className="icon-btn theme-btn" onClick={() => set('theme', settings.theme === 'dark' ? 'light' : 'dark')}
          aria-label={settings.theme === 'dark' ? 'Aydınlık moda geç' : 'Karanlık moda geç'} title={settings.theme === 'dark' ? 'Aydınlık mod' : 'Karanlık mod'}>
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotifButton />
        <ProfileMenu />
      </div>
    </header>
  );
}

function Popover({ children, onClose, className }: { children: React.ReactNode; onClose: () => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return <div ref={ref} className={cx('popover', className)}>{children}</div>;
}

function NotifButton() {
  const D = useData();
  const { inbox, go, markRead } = useApp();
  const [open, setOpen] = useState(false);
  const unread = inbox.filter((m) => !m.read);
  const newGrades = D.grades.flatMap((g) => [g.vize, g.odev].filter((a) => a.score !== undefined && a.announced !== undefined && a.announced <= 3).map((a) => ({ g, a })));
  const count = unread.length + newGrades.length;
  return (
    <div className="pop-wrap">
      <button className={cx('icon-btn', open && 'on')} onClick={() => setOpen(!open)} aria-label={`Bildirimler ve mesajlar, ${count} yeni`} aria-expanded={open}>
        <Bell size={18} />
        {count > 0 && <span className="dot-count">{count}</span>}
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)} className="notif-pop">
          <div className="pop-head row"><strong>Bildirimler</strong><button className="link-btn" onClick={() => { setOpen(false); go('messages'); }}>Tüm mesajlar</button></div>
          {unread.length > 0 && <div className="pop-section">Okunmamış mesajlar</div>}
          {unread.map((m) => (
            <button key={m.id} className="notif-item unread" onClick={() => { markRead(m.id); setOpen(false); go('messages', { id: m.id }); }}>
              <span className="notif-ic"><Mail size={14} /></span>
              <span><strong>{m.subject}</strong><small>{m.from}</small></span>
            </button>
          ))}
          {newGrades.length > 0 && <div className="pop-section">Yeni açıklanan notlar</div>}
          {newGrades.map(({ g, a }) => {
            const c = byCode(g.code)!;
            return (
              <button key={g.code + a.weight} className="notif-item" onClick={() => { setOpen(false); go('grades'); }}>
                <span className="notif-ic new"><ListIcon /></span>
                <span><strong>{c.code} · {a === g.vize ? 'Vize' : 'Ödev/Proje'}: {a.score}</strong><small>{c.name} · {relDays(a.announced!)}</small></span>
              </button>
            );
          })}
          {count === 0 && <p className="muted small" style={{ padding: 8 }}>Yeni bildirim yok.</p>}
        </Popover>
      )}
    </div>
  );
}
const ListIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M12 2l2.9 6.9L22 10l-5.5 4.8L18 22l-6-3.6L6 22l1.5-7.2L2 10l7.1-1.1z" /></svg>;

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

function ProfileMenu() {
  const D = useData();
  const { me, go, logout, sessionEnds, extendSession } = useApp();
  const [open, setOpen] = useState(false);
  const now = useNow();
  return (
    <div className="pop-wrap">
      <button className="avatar-btn" onClick={() => setOpen(!open)} aria-label="Profil menüsü" aria-expanded={open}>
        <Avatar />
        <span className="avatar-name"><strong>{me.name}</strong><small>{me.number}</small></span>
        <ChevronDown size={14} className="muted" />
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)} className="user-pop">
          <div className="pop-profile">
            <Avatar size={44} />
            <div>
              <strong>{me.name}</strong>
              <span className="muted small">{me.email}</span>
              <span className="muted small">{student.programShort} · {D.year}. Sınıf</span>
            </div>
          </div>
          <div className="pop-session">
            <Clock size={14} /> Oturum süresi <strong className="mono">{fmt(sessionEnds - now)}</strong>
            <button className="link-btn" onClick={() => extendSession()}>Uzat</button>
          </div>
          <button className="pop-item" onClick={() => { setOpen(false); go('account'); }}><UserCog size={16} /> Hesap & Kullanıcı İşlemleri</button>
          <button className="pop-item" onClick={() => { setOpen(false); go('messages'); }}><Mail size={16} /> Mesajlar</button>
          <button className="pop-item danger" onClick={logout}><LogOut size={16} /> Çıkış Yap</button>
          <button className="link-btn demo" style={{ padding: '6px 10px' }} onClick={() => { extendSession(2 * 60000 + 5000); setOpen(false); }}>Demo: oturum uyarısını göster</button>
        </Popover>
      )}
    </div>
  );
}

export function SessionGuard() {
  const { sessionEnds, extendSession, logout } = useApp();
  const now = useNow();
  const left = sessionEnds - now;
  const [dismissedAt, setDismissedAt] = useState(0);
  useEffect(() => {
    if (left <= 0) logout();
  }, [left <= 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const warn = left > 0 && left <= 2 * 60000 && dismissedAt !== sessionEnds;
  return (
    <Modal open={warn} onClose={() => setDismissedAt(sessionEnds)} title="Oturumunuz kapanmak üzere"
      footer={<>
        <Button variant="ghost" onClick={logout}>Çıkış yap</Button>
        <Button variant="primary" onClick={() => extendSession()}>Oturumu uzat</Button>
      </>}>
      <p>Güvenliğiniz için hareketsiz oturumlar kapatılır. Kalan süre: <strong className="mono">{fmt(left)}</strong></p>
      <p className="muted small">Devam etmek istiyorsanız oturumu uzatın; yazdığınız mesaj taslakları kaybolmaz.</p>
    </Modal>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx('toast', t.tone && `toast-${t.tone}`)}>
          <span>{t.text}</span>
          {t.action && <button className="toast-action" onClick={() => { t.action!.run(); dismissToast(t.id); }}>{t.action.label}</button>}
          <button className="icon-btn" onClick={() => dismissToast(t.id)} aria-label="Kapat"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
