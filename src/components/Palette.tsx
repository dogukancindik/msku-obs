import { t } from '../lib/i18n';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Calculator, CalendarClock, CornerDownLeft, Download, KeyRound, Moon, PenSquare, Search } from 'lucide-react';
import { useApp, useData } from '../lib/store';
import { CURRENT } from '../data/msku';
import { ALL_NAV } from './nav';
import { cx } from '../lib/util';

type Cmd = { id: string; label: string; hint: string; icon: any; run: () => void; keywords: string };

const norm = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');

export function CommandPalette() {
  const D = useData();
  const { palette, setPalette, go, settings, set } = useApp();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (palette) {
      setQ('');
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [palette]);

  const cmds = useMemo<Cmd[]>(() => {
    const pages: Cmd[] = ALL_NAV.map((n) => ({ id: 'p-' + n.path, label: t(n.label), hint: t('Sayfa'), icon: n.icon, run: () => go(n.path), keywords: `${n.label} ${n.keywords ?? ''}` }));
    const actions: Cmd[] = [
      { id: 'a-pdf', label: t('Transkripti PDF indir / yazdır'), hint: t('İşlem'), icon: Download, run: () => go('transcript', { print: '1' }), keywords: 'transkript pdf yazdır indir' },
      { id: 'a-what', label: t('Transkript senaryosu (AGNO hesapla)'), hint: t('İşlem'), icon: Calculator, run: () => go('transcript', { tab: 'scenario' }), keywords: 'senaryo what-if agno hesapla' },
      { id: 'a-exams', label: t('Sınav takvimini aç'), hint: t('İşlem'), icon: CalendarClock, run: () => go('schedule', { tab: 'exams' }), keywords: 'sınav takvim vize final' },
      { id: 'a-pw', label: t('Şifre değiştir'), hint: t('İşlem'), icon: KeyRound, run: () => go('account', { section: 'password' }), keywords: 'şifre parola password' },
      { id: 'a-new', label: t('Yeni mesaj yaz'), hint: t('İşlem'), icon: PenSquare, run: () => go('messages', { tab: 'compose' }), keywords: 'mesaj yaz hoca' },
      { id: 'a-theme', label: t('Koyu / açık tema'), hint: t('Ayar'), icon: Moon, run: () => set('theme', settings.theme === 'dark' ? 'light' : 'dark'), keywords: 'tema koyu dark' },
    ];
    const cs: Cmd[] = D.current.map((c) => ({ id: 'c-' + c.code, label: `${c.code} · ${c.name}`, hint: c.clash || c.t + c.u === 0 ? t('Ders bilgisi') : t('Programda gör'), icon: BookOpen, run: () => (c.clash || c.t + c.u === 0 ? go('courses') : go('schedule', { course: c.code })), keywords: `${c.code} ${c.code.replace(' ', '')} ${c.name}` }));
    return [...actions, ...pages, ...cs];
  }, [go, set, settings.theme, settings.lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const n = norm(q.trim());
    if (!n) return cmds.slice(0, 9);
    return cmds.filter((c) => norm(`${c.label} ${c.keywords}`).includes(n)).slice(0, 10);
  }, [q, cmds]);

  if (!palette) return null;
  const run = (c?: Cmd) => {
    if (!c) return;
    setPalette(false);
    c.run();
  };
  return (
    <div className="modal-backdrop top" onMouseDown={(e) => e.target === e.currentTarget && setPalette(false)}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t('Komut paleti')}>
        <div className="palette-input">
          <Search size={18} aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            placeholder={t('Örn. "notlar", "SE 3011", "transkript"')}
            aria-label={t('Ara')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === 'Enter') run(results[sel]);
              if (e.key === 'Escape') setPalette(false);
            }}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="palette-list" role="listbox">
          {results.length === 0 && <li className="palette-empty">{t('Sonuç yok. Farklı bir kelime deneyin.')}</li>}
          {results.map((c, i) => {
            const Icon = c.icon;
            return (
              <li key={c.id} role="option" aria-selected={i === sel}>
                <button className={cx('palette-item', i === sel && 'sel')} onMouseEnter={() => setSel(i)} onClick={() => run(c)}>
                  <Icon size={16} aria-hidden />
                  <span className="pi-label">{c.label}</span>
                  <span className="pi-hint">{c.hint}</span>
                  {i === sel && <CornerDownLeft size={14} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> {t('gezin')}</span>
          <span><kbd>↵</kbd> {t('aç')}</span>
          <span className="muted">{t('Uzman kullanıcılar için kısayol — menü her zaman yanınızda.')}</span>
        </div>
      </div>
    </div>
  );
}
