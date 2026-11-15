// Bahar (çift yarıyıl: 2, 4, 6, 8) ders kaydı kuralları — saf fonksiyonlar.
// Ders Kayıt sayfası, Açılan Dersler, Ana Sayfa ve tutarlılık testi aynı fonksiyonları kullanır.
import { ELECTIVES_REQUIRED, REG, isFail, type Course, type Slot } from '../data/msku';
import { CATALOG, offeredIn, sectionCount, slotsClash, slotsOf } from '../data/timetable';
import type { StudentData } from './academic';
import { latestAttempts } from './util';

export type RegKind = 'retake' | 'deferred' | 'mandatory' | 'elective';
export type RegItem = {
  course: Course; // katalog dersi (semester = müfredat yarıyılı)
  kind: RegKind;
  locked: boolean; // öğrenci çıkaramaz (zorunlu alttan ders)
  waived: boolean; // devam zorunluluğu yok (önceki not FF)
  reason?: string;
};
export type Draft = { codes: string[]; sections: Record<string, number>; status: 'draft' | 'submitted'; updated: string };
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
      reason: `${f.reason === 'TT' ? 'Devamsızlıktan kaldınız (TT) · devam zorunlu' : 'Sınavdan kaldınız (FF) · devam zorunluluğu yok'}${mandatory ? '' : ' · seçmeli: yerine başka bir seçmeli de alınabilir'}` });
  }
  // 2) AKTS sınırı / çakışma nedeniyle ertelenmiş Bahar dersleri
  for (const c of D.deferred) {
    const cc = spring.find((x) => x.code === c.code);
    if (cc) add({ course: cc, kind: 'deferred', locked: false, waived: false, reason: `${cc.semester}. yarıyıl dersi · ${c.deferReason === 'clash' ? 'ders saati çakıştığı için' : 'AKTS sınırı nedeniyle'} ertelenmişti` });
  }
  // 3) yeni yarıyılın zorunlu / bölüm dışı / disiplinlerarası dersleri
  for (const c of spring.filter((x) => x.semester === next && x.type !== 'Seçmeli')) if (!passed.has(c.code)) add({ course: c, kind: 'mandatory', locked: false, waived: false });
  // 4) teknik seçmeli havuzu: yeni yarıyıl ve önceki çift yarıyılların seçmelileri (geçilmemiş olanlar)
  for (const c of spring.filter((x) => x.type === 'Seçmeli' && x.semester <= next)) if (!passed.has(c.code) && !inProgress.has(c.code)) add({ course: c, kind: 'elective', locked: false, waived: false });
  return items;
}

/** Bahar için dönemlik AKTS sınırı (güz notları kesinleşince güncel AGNO'ya göre yeniden hesaplanır) */
export const springLimit = (D: StudentData) => REG.ectsLimit(D.agno);

/** Seçili derslere çakışmayan şube atar (devam zorunlu dersler önce). Atanamayanlar çakışma olarak döner. */
export function assignSections(items: RegItem[], wanted: Record<string, number> = {}) {
  const busy: Slot[] = [];
  const sections: Record<string, number> = {};
  const clashes: { code: string; with: string[] }[] = [];
  const order = [...items.filter((i) => !i.waived), ...items.filter((i) => i.waived)];
  const owner = new Map<Slot, string>();
  for (const it of order) {
    const code = it.course.code;
    const n = sectionCount(code);
    const prefs = [wanted[code], ...Array.from({ length: n }, (_, i) => i + 1)].filter((x): x is number => !!x && x <= n);
    const sec = prefs.find((s) => !slotsClash(slotsOf(code, s), busy));
    if (sec !== undefined) {
      sections[code] = sec;
      for (const s of slotsOf(code, sec)) { busy.push(s); owner.set(s, code); }
    } else {
      sections[code] = prefs[0] ?? 1;
      const mine = slotsOf(code, sections[code]);
      clashes.push({ code, with: [...new Set(busy.filter((b) => slotsClash([b], mine)).map((b) => owner.get(b)!))] });
    }
  }
  return { sections, clashes };
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
    if (!it.locked && trial.clashes.some((x) => x.code === it.course.code && !it.waived)) continue;
    picked.push(it);
  }
  return { codes: picked.map((p) => p.course.code), sections: assignSections(picked).sections, status: 'draft', updated: new Date().toISOString() };
}

/** Taslağın kurallara uygunluğu */
export function validateDraft(D: StudentData, draft: Draft): Issue[] {
  const cands = springCandidates(D);
  const items = cands.filter((c) => draft.codes.includes(c.course.code));
  const issues: Issue[] = [];
  const limit = springLimit(D);
  const ects = items.reduce((a, x) => a + x.course.ects, 0);
  for (const code of draft.codes) if (!cands.some((c) => c.course.code === code)) issues.push({ level: 'error', code, text: `${code} bu dönem alabileceğiniz dersler arasında değil.` });
  for (const it of cands.filter((c) => c.locked)) if (!draft.codes.includes(it.course.code)) issues.push({ level: 'error', code: it.course.code, text: `${it.course.code} alttan alınması zorunlu bir ders; kayıttan çıkarılamaz.` });
  if (ects > limit) issues.push({ level: 'error', text: `Toplam ${ects} AKTS, dönemlik üst sınırınızı (${limit} AKTS) aşıyor. ${ects - limit} AKTS’lik ders çıkarın.` });
  const { clashes } = assignSections(items, draft.sections);
  for (const c of clashes) {
    const it = items.find((i) => i.course.code === c.code)!;
    if (it.waived) issues.push({ level: 'warning', code: c.code, text: `${c.code}, ${c.with.join(', ')} ile çakışıyor. Devam zorunluluğu olmadığı için kayıt yapılabilir; yalnızca sınavlarına girersiniz.` });
    else issues.push({ level: 'error', code: c.code, text: `${c.code}, ${c.with.join(', ')} ile aynı saatte ve hiçbir şubesi boş değil. Derslerden birini çıkarın.` });
  }
  const need = ELECTIVES_REQUIRED[D.semester + 1] ?? 0;
  const el = items.filter((i) => i.course.type === 'Seçmeli' && i.kind !== 'retake').length;
  if (el < need) issues.push({ level: 'warning', text: `${D.semester + 1}. yarıyıl planında ${need} teknik seçmeli var; taslağınızda ${el}. Mezuniyet için toplam 48 AKTS teknik seçmeli gerekir.` });
  const skippedMandatory = cands.filter((c) => (c.kind === 'mandatory' || c.kind === 'deferred') && c.course.type !== 'Seçmeli' && !draft.codes.includes(c.course.code));
  if (skippedMandatory.length) issues.push({ level: 'warning', text: `Alınmayan zorunlu ders(ler): ${skippedMandatory.map((c) => c.course.code).join(', ')}. Bu dersler bir sonraki Bahar dönemine kalır ve mezuniyetiniz gecikebilir.` });
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
