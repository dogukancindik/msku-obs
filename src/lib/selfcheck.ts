// Geliştirici aracı: üretilen öğrenci profillerinde mantık tutarlılığını denetler.
// Tarayıcı konsolunda: (await import('/src/lib/selfcheck.ts')).runSelfCheck(300)
// Uygulamanın kendisi bu dosyayı kullanmaz.
import { CURRICULUM, FALL_POOL, REG, isFail } from '../data/msku';
const FALL_POOL_ALL = () => FALL_POOL;
import { catalogCourse, offeredIn, sectionCount, slotsClash, slotsOf } from '../data/timetable';
import { defaultDraft, springCandidates, springLimit, validateDraft } from './registration';
import { generate, type StudentData } from './academic';
import { cumulativeGpa, latestAttempts, passedEcts } from './util';

export function checkProfile(D: StudentData): string[] {
  const e: string[] = [];
  const T = D.taken;
  const limitAt = (k: number) => (k === 1 ? 30 : REG.ectsLimit(cumulativeGpa(T.filter((c) => c.semester < k))));
  // k. yarıyılda alttan dersler (önceliklidir) bu dersi de alacak yer bırakmış mı?
  const semFull = (k: number, add: number) => T.filter((c) => c.semester === k && (c.attempt ?? 1) > 1).reduce((a, c) => a + c.ects, 0) + add > limitAt(k);
  if (D.semester !== D.year * 2 - 1) e.push(`yarıyıl/sınıf uyumsuz: ${D.year}. sınıf, ${D.semester}. yy`);

  for (const c of T) {
    const prev = T.filter((x) => x.code === c.code && x.semester < c.semester);
    const same = T.filter((x) => x.code === c.code && x.semester === c.semester);
    if (same.length > 1) e.push(`${c.code} aynı yarıyılda iki kez alınmış (${c.semester})`);
    if ((c.attempt ?? 1) !== prev.length + 1) e.push(`${c.code} alış sayısı yanlış (${c.attempt} ≠ ${prev.length + 1})`);
    if (c.semester < (c.planned ?? c.semester)) e.push(`${c.code} müfredat yarıyılından (${c.planned}) önce alınmış (${c.semester})`);
    if (c.semester % 2 !== (c.planned ?? c.semester) % 2) e.push(`${c.code} açılmadığı dönemde alınmış (müfredat ${c.planned}. yy, alındı ${c.semester}. yy)`);
    if (prev.length) {
      const last = prev[prev.length - 1];
      if (!isFail(last.grade)) e.push(`${c.code} geçilmiş ders tekrar alınmış`);
      // ilk uygun dönemde (aynı Güz/Bahar) alınmalı; ancak o dönem AKTS sınırı doluysa bir sonrakine kalabilir
      for (let k = last.semester + 2; k < c.semester; k += 2) if (!semFull(k, c.ects)) { e.push(`${c.code} ${k}. yy'da yer varken alttan alınmamış (${c.semester}. yy'a kalmış)`); break; }
      if (c.waived && last.grade !== 'FF') e.push(`${c.code} devam muafiyeti hatalı (önceki not ${last.grade})`);
    } else if (c.waived) e.push(`${c.code} ilk alışta devam muafiyeti olamaz`);
    if (isFail(c.grade) && !T.some((x) => x.code === c.code && x.semester > c.semester))
      for (let k = c.semester + 2; k <= D.semester; k += 2) if (!semFull(k, c.ects) && !(k === D.semester && D.failed.find((f) => f.course.code === c.code)?.blocked === 'clash')) { e.push(`${c.code} ${c.semester}. yy'da kalınmış, ${k}. yy'da yer varken alttan alınmamış`); break; }
    if (c.semester < D.semester && !c.grade) e.push(`${c.code} geçmiş dönemde notsuz`);
    if (c.semester === D.semester && c.grade) e.push(`${c.code} aktif dönemde kesin notlu`);
    if (c.superseded && !T.some((x) => x.code === c.code && x.semester > c.semester && x.grade)) e.push(`${c.code} yanlışlıkla 'geçersiz' işaretli`);
  }

  // dönemlik AKTS sınırı
  for (let k = 1; k <= D.semester; k++) {
    const ects = T.filter((c) => c.semester === k).reduce((a, c) => a + c.ects, 0);
    const limit = k === 1 ? 30 : REG.ectsLimit(cumulativeGpa(T.filter((c) => c.semester < k)));
    if (ects > limit) e.push(`${k}. yy ${ects} AKTS > sınır ${limit}`);
  }

  // müfredat zorunluları kaybolmamalı
  for (const c of CURRICULUM.filter((x) => x.semester <= D.semester && x.type !== 'Seçmeli'))
    if (!T.some((x) => x.code === c.code) && !D.deferred.some((x) => x.code === c.code)) e.push(`${c.code} (${c.semester}. yy zorunlu) ne alınmış ne ertelenmiş`);
  for (const c of D.deferred) if (T.some((x) => x.code === c.code)) e.push(`${c.code} hem ertelenmiş hem alınmış`);

  // aktif dönem verileri
  if (D.current.length !== T.filter((c) => c.semester === D.semester).length) e.push('aktif dönem listesi uyumsuz');
  for (const c of D.current) {
    if (!D.grades.some((g) => g.code === c.code)) e.push(`${c.code} not listesinde yok`);
    if (c.t + c.u > 0 && !c.clash && !D.schedule.some((s) => s.code === c.code)) e.push(`${c.code} ders programında yok`);
    if (c.t + c.u > 0 && !D.absence[c.code]) e.push(`${c.code} devamsızlık kaydı yok`);
    if (!D.info[c.code]) e.push(`${c.code} ders bilgisi yok`);
    const lim = Math.floor((c.t + c.u) * 14 * 0.3);
    const abs = (D.absence[c.code] ?? []).reduce((a, b) => a + b, 0);
    if (c.waived && abs > 0) e.push(`${c.code} devam muaf ama devamsızlık yazılmış`);
    if (abs > lim && D.exams.some((x) => x.code === c.code && x.type !== 'Ara Sınav')) e.push(`${c.code} TT ama final/bütünleme sınavı listelenmiş`);
  }
  // çakışma
  for (const a of D.schedule) for (const b of D.schedule)
    if (a !== b && a.day === b.day && a.start < b.end && b.start < a.end) { e.push(`program çakışması ${a.code}/${b.code}`); break; }

  // başarısız listesi ve sayılar
  const latest = latestAttempts(T);
  const failCodes = latest.filter((c) => c.grade === 'FF' || c.grade === 'TT').map((c) => c.code).sort().join();
  if (failCodes !== D.failed.map((f) => f.course.code).sort().join()) e.push('başarısız ders listesi uyumsuz');
  for (const f of D.failed) if (f.retaking !== D.current.some((c) => c.code === f.course.code)) e.push(`${f.course.code} 'alttan alınıyor' bayrağı yanlış`);
  if (Math.abs(D.agno - cumulativeGpa(T)) > 1e-9) e.push('AGNO yeniden hesaplamayla uyuşmuyor');
  if (D.ectsDone !== passedEcts(T)) e.push('tamamlanan AKTS uyuşmuyor');
  const termSum = D.stats.reduce((a, s) => a + s.passedEcts, 0);
  if (termSum !== D.ectsDone) e.push(`dönemlerin başarılan AKTS toplamı (${termSum}) ≠ tamamlanan (${D.ectsDone})`);
  if (T.some((c) => c.semester === 1 && (c.attempt ?? 1) > 1)) e.push('1. yarıyılda alttan ders var');

  // ---- ortak ders programı, şubeler, hocalar
  for (const c of T) if (c.instructor !== catalogCourse(c.code)?.instructor) e.push(`${c.code} hocası katalogla farklı (${c.instructor})`);
  for (const c of D.current) {
    const sec = c.section ?? 0;
    if (sec < 1 || sec > sectionCount(c.code)) e.push(`${c.code} geçersiz şube ${sec}`);
    if (D.info[c.code]?.section !== sec) e.push(`${c.code} ders bilgisindeki şube programla farklı`);
    const mine = D.schedule.filter((x) => x.code === c.code);
    const official = c.clash ? [] : slotsOf(c.code, sec);
    if (JSON.stringify(mine) !== JSON.stringify(official)) e.push(`${c.code} programı ortak bölüm programıyla aynı değil`);
    if (c.clash && !c.waived) e.push(`${c.code} devam zorunlu olduğu halde çakışmalı kayıtlı`);
    if (c.clash && !slotsClash(slotsOf(c.code, sec), D.schedule)) e.push(`${c.code} çakışma işareti gereksiz`);
  }
  for (const c of D.deferred) if (c.deferReason !== 'limit' && c.deferReason !== 'clash') e.push(`${c.code} erteleme nedeni yok`);
  if (D.current.some((c) => c.semester % 2 !== D.semester % 2)) e.push('aktif dönemde açılmayan ders var');
  for (const c of D.current) if (!offeredIn(D.semester % 2 ? 'Güz' : 'Bahar').some((x) => x.code === c.code)) e.push(`${c.code} açılan dersler listesinde yok`);

  // ---- sınavlar
  const toMin = (d: Date) => d.getHours() * 60 + d.getMinutes();
  for (const x of D.exams) {
    if (!D.current.some((c) => c.code === x.code)) e.push(`${x.code} sınavı var ama ders alınmıyor`);
    if ([0, 6].includes(x.date.getDay())) e.push(`${x.code} ${x.type} hafta sonuna denk geliyor`);
    for (const y of D.exams) if (x !== y && x.date.toDateString() === y.date.toDateString() && toMin(x.date) < toMin(y.date) + y.durationMin && toMin(y.date) < toMin(x.date) + x.durationMin) { e.push(`sınav çakışması ${x.code}/${y.code} (${x.type})`); break; }
  }
  for (const c of D.current.filter((c) => c.t + c.u > 0)) if (!D.exams.some((x) => x.code === c.code && x.type === 'Ara Sınav')) e.push(`${c.code} ara sınavı yok`);

  // ---- mesajlar
  for (const m of [...D.inbox, ...D.sent]) if (m.course) {
    const c = D.current.find((x) => x.code === m.course);
    if (!c) e.push(`mesaj ${m.id}: ${m.course} bu dönem alınmıyor`);
    else if (m.kind === 'Ders' && m.from !== c.instructor && m.to !== c.instructor) e.push(`mesaj ${m.id}: ${m.course} hocası (${c.instructor}) ile uyuşmuyor`);
  }

  const lab = D.sent.find((m) => m.subject.startsWith('Laboratuvar telafisi'));
  if (lab && !((D.absence[lab.course!]?.[7] ?? 0) > 0)) e.push(`${lab.course} laboratuvara katılmadım mesajı var ama devamsızlık kaydı yok`);
  const ann = D.inbox.find((m) => m.subject.includes('Ara sınav notları açıklandı'));
  if (ann) { const g = D.grades.find((x) => x.code === ann.course); if (!g || g.vize.score === undefined) e.push(`${ann.course} ara sınav notu açıklandı mesajı var ama not yok`);
    else if (Math.round((Date.now() - ann.date.getTime()) / 864e5) - (g.vize.announced ?? 0) > 1) e.push(`${ann.course} not duyurusu tarihi not listesindeki tarihle uyuşmuyor`); }

  // ---- Bahar ders kaydı (bir sonraki çift yarıyıl)
  const cands = springCandidates(D);
  const spring = offeredIn('Bahar');
  for (const it of cands) {
    if (!spring.some((x) => x.code === it.course.code)) e.push(`Bahar adayı ${it.course.code} Bahar'da açılmıyor`);
    if (latest.some((x) => x.code === it.course.code && !isFail(x.grade))) e.push(`Bahar adayı ${it.course.code} zaten geçilmiş`);
    if (it.course.semester > D.semester + 1) e.push(`Bahar adayı ${it.course.code} öğrencinin yarıyılından ileride`);
  }
  for (const f of D.failed.filter((f) => f.offered === 'Bahar')) if (!cands.some((c) => c.course.code === f.course.code && c.kind === 'retake')) e.push(`Bahar'da açılan başarısız ${f.course.code} kayıtta yok`);
  for (const c of D.deferred.filter((c) => c.semester % 2 === 0)) if (!cands.some((x) => x.course.code === c.code)) e.push(`ertelenen Bahar dersi ${c.code} kayıtta yok`);
  for (const c of CURRICULUM.filter((x) => x.semester === D.semester + 1 && x.type !== 'Seçmeli')) if (!cands.some((x) => x.course.code === c.code)) e.push(`${D.semester + 1}. yy zorunlu ${c.code} kayıtta yok`);
  const draft = defaultDraft(D);
  const errs = validateDraft(D, draft).filter((i) => i.level === 'error');
  if (errs.length) e.push(`önerilen Bahar taslağı geçersiz: ${errs.map((x) => x.text).join(' | ')}`);
  if (draft.codes.reduce((a, code) => a + (catalogCourse(code)?.ects ?? 0), 0) > springLimit(D)) e.push('önerilen taslak AKTS sınırını aşıyor');
  return e;
}

