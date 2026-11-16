// Bahar (çift yarıyıl: 2, 4, 6, 8) ders kaydı kuralları — saf fonksiyonlar.
// Ders Kayıt sayfası, Açılan Dersler, Ana Sayfa ve tutarlılık testi aynı fonksiyonları kullanır.
import { ELECTIVES_REQUIRED, REG, isFail, type Course, type Slot } from '../data/msku';
import { CATALOG, offeredIn, sectionCount, slotsClash, slotsOf } from '../data/timetable';
import type { StudentData } from './academic';
import { latestAttempts } from './util';
import { t } from './i18n';

export type RegKind = 'retake' | 'deferred' | 'mandatory' | 'elective';
export type RegItem = {
  course: Course; // katalog dersi (semester = müfredat yarıyılı)
  kind: RegKind;
  locked: boolean; // öğrenci çıkaramaz (zorunlu alttan ders)
  waived: boolean; // devam zorunluluğu yok (önceki not FF)
  reason?: string;
};
export type Draft = { codes: string[]; sections: Record<string, number>; pinned?: string[]; status: 'draft' | 'submitted'; updated: string };
export type Issue = { level: 'error' | 'warning'; text: string; code?: string };

export const springTermOf = (D: StudentData) => {
  const y = D.entryYear + Math.floor(D.semester / 2);
  return { semester: D.semester + 1, name: `${y}-${y + 1} Bahar` };
};

/** Bahar kaydında öğrencinin önüne gelen dersler (öncelik sırasıyla) */
export function springCandidates(D: StudentData): RegItem[] {
  const next = D.semester + 1;
  const latest = latestAttempts(D.taken);
  const passed = new Set(latest.filter((c) => !isFail(c.grade)).map((c) => c.code));
  const inProgress = new Set(D.current.map((c) => c.code));
  const spring = offeredIn('Bahar');
  const items: RegItem[] = [];
  const add = (it: RegItem) => { if (!items.some((x) => x.course.code === it.course.code)) items.push(it); };

  // 1) Bahar'da açılan, son notu FF/TT olan dersler — önceliklidir
  for (const f of D.failed) {
    const c = spring.find((x) => x.code === f.course.code);
    if (!c) continue;
    const mandatory = c.type !== 'Seçmeli';
    add({ course: c, kind: 'retake', locked: mandatory, waived: f.reason === 'FF' && REG.repeatAttendanceWaived,
      reason: `${f.reason === 'TT' ? t('Devamsızlıktan kaldınız (TT) · devam zorunlu') : t('Sınavdan kaldınız (FF) · devam zorunluluğu yok')}${mandatory ? '' : ' · ' + t('seçmeli: yerine başka bir seçmeli de alınabilir')}` });
  }
  // 2) AKTS sınırı / çakışma nedeniyle ertelenmiş Bahar dersleri
  for (const c of D.deferred) {
    const cc = spring.find((x) => x.code === c.code);
    if (cc) add({ course: cc, kind: 'deferred', locked: false, waived: false, reason: `${t('{n}. yarıyıl dersi', { n: cc.semester })} · ${c.deferReason === 'clash' ? t('ders saati çakıştığı için ertelenmişti') : t('AKTS sınırı nedeniyle ertelenmişti')}` });
  }
  // 3) yeni yarıyılın zorunlu / bölüm dışı / disiplinlerarası dersleri
  for (const c of spring.filter((x) => x.semester === next && x.type !== 'Seçmeli')) if (!passed.has(c.code)) add({ course: c, kind: 'mandatory', locked: false, waived: false });
  // 4) teknik seçmeli havuzu: yeni yarıyıl ve önceki çift yarıyılların seçmelileri (geçilmemiş olanlar)
  for (const c of spring.filter((x) => x.type === 'Seçmeli' && x.semester <= next)) if (!passed.has(c.code) && !inProgress.has(c.code)) add({ course: c, kind: 'elective', locked: false, waived: false });
  return items;
}

/** Bahar için dönemlik AKTS sınırı (güz notları kesinleşince güncel AGNO'ya göre yeniden hesaplanır) */
export const springLimit = (D: StudentData) => REG.ectsLimit(D.agno);

/**
 * Seçili derslere şube atar.
 * - Öğrencinin kendisi seçtiği (sabitlenen, pinned) şubeler aynen kullanılır; çakışırsa çakışma olarak raporlanır.
 * - Diğer dersler için çakışmayan ilk şube seçilir (devam zorunlu dersler önce); hiçbiri boş değilse çakışma raporlanır.
 * Tüm çakışmalar iki yönlü raporlanır (A, B ile; B, A ile).
 */
