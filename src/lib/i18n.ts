// Dil desteği: Türkçe (kaynak), İngilizce, Almanca, Arapça (sağdan sola).
// Arayüz metinleri Türkçe yazılır ve t('…') ile sarılır; çeviriler src/i18n/dict.ts içindedir.
// Değişkenli metinler: t('{n} ders', { n: 5 }). Çevirisi olmayan metin Türkçe gösterilir ve
// window.__i18nMissing içinde toplanır (eksik çeviri taraması bunu kullanır).
import { DICT } from '../i18n/dict';

export type Lang = 'tr' | 'en' | 'de' | 'ar';
export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'tr', label: 'Türkçe', short: 'TR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'ar', label: 'العربية', short: 'AR' },
];
const IDX: Record<Exclude<Lang, 'tr'>, 0 | 1 | 2> = { en: 0, de: 1, ar: 2 };
const LOCALE: Record<Lang, string> = { tr: 'tr-TR', en: 'en-GB', de: 'de-DE', ar: 'ar-u-nu-latn' };

let current: Lang = 'tr';
export const getLang = () => current;
export const locale = () => LOCALE[current];
export const isRtl = () => current === 'ar';

export function applyLang(l: Lang) {
  current = LANGS.some((x) => x.code === l) ? l : 'tr';
  if (typeof document !== 'undefined') {
    document.documentElement.lang = current;
    document.documentElement.dir = current === 'ar' ? 'rtl' : 'ltr';
  }
}

const missing = new Set<string>();
if (typeof window !== 'undefined') (window as unknown as { __i18nMissing: Set<string> }).__i18nMissing = missing;

/** Arayüz metnini seçili dile çevirir. {ad} biçimindeki yer tutucular vars ile doldurulur. */
export function t(s: string, vars?: Record<string, string | number>): string {
  let out = s;
  if (current !== 'tr') {
    const row = DICT[s];
    if (row) out = row[IDX[current]];
    else missing.add(s);
  }
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
  return out;
}

/** "2026-2027 Güz" gibi dönem adlarındaki Güz/Bahar kelimesini çevirir */
export const term = (name: string) => name.replace(/Güz|Bahar/g, (m) => t(m));

/** Varsa çevirir, yoksa olduğu gibi bırakır (kişi adları gibi çevrilmeyecek değerler için; eksik listesine eklenmez) */
export const tOpt = (s: string) => (current !== 'tr' && DICT[s] ? DICT[s][IDX[current as Exclude<Lang, 'tr'>]] : s);

/** Yüzde: Türkçede %40, diğer dillerde 40% / 40 % */
export const pct = (n: number | string) => (current === 'tr' ? `%${n}` : current === 'de' ? `${n} %` : `${n}%`);