export function runSelfCheck(n = 300) {
  const KEY = 'msku.students';
  const backup = localStorage.getItem(KEY);
  const report: Record<string, string[]> = {};
  const counts = { profiles: 0, withFail: 0, retakingNow: 0, ttNow: 0, deferred: 0 };
  try {
    for (let i = 0; i < n; i++) {
      for (const year of [2, 3, 4]) {
        const email = `test${i}.ogrenci@posta.mu.edu.tr`;
        const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
        all[email] = { year, seed: (i * 2654435761 + year) >>> 0 };
        localStorage.setItem(KEY, JSON.stringify(all));
        const D = generate(email, 'Test Öğrenci');
        counts.profiles++;
        if (D.failed.length) counts.withFail++;
        if (D.current.some((c) => (c.attempt ?? 1) > 1)) counts.retakingNow++;
        if (D.current.some((c) => !c.waived && c.t + c.u > 0 && (D.absence[c.code] ?? []).reduce((a, b) => a + b, 0) > Math.floor((c.t + c.u) * 14 * 0.3))) counts.ttNow++;
        if (D.deferred.length) counts.deferred++;
        const errs = checkProfile(D);
        if (errs.length) report[`${email} (${year}. sınıf)`] = errs;
      }
    }
  } finally {
    if (backup === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, backup);
  }
  return { counts, timetable: checkTimetable(), failing: Object.keys(report).length, report };
}

