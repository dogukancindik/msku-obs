import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Message, student } from '../data/msku';
import { splitJoined, turkishWord } from '../data/names';
import { generate, type StudentData } from './academic';

// ---------- storage helpers (wrapped: storage may be unavailable) ----------
const read = <T,>(store: 'local' | 'session', key: string, fallback: T): T => {
  try {
    const s = store === 'local' ? localStorage : sessionStorage;
    const raw = s.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (store: 'local' | 'session', key: string, v: unknown) => {
  try {
    const s = store === 'local' ? localStorage : sessionStorage;
    if (v === null) s.removeItem(key);
    else s.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

export type Settings = { theme: 'light' | 'dark'; scale: 1 | 1.125 | 1.25; contrast: 'normal' | 'high'; cbSafe: boolean; reduceMotion: boolean };
const defaultSettings: Settings = { theme: 'light', scale: 1, contrast: 'normal', cbSafe: false, reduceMotion: false };

export type Auth = { email: string; password: string } | null;
export type Profile = { firstName?: string; lastName?: string; name?: string; avatar?: string; phone: string };
export type Me = typeof student & { firstName: string; givenNames: string; lastName: string };
const EMPTY: Message[] = [];

/** "ali.kirgiz" → { first: "Ali", last: "Kırgız" }; "ali.riza.kirgiz" → { first: "Ali Rıza", last: "Kırgız" } */
export const splitNameFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? '';
  let raw = local.split(/[._-]+/).map((w) => w.replace(/\d+/g, '')).filter(Boolean);
  if (raw.length === 1) raw = splitJoined(raw[0]);
  const parts = raw.map(turkishWord);
  if (!parts.length) return { first: 'Öğrenci', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
};
export const nameFromEmail = (email: string) => {
  const n = splitNameFromEmail(email);
  return [n.first, n.last].filter(Boolean).join(' ');
};
/** Same person → same number. Turkish diacritics are folded so "Kirgiz" and "Kırgız" share a number. */
export const numberFromName = (name: string) => {
  const key = name.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
  let h = 2166136261;
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `230717${String((h % 999) + 1).padStart(3, '0')}`;
};
const fold = (t: string) => t.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/** Demo kuralı: varsayılan şifre = ad + soyad + "123" (ali.kirgiz → alikirgiz123) */
export const defaultPassword = (email: string) => fold(email.split('@')[0] ?? '').replace(/[^a-z]/g, '') + '123';
const PW_KEY = 'msku.passwords';
const customPassword = (email: string): string | undefined => read<Record<string, string>>('local', PW_KEY, {})[email];
/** Kullanıcı şifresini değiştirdiyse yalnızca yeni şifre, değiştirmediyse adsoyad123 (büyük/küçük harf ve Türkçe karakter duyarsız) geçerlidir. */
export const checkPassword = (email: string, pw: string) => {
  const custom = customPassword(email);
  return custom !== undefined ? pw === custom : fold(pw).replace(/\s/g, '') === defaultPassword(email);
};
const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toLocaleUpperCase('tr');
export type Toast = { id: number; text: string; tone?: 'info' | 'success' | 'warning' | 'danger'; action?: { label: string; run: () => void } };


type Route = { path: string; query: URLSearchParams };
const parseHash = (): Route => {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [path, q] = h.split('?');
  return { path: path || 'dashboard', query: new URLSearchParams(q || '') };
};

type Ctx = {
  settings: Settings;
  set: <K extends keyof Settings>(k: K, v: Settings[K]) => void;
  route: Route;
  go: (path: string, query?: Record<string, string>) => void;
  auth: Auth;
  login: (email: string, password: string) => void;
  logout: () => void;
  changePassword: (current: string, next: string) => boolean;
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
  me: Me;
  data: StudentData | null;
  term: string;
  setTerm: (t: string) => void;
  inbox: Message[];
  sent: Message[];
  markRead: (id: string) => void;
  setRead: (id: string, read: boolean) => void;
  deleteMessage: (box: 'inbox' | 'sent', id: string) => void;
  restoreMessage: (box: 'inbox' | 'sent', m: Message, index: number) => void;
  sendMessage: (m: Omit<Message, 'id' | 'date' | 'read' | 'from'>) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  sessionEnds: number;
  extendSession: (ms?: number) => void;
  palette: boolean;
  setPalette: (v: boolean) => void;
  track: (event: string) => void;
};

const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);
/** Per-student academic data; only used inside the signed-in app. */
export const useData = () => useContext(AppCtx).data as StudentData;

const SESSION_MS = 30 * 60 * 1000;
const reviveMsgs = (list: Message[]) => list.map((m) => ({ ...m, date: new Date(m.date) }));

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => ({ ...defaultSettings, ...read('local', 'msku.settings', {}) }));
  const [route, setRoute] = useState<Route>(parseHash);
  const [auth, setAuth] = useState<Auth>(() => read('session', 'msku.auth', null));
  const [profiles, setProfiles] = useState<Record<string, Profile>>(() => read('local', 'msku.profiles', {}));
  const [term, setTerm] = useState(student.term);
  const [inbox, setInbox] = useState<Message[]>(EMPTY);
  const [sent, setSent] = useState<Message[]>(EMPTY);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sessionEnds, setSessionEnds] = useState(() => Date.now() + SESSION_MS);
  const [palette, setPalette] = useState(false);
  const toastId = useRef(1);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = settings.theme;
    el.dataset.contrast = settings.contrast;
    el.dataset.cb = settings.cbSafe ? 'safe' : 'default';
    el.dataset.motion = settings.reduceMotion ? 'reduce' : 'full';
    el.style.setProperty('--scale', String(settings.scale));
    write('local', 'msku.settings', settings);
  }, [settings]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const set = useCallback(<K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v })), []);
  const go = useCallback((path: string, query?: Record<string, string>) => {
    const q = query ? '?' + new URLSearchParams(query).toString() : '';
    window.location.hash = `#/${path}${q}`;
    window.scrollTo({ top: 0 });
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = toastId.current++;
    setToasts((list) => [...list.slice(-2), { ...t, id }]);
    setTimeout(() => dismissToast(id), t.action ? 6500 : 3800);
  }, [dismissToast]);

  const login = useCallback((email: string, password: string) => {
    const a = { email, password };
    setAuth(a);
    write('session', 'msku.auth', a);
    setSessionEnds(Date.now() + SESSION_MS);
  }, []);
  const logout = useCallback(() => {
    setAuth(null);
    write('session', 'msku.auth', null);
    window.location.hash = '#/login';
  }, []);
  const changePassword = useCallback((current: string, next: string) => {
    if (!auth || !checkPassword(auth.email, current)) return false;
    write('local', PW_KEY, { ...read<Record<string, string>>('local', PW_KEY, {}), [auth.email]: next });
    const a = { ...auth, password: next };
    setAuth(a);
    write('session', 'msku.auth', a);
    return true;
  }, [auth]);

  const key = auth?.email ?? '';
  const profile: Profile = profiles[key] ?? { phone: '' };
  const setProfile = useCallback((p: Partial<Profile>) => setProfiles((all) => {
    const next = { ...all, [key]: { ...(all[key] ?? { phone: '' }), ...p } };
    write('local', 'msku.profiles', next);
    return next;
  }), [key]);
  const nameParts = useMemo(() => {
    const auto = auth ? splitNameFromEmail(auth.email) : { first: student.name.split(' ')[0], last: student.name.split(' ').slice(1).join(' ') };
    const legacy = profile.name?.trim().split(/\s+/);
    const first = profile.firstName?.trim() || (legacy && legacy.length > 1 ? legacy.slice(0, -1).join(' ') : legacy?.[0]) || auto.first;
    const last = profile.lastName?.trim() ?? (legacy && legacy.length > 1 ? legacy[legacy.length - 1] : undefined) ?? auto.last;
    return { first, last, name: [first, last].filter(Boolean).join(' ') };
  }, [profile.firstName, profile.lastName, profile.name, auth]);
  const data = useMemo(() => (auth ? generate(auth.email, nameParts.name) : null), [auth?.email, nameParts.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const me = useMemo<Me>(() => {
    const { first, last, name } = nameParts;
    return {
      ...student, name, firstName: first.split(' ')[0], lastName: last, givenNames: first, initials: initialsOf(name), email: auth?.email ?? student.email,
      number: data?.number ?? student.number, year: data?.year ?? student.year, semester: data?.semester ?? student.semester, term: data?.term ?? student.term,
      advisor: data?.advisor ?? student.advisor, prep: data?.prep ?? student.prep, enrolled: data?.enrolled ?? student.enrolled,
    };
  }, [nameParts, auth, data]);

  // messages are stored per user
  const boxKey = (box: 'inbox' | 'sent') => `msku.${box}.${auth?.email ?? ''}`;
  useEffect(() => {
    if (!data || !auth) { setInbox(EMPTY); setSent(EMPTY); return; }
    setInbox(reviveMsgs(read('local', `msku.inbox.${auth.email}`, data.inbox)));
    setSent(reviveMsgs(read('local', `msku.sent.${auth.email}`, data.sent)));
  }, [auth?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const setRead = useCallback((id: string, read: boolean) => setInbox((list) => {
    const next = list.map((m) => (m.id === id ? { ...m, read } : m));
    write('local', boxKey('inbox'), next);
    return next;
  }), [auth?.email]); // eslint-disable-line react-hooks/exhaustive-deps
  const markRead = useCallback((id: string) => setRead(id, true), [setRead]);
  const deleteMessage = useCallback((box: 'inbox' | 'sent', id: string) => {
    const upd = (list: Message[]) => {
      const next = list.filter((m) => m.id !== id);
      write('local', boxKey(box), next);
      return next;
    };
    (box === 'inbox' ? setInbox : setSent)(upd);
  }, [auth?.email]); // eslint-disable-line react-hooks/exhaustive-deps
  const restoreMessage = useCallback((box: 'inbox' | 'sent', m: Message, index: number) => {
    const upd = (list: Message[]) => {
      if (list.some((x) => x.id === m.id)) return list;
      const next = [...list.slice(0, index), m, ...list.slice(index)];
      write('local', boxKey(box), next);
      return next;
    };
    (box === 'inbox' ? setInbox : setSent)(upd);
  }, [auth?.email]); // eslint-disable-line react-hooks/exhaustive-deps
  const sendMessage = useCallback((m: Omit<Message, 'id' | 'date' | 'read' | 'from'>) => setSent((list) => {
    const next = [{ ...m, id: 's' + Date.now(), date: new Date(), read: true, from: me.name }, ...list];
    write('local', boxKey('sent'), next);
    return next;
  }), [me.name, auth?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const extendSession = useCallback((ms = SESSION_MS) => setSessionEnds(Date.now() + ms), []);

  const track = useCallback((_event: string) => {}, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<Ctx>(() => ({
    settings, set, route, go, auth, login, logout, changePassword, profile, setProfile, term, setTerm, inbox, sent, markRead, setRead, deleteMessage, restoreMessage, sendMessage,
    toasts, toast, dismissToast, sessionEnds, extendSession, palette, setPalette, track, me, data,
  }), [settings, set, route, go, auth, login, logout, changePassword, profile, setProfile, term, inbox, sent, markRead, setRead, deleteMessage, restoreMessage, sendMessage,
    toasts, toast, dismissToast, sessionEnds, extendSession, palette, track, me, data]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