export function assignSections(items: RegItem[], wanted: Record<string, number> = {}, pinned: string[] = []) {
  const busy: Slot[] = [];
  const sections: Record<string, number> = {};
  const owner = new Map<Slot, string>();
  const isPinned = (it: RegItem) => pinned.includes(it.course.code) && !!wanted[it.course.code];
  const order = [...items.filter(isPinned), ...items.filter((i) => !isPinned(i) && !i.waived), ...items.filter((i) => !isPinned(i) && i.waived)];
  for (const it of order) {
    const code = it.course.code;
    const n = sectionCount(code);
    let sec: number;
    if (isPinned(it)) sec = Math.min(wanted[code], n);
    else {
      const prefs = [wanted[code], ...Array.from({ length: n }, (_, i) => i + 1)].filter((x): x is number => !!x && x <= n);
      sec = prefs.find((s) => !slotsClash(slotsOf(code, s), busy)) ?? prefs[0] ?? 1;
    }
    sections[code] = sec;
    for (const s of slotsOf(code, sec)) { busy.push(s); owner.set(s, code); }
  }
  // çakışmalar: son atamaya göre her ders için, aynı saatte olduğu diğer dersler
  const clashes: { code: string; with: string[] }[] = [];
  for (const it of items) {
    const code = it.course.code;
    const mine = slotsOf(code, sections[code]);
    const others = items.filter((o) => o.course.code !== code && slotsClash(mine, slotsOf(o.course.code, sections[o.course.code]))).map((o) => o.course.code);
    if (others.length) clashes.push({ code, with: others });
  }
  return { sections, clashes };
}

/** Bir dersin belirli şubesi, diğer seçili derslerin mevcut şubeleriyle hangi derslerle çakışır? (şube listesinde göstermek için) */
export function sectionClashesWith(items: RegItem[], sections: Record<string, number>, code: string, sec: number) {
  const mine = slotsOf(code, sec);
  return items.filter((o) => o.course.code !== code && slotsClash(mine, slotsOf(o.course.code, sections[o.course.code] ?? 1))).map((o) => o.course.code);
}

/** Varsayılan taslak: alttan + ertelenen + yeni yarıyıl zorunluları (AKTS sınırına ve çakışmaya göre), seçmeliler boş */
export function defaultDraft(D: StudentData): Draft {
  const limit = springLimit(D);
  const cands = springCandidates(D);
  const picked: RegItem[] = [];
  for (const it of cands.filter((c) => c.kind !== 'elective')) {
    const ects = picked.reduce((a, x) => a + x.course.ects, 0);
    if (!it.locked && ects + it.course.ects > limit) continue;
    const trial = assignSections([...picked, it]);
    // devam zorunlu iki ders çakışıyorsa önerilen taslağa alınmaz (biri devam muafsa çakışma kabul edilebilir)
    const bad = trial.clashes.find((x) => x.code === it.course.code)?.with.some((o) => !it.waived && !picked.find((p) => p.course.code === o)?.waived);
    if (!it.locked && bad) continue;
    picked.push(it);
  }
  return { codes: picked.map((p) => p.course.code), sections: assignSections(picked).sections, pinned: [], status: 'draft', updated: new Date().toISOString() };
}

