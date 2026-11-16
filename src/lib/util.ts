import { locale, t } from './i18n';
import { Course, GradeRow, Letter, POINTS, WEEKS, isFail, isGpaGrade, today } from '../data/msku';

export type Lang = 'tr' | 'en';
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

// ---------------------------------------------------------------- time & dates
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
// gün adları seçili dile göre (0 = Pazartesi); DAYS[i] / DAYS_SHORT[i] her erişimde yerelleştirilir
const dayName = (i: number, weekday: 'long' | 'short') => new Date(2024, 0, 1 + i).toLocaleDateString(locale(), { weekday });
const dayList = (weekday: 'long' | 'short') => new Proxy([] as string[], { get: (_, p) => (typeof p === 'string' && /^\d+$/.test(p) ? dayName(+p, weekday) : p === 'length' ? 7 : undefined) });
export const DAYS = dayList('long');
export const DAYS_SHORT = dayList('short');
export const weekday = (d: Date) => (d.getDay() + 6) % 7; // Monday = 0
export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) => d.toLocaleDateString(locale(), opts);
export const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
export const daysUntil = (d: Date) => Math.round((new Date(d).setHours(0, 0, 0, 0) - today.getTime()) / 86400000);
export const inDays = (d: Date) => {
  const n = daysUntil(d);
  if (n === 0) return t('bugün');
  if (n === 1) return t('yarın');
  if (n === -1) return t('dün');
  return n > 0 ? t('{n} gün sonra', { n }) : t('{n} gün önce', { n: -n });
};
export const relDays = (n: number) => (n === 0 ? t('bugün') : n === 1 ? t('dün') : t('{n} gün önce', { n }));
export const NEW_DAYS = 3;
export const isNew = (announced?: number) => announced !== undefined && announced <= NEW_DAYS;

// ---------------------------------------------------------------- GPA
export const fmtGpa = (n: number) => n.toFixed(2);
export function gpa(items: { ects: number; grade?: Letter | '' }[]) {
  const g = items.filter((c) => isGpaGrade(c.grade || undefined));
  const w = g.reduce((s, c) => s + c.ects, 0);
  return w ? g.reduce((s, c) => s + POINTS[c.grade as Letter] * c.ects, 0) / w : 0;
}

/** Her dersin en son notlandırılmış alışı (tekrar alınan derste eski not geçersiz olur). */
export function latestAttempts<T extends { code: string; semester: number; grade?: Letter | '' }>(items: T[]): T[] {
  const m = new Map<string, T>();
  for (const c of [...items].sort((a, b) => a.semester - b.semester)) if (c.grade) m.set(c.code, c);
  return [...m.values()];
}
/** AGNO: her dersin son notu, AKTS ağırlıklı */
export const cumulativeGpa = <T extends { code: string; semester: number; ects: number; grade?: Letter | '' }>(items: T[]) => gpa(latestAttempts(items));
/** Başarıyla tamamlanan AKTS */
export const passedEcts = <T extends { code: string; semester: number; ects: number; grade?: Letter | '' }>(items: T[]) =>
  latestAttempts(items).filter((c) => !isFail(c.grade || undefined)).reduce((s, c) => s + c.ects, 0);

// ---------------------------------------------------------------- grades
export function courseAverage(grades: GradeRow[], code: string) {
  const g = grades.find((x) => x.code === code);
  if (!g) return undefined;
  const parts = [g.vize, g.odev, g.final].filter((a) => a.score !== undefined && a.weight > 0);
  const w = parts.reduce((s, a) => s + a.weight, 0);
  return w ? parts.reduce((s, a) => s + a.score! * a.weight, 0) / w : undefined;
}

// ---------------------------------------------------------------- attendance
export const weeklyHours = (c: Course) => c.t + c.u;
export function attendance(D: { current: Course[]; absence: Record<string, number[]> }, code: string) {
  const c = D.current.find((x) => x.code === code)!;
  const weeks = D.absence[code] ?? [];
  const absent = weeks.reduce((s, x) => s + x, 0);
  const limit = Math.floor(weeklyHours(c) * WEEKS * 0.3);
  const ratio = limit ? absent / limit : 0;
  const level: 'ok' | 'warn' | 'danger' | 'over' = absent > limit ? 'over' : ratio >= 0.85 ? 'danger' : ratio >= 0.6 ? 'warn' : 'ok';
  return { absent, limit, left: Math.max(limit - absent, 0), ratio, pct: Math.round(ratio * 100), level, weeks, required: !!limit && !c.waived, waived: !!c.waived, failed: !!limit && !c.waived && absent > limit };
}

// ---------------------------------------------------------------- misc
export function downloadFile(name: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const lum = (hex: string) => {
  const c = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

export function passwordStrength(p: string) {
  const checks = [
    { ok: p.length >= 8, label: t('En az 8 karakter') },
    { ok: /[A-ZÇĞİÖŞÜ]/.test(p), label: t('Bir büyük harf') },
    { ok: /[a-zçğıöşü]/.test(p), label: t('Bir küçük harf') },
    { ok: /\d/.test(p), label: t('Bir rakam') },
    { ok: /[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/.test(p), label: t('Bir sembol (!?*…)') },
  ];
  let score = checks.filter((c) => c.ok).length;
  if (p.length >= 12 && score >= 4) score = 5;
  if (p.length < 8) score = Math.min(score, 2);
  const label = t(['Çok zayıf', 'Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü'][score]);
  const tone = score <= 2 ? 'danger' : score === 3 ? 'warning' : 'success';
  return { score, label, tone, checks };
}