/** Ortak bölüm programı: aynı yarıyılın dersleri, hangi şube seçilirse seçilsin çakışmamalı */
export function checkTimetable(): string[] {
  const e: string[] = [];
  for (let k = 1; k <= 8; k++) {
    const list = [...CURRICULUM, ...FALL_POOL_ALL()].filter((c) => c.semester === k && c.t + c.u > 0);
    // şube grubu L: tek şubeli dersler (1. şube) + şube sayısı ≥ L olan derslerin L. şubesi → kendi içinde çakışmasız olmalı
    const layers = Math.max(1, ...list.map((c) => sectionCount(c.code)));
    for (let L = 1; L <= layers; L++) {
      const set = list.filter((c) => sectionCount(c.code) === 1 || sectionCount(c.code) >= L).map((c) => [c.code, sectionCount(c.code) === 1 ? 1 : L] as const);
      for (const [a, sa] of set) for (const [b, sb] of set) if (a < b && slotsClash(slotsOf(a, sa), slotsOf(b, sb))) e.push(`${k}. yy şube grubu ${L}: ${a}/${sa} ile ${b}/${sb} çakışıyor`);
    }
    for (const c of list) for (let i = 1; i <= sectionCount(c.code); i++) {
      const sl = slotsOf(c.code, i);
      const hours = sl.reduce((a, s) => a + (Number(s.end.slice(0, 2)) * 60 + Number(s.end.slice(3)) + 15 - Number(s.start.slice(0, 2)) * 60 - Number(s.start.slice(3))) / 60, 0);
      if (hours !== Math.min(c.t, 4) + Math.min(c.u, 4)) e.push(`${c.code}/${i} saat sayısı ${hours} ≠ ${c.t}+${c.u}`);
    }
  }
  return e;
}
