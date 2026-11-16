import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, Check, ChevronDown, Clock, Globe, LogOut, Mail, Menu, Moon, Sun, UserCog, X } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { cx, relDays } from '../lib/util';
import { byCode, student } from '../data/msku';
import { NAV, BOTTOM_NAV, MOBILE_NAV, groupFor, navFor } from './nav';
import { LANGS, t, term as termLabel } from '../lib/i18n';
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
      <span>{t(label)}</span>
      {!!badge && <span className="side-count" aria-label={t('{n} okunmamış', { n: badge })}>{badge}</span>}
    </a>
  );
  return (
    <>
      <div className={cx('scrim', open && 'show')} onClick={onClose} />
      <aside className={cx('sidebar', open && 'open')} aria-label={t('Ana menü')}>
        <div className="side-brand">
          <Logo size={52} />
          <div>
            <strong>MSKÜ OBS</strong>
            <span>{t('Öğrenci Bilgi Sistemi')}</span>
          </div>
          <button className="icon-btn only-mobile side-close" onClick={onClose} aria-label={t('Menüyü kapat')}><X size={18} /></button>
        </div>
        <nav className="side-nav">
          {NAV.map((g) => (
            <div key={g.label} className="side-group">
              <div className="side-label">{t(g.label)}</div>
              {g.items.map((it) => <Item key={it.path} {...it} />)}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-label">{t('İletişim & Hesap')}</div>
          {BOTTOM_NAV.map((it) => <Item key={it.path} {...it} badge={it.path === 'messages' ? unread : undefined} />)}
          <button className="side-item logout" onClick={logout}><LogOut size={18} aria-hidden /><span>{t('Çıkış Yap')}</span></button>
        </div>
      </aside>
    </>
  );
}

export function MobileNav() {
  const { route, go } = useApp();
  return (
    <nav className="mobile-nav" aria-label={t('Hızlı gezinme')}>
      {MOBILE_NAV.map((it) => {
        const Icon = it.icon;
        const on = route.path === it.path;
        return (
          <button key={it.path} className={cx(on && 'on')} onClick={() => go(it.path)} aria-current={on ? 'page' : undefined}>
            <Icon size={20} aria-hidden />
            <span>{t(it.short ?? it.label)}</span>
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
  const title = nav ? t(nav.label) : '';
  const group = groupFor(route.path) ? t(groupFor(route.path)) : '';
  return (
    <header className="topbar">
      <button className="icon-btn only-mobile" onClick={onMenu} aria-label={t('Menüyü aç')}><Menu size={20} /></button>
      <div className="top-title">
        {group && <span className="top-group">{group}</span>}
        <strong>{title}</strong>
      </div>
      <div className="top-actions">
        <label className="term-select">
          <CalendarDays size={16} aria-hidden />
          <span className="sr-only">{t('Dönem')}</span>
          <select value={term} onChange={(e) => setTerm(e.target.value)} aria-label={t('Dönem seçimi')}>
            {[...D.terms].reverse().map((x) => <option key={x.name} value={x.name}>{termLabel(x.name)}</option>)}
          </select>
          <ChevronDown size={14} aria-hidden className="sel-chev" />
        </label>
        <button className="icon-btn theme-btn" onClick={() => set('theme', settings.theme === 'dark' ? 'light' : 'dark')}
          aria-label={settings.theme === 'dark' ? t('Aydınlık moda geç') : t('Karanlık moda geç')} title={settings.theme === 'dark' ? t('Aydınlık mod') : t('Karanlık mod')}>
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <LangMenu />
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

/** Dil seçici (üst bar ve giriş ekranı) */
export function LangMenu({ variant = 'icon' }: { variant?: 'icon' | 'pill' }) {
  const { settings, set } = useApp();
  const [open, setOpen] = useState(false);
  const cur = LANGS.find((l) => l.code === settings.lang) ?? LANGS[0];
  return (
    <div className="pop-wrap">
      <button className={cx(variant === 'pill' ? 'lang-pill' : 'icon-btn lang-btn', open && 'on')} onClick={() => setOpen(!open)} aria-label={t('Dil seçimi')} aria-expanded={open} aria-haspopup="menu">
        <Globe size={variant === 'pill' ? 16 : 18} aria-hidden />
        <span className={variant === 'pill' ? '' : 'lang-short'}>{variant === 'pill' ? cur.label : cur.short}</span>
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)} className="lang-pop">
          {LANGS.map((l) => (
            <button key={l.code} role="menuitemradio" aria-checked={l.code === cur.code} lang={l.code} dir={l.code === 'ar' ? 'rtl' : 'ltr'}
              className={cx('pop-item', l.code === cur.code && 'on')} onClick={() => { set('lang', l.code); setOpen(false); }}>
              <span className="lang-code">{l.short}</span> {l.label} {l.code === cur.code && <Check size={14} className="lang-check" />}
            </button>
          ))}
        </Popover>
      )}
    </div>
  );
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
      <button className={cx('icon-btn', open && 'on')} onClick={() => setOpen(!open)} aria-label={t('Bildirimler ve mesajlar, {n} yeni', { n: count })} aria-expanded={open}>
        <Bell size={18} />
        {count > 0 && <span className="dot-count">{count}</span>}
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)} className="notif-pop">
          <div className="pop-head row"><strong>{t('Bildirimler')}</strong><button className="link-btn" onClick={() => { setOpen(false); go('messages'); }}>{t('Tüm mesajlar')}</button></div>
          {unread.length > 0 && <div className="pop-section">{t('Okunmamış mesajlar')}</div>}
          {unread.map((m) => (
            <button key={m.id} className="notif-item unread" onClick={() => { markRead(m.id); setOpen(false); go('messages', { id: m.id }); }}>
              <span className="notif-ic"><Mail size={14} /></span>
              <span><strong>{m.subject}</strong><small>{m.from}</small></span>
            </button>
          ))}
          {newGrades.length > 0 && <div className="pop-section">{t('Yeni açıklanan notlar')}</div>}
          {newGrades.map(({ g, a }) => {
            const c = byCode(g.code)!;
            return (
              <button key={g.code + a.weight} className="notif-item" onClick={() => { setOpen(false); go('grades'); }}>
                <span className="notif-ic new"><ListIcon /></span>
                <span><strong>{c.code} · {a === g.vize ? t('Vize') : t('Ödev/Proje')}: {a.score}</strong><small>{c.name} · {relDays(a.announced!)}</small></span>
              </button>
            );
          })}
          {count === 0 && <p className="muted small" style={{ padding: 8 }}>{t('Yeni bildirim yok.')}</p>}
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
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
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
      <button className="avatar-btn" onClick={() => setOpen(!open)} aria-label={t('Profil menüsü')} aria-expanded={open}>
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
              <span className="muted small">{t(student.programShort)} · {t('{n}. Sınıf', { n: D.year })}</span>
            </div>
          </div>
          <div className="pop-session">
            <Clock size={14} /> {t('Oturum süresi')} <strong className="mono">{fmt(sessionEnds - now)}</strong>
            <button className="link-btn" onClick={() => extendSession()}>{t('Uzat')}</button>
          </div>
          <button className="pop-item" onClick={() => { setOpen(false); go('account'); }}><UserCog size={16} /> {t('Hesap & Kullanıcı İşlemleri')}</button>
          <button className="pop-item" onClick={() => { setOpen(false); go('messages'); }}><Mail size={16} /> {t('Mesajlar')}</button>
          <button className="pop-item danger" onClick={logout}><LogOut size={16} /> {t('Çıkış Yap')}</button>
          <button className="link-btn demo" style={{ padding: '6px 10px' }} onClick={() => { extendSession(2 * 60000 + 5000); setOpen(false); }}>{t('Demo: oturum uyarısını göster')}</button>
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
    <Modal open={warn} onClose={() => setDismissedAt(sessionEnds)} title={t('Oturumunuz kapanmak üzere')}
      footer={<>
        <Button variant="ghost" onClick={logout}>{t('Çıkış yap')}</Button>
        <Button variant="primary" onClick={() => extendSession()}>{t('Oturumu uzat')}</Button>
      </>}>
      <p>{t('Güvenliğiniz için hareketsiz oturumlar kapatılır. Kalan süre:')} <strong className="mono">{fmt(left)}</strong></p>
      <p className="muted small">{t('Devam etmek istiyorsanız oturumu uzatın; yazdığınız mesaj taslakları kaybolmaz.')}</p>
    </Modal>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((x) => (
        <div key={x.id} className={cx('toast', x.tone && `toast-${x.tone}`)}>
          <span>{x.text}</span>
          {x.action && <button className="toast-action" onClick={() => { x.action!.run(); dismissToast(x.id); }}>{x.action.label}</button>}
          <button className="icon-btn" onClick={() => dismissToast(x.id)} aria-label={t('Kapat')}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
