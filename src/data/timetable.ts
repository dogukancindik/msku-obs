// Bölüm ders programı — TÜM öğrenciler için ortak ve sabit.
// Her dersin şube(ler)i, haftalık saatleri ve dersliği buradan gelir; öğrencinin programı, Açılan Dersler,
// sınav saatleri ve Bahar ders kaydındaki çakışma kontrolü aynı veriyi kullanır.
//
// Kural: aynı müfredat yarıyılının dersleri (zorunlu + seçmeli havuzu + bölüm dışı) hangi şube seçilirse seçilsin
// birbiriyle ÇAKIŞMAZ. Çakışma yalnızca farklı yarıyıllardan ders alan (alttan / ertelenmiş) öğrencilerde doğabilir.
import { CURRICULUM, FALL_POOL, type Course, type Slot } from './msku';

export const CATALOG: Course[] = [...CURRICULUM, ...FALL_POOL];
export const catalogCourse = (code: string) => CATALOG.find((c) => c.code === code);

/** Birden fazla şubesi açılan dersler (kalabalık 1. ve 2. sınıf dersleri) */
const MULTI: Record<string, number> = {
  'SE 1003': 2, 'MATH 1851': 3, 'PHYS 1851': 2, 'SE 1004': 2, 'MATH 1852': 2, 'PHYS 1852': 2,
  'SE 2005': 2, 'MATH 2855': 2, 'SE 2004': 2, 'SE 2006': 2,
};
export const sectionCount = (code: string) => MULTI[code] ?? 1;

const ROOMS = ['CB-09', 'FZ-04', 'B-204', 'A-101', 'B-105', 'Mühendislik Amfi 2', 'Mühendislik Sanal Derslik 1'];
const LAB = 'Yazılım Müh. Lab.';

const hash = (s: string) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h >>> 0;
};
const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// Fisher–Yates: tarayıcıdan bağımsız, aynı tohum → aynı sıra (Array.sort ile rastgele karıştırma tarayıcıya göre değişir)
const shuffled = <T,>(r: () => number, a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const roomOf = (code: string, section: number) => ROOMS[hash(code + '#' + section) % ROOMS.length];

/** her gün sabah (08:30–12:15) ve öğleden sonra (13:30–17:15) 4'er saatlik iki yarım gün = 10 yarım gün */
type Grid = boolean[][];
const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const key = (code: string, section: number) => `${code}#${section}`;
const TABLE = new Map<string, Slot[]>();

function placeGroup(k: number) {
  const courses = CATALOG.filter((c) => c.semester === k && c.t + c.u > 0).sort((a, b) => b.t + b.u - (a.t + a.u));
  for (let attempt = 0; attempt < 500; attempt++) {
    const r = mulberry(hash(`grup-${k}-${attempt}`));
    const grid: Grid = Array.from({ length: 10 }, () => [true, true, true, true]);
    const out = new Map<string, Slot[]>();
    const place = (c: Course, section: number, hours: number, kind: Slot['kind'], avoidDay?: number) => {
      if (!hours) return { ok: true as const, day: undefined };
      const halves = shuffled(r, Array.from({ length: 10 }, (_, i) => i)).filter((h) => Math.floor(h / 2) !== avoidDay);
      for (const h of halves) {
        const starts = shuffled(r, Array.from({ length: 5 - hours }, (_, i) => i));
        for (const s of starts) {
          if (grid[h].slice(s, s + hours).every(Boolean)) {
            for (let i = s; i < s + hours; i++) grid[h][i] = false;
            const start = (h % 2 === 0 ? 8 * 60 + 30 : 13 * 60 + 30) + s * 60;
            const day = Math.floor(h / 2);
            const slot: Slot = { code: c.code, day, start: fmt(start), end: fmt(start + hours * 60 - 15), kind, room: kind === 'Uygulama' ? LAB : roomOf(c.code, section) };
            out.set(key(c.code, section), [...(out.get(key(c.code, section)) ?? []), slot]);
            return { ok: true as const, day };
          }
        }
      }
      return { ok: false as const, day: undefined };
    };
    let ok = true;
    // Şube grupları: grup 1 = tüm derslerin 1. şubesi; grup L = tek şubeli dersler + şube sayısı ≥ L olan derslerin L. şubesi.
    // Her grup kendi içinde çakışmasızdır (öğrenci aynı şube grubundan seçerse programı çakışmaz).
    const singles = courses.filter((c) => sectionCount(c.code) === 1);
    const layers = Math.max(1, ...courses.map((c) => sectionCount(c.code)));
    for (let L = 1; L <= layers && ok; L++) {
      for (const row of grid) row.fill(true);
      if (L > 1) for (const c of singles) for (const sl of out.get(key(c.code, 1)) ?? []) {
        const h = sl.day * 2 + (sl.start < '13:00' ? 0 : 1);
        const s0 = (toMin(sl.start) - (h % 2 === 0 ? 510 : 810)) / 60;
        const len = (toMin(sl.end) + 15 - toMin(sl.start)) / 60;
        for (let i = s0; i < s0 + len; i++) grid[h][i] = false;
      }
      const list = L === 1 ? courses : courses.filter((c) => sectionCount(c.code) >= L);
      for (const c of list) {
        const a = place(c, L, Math.min(c.t, 4), 'Teori');
        const b = a.ok ? place(c, L, Math.min(c.u, 4), 'Uygulama', a.day) : a;
        if (!a.ok || !b.ok) { ok = false; break; }
      }
    }
    if (ok) { out.forEach((v, kk) => TABLE.set(kk, v)); return; }
  }
  throw new Error(`Ders programı ${k}. yarıyıl için yerleştirilemedi`);
}
for (let k = 1; k <= 8; k++) placeGroup(k);

/** Dersin belirli şubesinin haftalık saatleri (staj gibi saatsiz derslerde boş) */
/** Şube grubu L için dersin şubesi (çok şubeli derslerde L, tek şubelilerde 1) */
export const sectionInStream = (code: string, stream: number) => Math.min(stream, sectionCount(code));
export const slotsOf = (code: string, section = 1): Slot[] => TABLE.get(key(code, section)) ?? [];

export const slotsClash = (a: Slot[], b: Slot[]) => a.some((x) => b.some((y) => x.day === y.day && toMin(x.start) < toMin(y.end) && toMin(y.start) < toMin(x.end)));

const DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum'];
export const slotText = (slots: Slot[]) => slots.length ? slots.map((s) => `${DAYS_SHORT[s.day]} ${s.start}–${s.end}`).join(' · ') : 'Haftalık saat yok';

/** Dönemde açılan dersler: Güz = tek yarıyıllar, Bahar = çift yarıyıllar */
export const offeredIn = (season: 'Güz' | 'Bahar') => CATALOG.filter((c) => c.semester % 2 === (season === 'Güz' ? 1 : 0));