/** Taslağın kurallara uygunluğu */
export function validateDraft(D: StudentData, draft: Draft): Issue[] {
  const cands = springCandidates(D);
  const items = cands.filter((c) => draft.codes.includes(c.course.code));
  const issues: Issue[] = [];
  const limit = springLimit(D);
  const ects = items.reduce((a, x) => a + x.course.ects, 0);
  for (const code of draft.codes) if (!cands.some((c) => c.course.code === code)) issues.push({ level: 'error', code, text: t('{code} bu dönem alabileceğiniz dersler arasında değil.', { code }) });
  for (const it of cands.filter((c) => c.locked)) if (!draft.codes.includes(it.course.code)) issues.push({ level: 'error', code: it.course.code, text: t('{code} alttan alınması zorunlu bir ders; kayıttan çıkarılamaz.', { code: it.course.code }) });
  if (ects > limit) issues.push({ level: 'error', text: t('Toplam {a} AKTS, dönemlik üst sınırınızı ({b} AKTS) aşıyor. {c} AKTS’lik ders çıkarın.', { a: ects, b: limit, c: ects - limit }) });
  const { clashes } = assignSections(items, draft.sections, draft.pinned);
  // her çakışan ders çifti bir kez: ikisi de devam zorunluysa hata; biri devam muafsa uyarı.
  // Çakışmayı çözen başka bir şube varsa öneri olarak söylenir.
  const { sections } = assignSections(items, draft.sections, draft.pinned);
  const seen = new Set<string>();
  for (const c of clashes) for (const other of c.with) {
    const key = [c.code, other].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    const a = items.find((i) => i.course.code === c.code)!, b = items.find((i) => i.course.code === other)!;
    const fix = [a, b].flatMap((x) => Array.from({ length: sectionCount(x.course.code) }, (_, i) => i + 1)
      .filter((sec) => sec !== sections[x.course.code] && !sectionClashesWith(items, sections, x.course.code, sec).length)
      .map((sec) => t('{code} için Şube {n} çakışmasız', { code: x.course.code, n: sec })))[0];
    if (a.waived || b.waived) {
      const w = a.waived ? a : b;
      issues.push({ level: 'warning', code: w.course.code, text: t('{a} ile {b} aynı saatte. {w} için devam zorunluluğu olmadığından kayıt yapılabilir; o dersin yalnızca sınavlarına girersiniz.', { a: c.code, b: other, w: w.course.code }) + (fix ? ` ${fix}.` : '') });
    } else {
      issues.push({ level: 'error', code: c.code, text: t('{a} ile {b} aynı saatte.', { a: c.code, b: other }) + ' ' + (fix ? t('Şube değiştirin: {x}.', { x: fix }) : t('Hiçbir şube kombinasyonu boş değil; derslerden birini çıkarın.')) });
    }
  }
  // teknik seçmeli: şart AKTS ile (48). Tamamlanan + bu dönem alınan + taslak + sonraki yarıyılların plandaki seçmelileri (6'şar AKTS) yetmeli.
  const need = ELECTIVES_REQUIRED[D.semester + 1] ?? 0;
  const el = items.filter((i) => i.course.type === 'Seçmeli' && i.kind !== 'retake').length;
  const latestAll = latestAttempts(D.taken);
  const techDone = latestAll.filter((c) => c.type === 'Seçmeli' && !isFail(c.grade)).reduce((a, c) => a + c.ects, 0);
  const techNow = D.current.filter((c) => c.type === 'Seçmeli').reduce((a, c) => a + c.ects, 0);
  const techDraft = items.filter((i) => i.course.type === 'Seçmeli').reduce((a, i) => a + i.course.ects, 0);
  const laterSlots = Object.entries(ELECTIVES_REQUIRED).filter(([k]) => +k > D.semester + 1).reduce((a, [, v]) => a + v, 0);
  const techShort = REG.graduation.technical - (techDone + techNow + techDraft + laterSlots * 6);
  if (el < need) issues.push({ level: 'warning', text: t('{s}. yarıyıl planında {n} teknik seçmeli var; taslağınızda {m}.', { s: D.semester + 1, n: need, m: el }) });
  if (techShort > 0) issues.push({ level: 'warning', text: t('Bu taslak ve sonraki yarıyılların planıyla teknik seçmeli toplamınız {a} AKTS olur; mezuniyet için {b} AKTS gerekir ({c} AKTS eksik).', { a: REG.graduation.technical - techShort, b: REG.graduation.technical, c: techShort }) });
  const skippedMandatory = cands.filter((c) => (c.kind === 'mandatory' || c.kind === 'deferred') && c.course.type !== 'Seçmeli' && !draft.codes.includes(c.course.code));
  if (skippedMandatory.length) issues.push({ level: 'warning', text: t('Alınmayan zorunlu ders(ler): {list}. Bu dersler bir sonraki Bahar dönemine kalır ve mezuniyetiniz gecikebilir.', { list: skippedMandatory.map((c) => c.course.code).join(', ') }) });
  return issues;
}

export const findCatalog = (code: string) => CATALOG.find((c) => c.code === code);

// ---------------------------------------------------------------- saklama (kullanıcı başına)
const KEY = 'msku.springReg';
export function loadDraft(D: StudentData, email: string): Draft {
  try {
    const d: Draft | undefined = JSON.parse(localStorage.getItem(KEY) ?? '{}')[email];
    if (d) {
      const allowed = new Set(springCandidates(D).map((c) => c.course.code));
      const codes = d.codes.filter((c) => allowed.has(c));
      for (const it of springCandidates(D)) if (it.locked && !codes.includes(it.course.code)) codes.push(it.course.code);
      return { ...d, codes };
    }
  } catch { /* ignore */ }
  return defaultDraft(D);
}
export function saveDraft(email: string, d: Draft | null) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    if (d) all[email] = d; else delete all[email];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}
