// Her öğrenci (e-posta) için kalıcı ve kendine özgü akademik profil üretir.
// Aynı e-posta her zaman aynı profili verir (tohumlu rastgele sayı üreteci); sınıf ve tohum localStorage'da saklanır.
import {
  ANNOUNCEMENTS, COURSE_INFO, CURRICULUM, ELECTIVES_REQUIRED, FALL_POOL, LETTERS, POINTS, REG, addDays, isFail,
  type Course, type Exam, type ExamType, type GradeRow, type Letter, type Message, type Slot,
} from '../data/msku';
import { cumulativeGpa, gpa, latestAttempts, passedEcts } from './util';
import { catalogCourse, roomOf, sectionCount, sectionInStream, slotsClash, slotsOf } from '../data/timetable';

export type StudentData = {
  year: number;
  semester: number;
  term: string;
  entryYear: number;
  number: string;
  prep: string;
  enrolled: string;
  advisor: { name: string; office: string; hours: string };
  terms: { semester: number; name: string }[];
  taken: Course[]; // all courses the student has taken or is taking (grade set for completed)
  current: Course[];
  grades: GradeRow[];
  schedule: Slot[];
  exams: Exam[];
  absence: Record<string, number[]>;
  info: Record<string, { section: number; credit: number; aim: string; room: string }>;
  inbox: Message[];
  sent: Message[];
  agno: number;
  lastYano: number;
  ectsDone: number;
  stats: TermStat[];
  /** Akademik profil: güçlü / orta / zorlanan */
  tier: 'strong' | 'average' | 'struggling';
  /** Başarısız olunup henüz geçilmemiş dersler (son alış FF/TT) — bu dönem tekrar alınanlar dahil */
  failed: { course: Course; reason: 'FF' | 'TT'; retaking: boolean; offered: 'Güz' | 'Bahar'; blocked?: 'limit' | 'clash' }[];
  /** Dönemlik AKTS sınırı nedeniyle ertelenen (hiç alınmamış) müfredat dersleri */
  deferred: Course[];
};
export type TermStat = { semester: number; name: string; count: number; ects: number; passedEcts: number; yano: number | null; agno: number | null; inProgress: boolean };

// ---------------------------------------------------------------- rng
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
type Rng = ReturnType<typeof mulberry>;
const pick = <T,>(r: Rng, a: T[]) => a[Math.floor(r() * a.length)];
const shuffle = <T,>(r: Rng, a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const int = (r: Rng, a: number, b: number) => a + Math.floor(r() * (b - a + 1));

export { gpa };

// ---------------------------------------------------------------- persisted identity
const KEY = 'msku.students';
type Stored = { year: number; seed: number };
function stored(email: string): Stored {
  const local = email.split('@')[0].toLowerCase();
  let all: Record<string, Stored> = {};
  try { all = JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { /* ignore */ }
  if (all[email]) return all[email];
  const seed = hash(local);
  const s = { year: 2 + (seed % 3), seed }; // 2., 3. veya 4. sınıf
  all[email] = s;
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
  return s;
}

const ADVISORS = [
  { name: 'Dr. Öğr. Üyesi Cihat Çetinkaya', office: 'Mühendislik Fakültesi, Yazılım Müh. Bölümü', hours: 'Salı 14:00–16:00' },
  { name: 'Doç. Dr. Emine Elif Tülay', office: 'Mühendislik Fakültesi, Yazılım Müh. Bölümü', hours: 'Çarşamba 10:00–12:00' },
  { name: 'Doç. Dr. Selim Yılmaz', office: 'Mühendislik Fakültesi, Yazılım Müh. Bölümü', hours: 'Perşembe 13:30–15:30' },
  { name: 'Dr. Öğr. Üyesi Erkut Tekeli', office: 'Mühendislik Fakültesi, Yazılım Müh. Bölümü', hours: 'Pazartesi 15:00–17:00' },
];
const DEPT_STAFF = ['Dr. Öğr. Üyesi Cihat Çetinkaya', 'Doç. Dr. Emine Elif Tülay', 'Doç. Dr. Selim Yılmaz', 'Dr. Öğr. Üyesi Erkut Tekeli', 'Öğr. Gör. Dr. Övgü Öztürk Ergün'];
const ROOMS = ['CB-09', 'FZ-04', 'B-204', 'A-101', 'Mühendislik Sanal Derslik 1'];
const LAB = 'Yazılım Müh. Lab.';

const termName = (entry: number, k: number) => {
  const y = entry + Math.floor((k - 1) / 2);
  return `${y}-${y + 1} ${k % 2 ? 'Güz' : 'Bahar'}`;
};

// profil türü e-postadan ayrı bir özetle belirlenir (demo hesaplar farklı durumları gösterir)
let TIER_SALT = ':t50';
export const __setTierSalt = (s: string) => { TIER_SALT = s; };

// ---------------------------------------------------------------- main
export function generate(email: string, displayName: string): StudentData {
  const { year, seed } = stored(email);
  const r = mulberry(seed);
  const semester = year * 2 - 1;
  const entryYear = 2026 - (year - 1);
  const prepYear = entryYear - 1;
  const number = `${String(prepYear).slice(2)}0717${String((seed % 899) + 101).padStart(3, '0')}`;
  const advisor = ADVISORS[seed % ADVISORS.length];
  // akademik profil: çoğu öğrenci orta/güçlü, bir kısmı zorlanıyor (başarısız / alttan / devamsız dersleri olur)
  const tr = (hash(email.split('@')[0].toLowerCase() + TIER_SALT) % 1000) / 1000;
  const tier: StudentData['tier'] = tr < 0.35 ? 'strong' : tr < 0.72 ? 'average' : 'struggling';
  const ability = tier === 'strong' ? 3.0 + r() * 0.8 : tier === 'average' ? 2.3 + r() * 0.7 : 1.7 + r() * 0.8; // ortalama not puanı eğilimi
  const failP = tier === 'strong' ? 0.01 : tier === 'average' ? 0.05 : 0.17;
  const PASSING = LETTERS.filter((l) => l !== 'FF');
  const letterFor = (p: number) => PASSING.reduce((best, l) => (Math.abs(POINTS[l] - p) < Math.abs(POINTS[best] - p) ? l : best), 'AA' as Letter);

  // Yarıyıl yarıyıl ders alımı. Başarısız olunan ders, bir sonraki aynı dönemde (Güz→Güz, Bahar→Bahar) öncelikli olarak tekrar alınır.
  // Dönemlik AKTS sınırı (AGNO'ya göre 30/36/40) aşılırsa o yarıyılın seçmeli/son dersleri ertelenir.
  const stream = 1 + (seed % 2); // öğrencinin şube grubu (1 veya 2)
  const taken: Course[] = [];
  let backlog: Course[] = []; // müfredat dersleri (planned = müfredat yarıyılı)
  for (let k = 1; k <= semester; k++) {
    const sem = CURRICULUM.filter((c) => c.semester === k);
    const mandatory = sem.filter((c) => c.type !== 'Seçmeli');
    const pool = [...sem.filter((c) => c.type === 'Seçmeli'), ...(k === 5 ? FALL_POOL : [])];
    const electives = shuffle(r, pool).slice(0, ELECTIVES_REQUIRED[k] ?? 0);
    const limit = k === 1 ? 30 : REG.ectsLimit(cumulativeGpa(taken));
    const due = backlog.filter((c) => c.semester % 2 === k % 2); // dersin açıldığı dönem
    backlog = backlog.filter((c) => !due.includes(c));
    // öncelik: önce başarısız (alttan) dersler, sonra ertelenenler, sonra yarıyılın kendi dersleri — hepsi AKTS sınırı içinde
    const isRetake = (c: Course) => taken.some((x) => x.code === c.code);
    const load: Course[] = [];
    const fresh = [...due.filter(isRetake), ...due.filter((c) => !isRetake(c)), ...mandatory, ...electives];
    for (const c of fresh) {
      if (load.reduce((a, x) => a + x.ects, 0) + c.ects <= limit) load.push(c);
      else backlog.push({ ...c, deferReason: 'limit' }); // AKTS sınırı nedeniyle ertelendi
    }
    // Aktif dönemde şube seçimi (ortak bölüm programından). Devam zorunlu dersler çakışamaz; çakışan ders ertelenir.
    // Devam zorunluluğu olmayan alttan ders (önceki not FF) çakışabilir: kayıtlı olur, yalnızca sınavlarına girilir.
    if (k === semester) {
      const waivedOf = (c: Course) => { const p = taken.filter((x) => x.code === c.code); return p.length > 0 && REG.repeatAttendanceWaived && p[p.length - 1].grade === 'FF'; };
      const busy: Slot[] = [];
      const keep: Course[] = [];
      for (const c of [...load.filter((c) => !waivedOf(c)), ...load.filter(waivedOf)]) {
        // kendi yarıyılının dersleri için öğrencinin şube grubu önce denenir (grup içi çakışmasız)
        const pref = sectionInStream(c.code, stream);
        const secs = [pref, ...shuffle(r, Array.from({ length: sectionCount(c.code) }, (_, i) => i + 1)).filter((x) => x !== pref)];
        if (c.t + c.u === 0) { keep.push({ ...c, section: 1 }); continue; }
        const freeSec = secs.find((sec) => !slotsClash(slotsOf(c.code, sec), busy));
        if (freeSec) { keep.push({ ...c, section: freeSec }); busy.push(...slotsOf(c.code, freeSec)); }
        else if (waivedOf(c)) keep.push({ ...c, section: secs[0], clash: true });
        else backlog.push({ ...c, deferReason: 'clash' });
      }
      load.splice(0, load.length, ...fresh.filter((c) => keep.some((x) => x.code === c.code)).map((c) => keep.find((x) => x.code === c.code)!));
    }
    for (const c of load) {
      const prev = taken.filter((x) => x.code === c.code);
      const attempt = prev.length + 1;
      const last = prev[prev.length - 1];
      const done = k < semester;
      let grade: Letter | undefined;
      if (done) {
        if (c.t + c.u === 0) grade = 'YT';
        else if (r() < failP * (attempt > 1 ? 0.7 : 1)) grade = r() < 0.35 ? 'TT' : 'FF';
        else grade = letterFor(Math.max(1, Math.min(4, (attempt > 1 ? ability - 0.4 : ability) + (r() - 0.5) * 1.6)));
      }
      const waived = attempt > 1 && REG.repeatAttendanceWaived && last?.grade === 'FF';
      taken.push({ ...c, planned: c.semester, semester: k, attempt, grade, waived, instructor: catalogCourse(c.code)?.instructor ?? c.instructor });
      if (grade && isFail(grade)) backlog.push(c);
    }
  }
  // eski alışları işaretle: daha sonra tekrar alınan (notlanmış veya alınmakta olan) dersler
  for (const c of taken) {
    const later = taken.find((x) => x.code === c.code && x.semester > c.semester);
    if (later) { c.retakenIn = later.semester; c.superseded = !!later.grade; }
  }
  // geçmiş derslerin 100 üzerinden ders ortalaması: harf aralığının içinde, e-posta+ders+dönem'e göre sabit
  // (ana rastgele sayı dizisini etkilemesin diye ayrı özetle). TT ve staj (YT/YZ) için ortalama yoktur.
  const RANGE: Partial<Record<Letter, [number, number]>> = { AA: [90, 100], BA: [85, 89], BB: [80, 84], CB: [75, 79], CC: [60, 74], DC: [50, 59], DD: [40, 49], FF: [15, 39] };
  for (const c of taken) {
    const rg = c.grade && RANGE[c.grade];
    if (rg) c.score = rg[0] + (hash(`${email}|${c.code}|${c.semester}`) % (rg[1] - rg[0] + 1));
  }
  const latest = latestAttempts(taken);
  const current = taken.filter((c) => c.semester === semester);
  const failed: StudentData['failed'] = latest.filter((c) => isFail(c.grade) && c.grade !== 'YZ').map((c) => ({
    course: c, reason: c.grade as 'FF' | 'TT', retaking: current.some((x) => x.code === c.code), offered: (c.planned ?? c.semester) % 2 ? 'Güz' : 'Bahar',
    blocked: backlog.find((b) => b.code === c.code)?.deferReason,
  }));
  const deferred = backlog.filter((c) => !failed.some((f) => f.course.code === c.code) && !current.some((x) => x.code === c.code));

  // ders bilgisi: şube ve derslik ortak bölüm programından
  const info: StudentData['info'] = {};
  for (const c of current) {
    const sec = c.section ?? 1;
    info[c.code] = {
      section: sec, credit: c.t + Math.ceil(c.u / 2), room: c.t ? roomOf(c.code, sec) : c.u ? 'Yazılım Müh. Lab.' : '—',
      aim: COURSE_INFO[c.code]?.aim ?? (c.t + c.u === 0
        ? 'Yaz döneminde yapılan stajın raporlanması ve değerlendirilmesi; öğrencinin yazılım geliştirme sürecini gerçek bir kurumda gözlemlemesi.'
        : `${c.name} dersinin temel kavramlarını, yöntemlerini ve uygulamalarını öğretmek; öğrencinin bu alandaki problemleri analiz edip çözüm geliştirebilmesini sağlamak.`),
    };
  }

  // grades of the current term (yarıyıl içi %40 + final %60)
  const score = (base: number) => Math.max(15, Math.min(100, Math.round(base + (r() - 0.5) * 30)));
  const grades: GradeRow[] = current.map((c) => {
    if (c.t + c.u === 0) return { code: c.code, vize: { weight: 0 }, odev: { weight: 0 }, final: { weight: 100 }, passFail: true };
    const hasHw = c.u > 0;
    const base = 35 + ability * 13;
    const vizeOut = r() < 0.65;
    const hwOut = hasHw && r() < 0.75;
    return {
      code: c.code,
      vize: vizeOut ? { score: score(base), avg: Math.round((55 + r() * 20) * 10) / 10, weight: hasHw ? 30 : 40, announced: int(r, 1, 12) } : { weight: hasHw ? 30 : 40 },
      odev: hwOut ? { score: score(base + 8), avg: Math.round((62 + r() * 20) * 10) / 10, weight: 10, announced: int(r, 1, 14) } : { weight: hasHw ? 10 : 0 },
      final: { weight: 60 },
    };
  });

  // haftalık program = kayıtlı şubelerin ortak programdaki saatleri (çakışan, devam muaf alttan dersler hariç)
  const schedule: Slot[] = current.filter((c) => !c.clash).flatMap((c) => slotsOf(c.code, c.section ?? 1));

  // absences (weeks 1..9); at most one course near the limit, rarely one critical
  const absence: Record<string, number[]> = {};
  const withHours = current.filter((c) => c.t + c.u > 0);
  const tracked = withHours.filter((c) => !c.waived);
  const warnIdx = r() < 0.6 ? int(r, 0, tracked.length - 1) : -1;
  const critIdx = r() < (tier === 'struggling' ? 0.3 : 0.12) ? int(r, 0, tracked.length - 1) : -1;
  const overIdx = tier === 'struggling' && r() < 0.5 ? int(r, 0, tracked.length - 1) : -1; // sınırı aşmış → TT
  withHours.forEach((c) => {
    if (c.waived) { absence[c.code] = Array(9).fill(0); return; }
    const i = tracked.indexOf(c);
    const limit = Math.floor((c.t + c.u) * 14 * 0.3);
    const ratio = i === overIdx ? 1.08 + r() * 0.2 : i === critIdx ? 0.86 + r() * 0.08 : i === warnIdx ? 0.62 + r() * 0.18 : r() * 0.45;
    let left = Math.round(ratio * limit);
    const weeks = Array(9).fill(0);
    const chunk = Math.max(1, Math.min(c.t || c.u, 3));
    let guard = 0;
    while (left > 0 && guard++ < 50) {
      const w = int(r, 0, 8);
      const add = Math.min(chunk, left);
      weeks[w] += add;
      left -= add;
    }
    absence[c.code] = weeks;
  });

  // sınavlar: her ders farklı bir hafta içi gününde; saat ve derslik dersin kendi şubesinden
  const exams: Exam[] = [];
  const weekdays = (from: number, n: number) => {
    const out: number[] = [];
    for (let d = from; out.length < n; d++) { const w = addDays(d).getDay(); if (w !== 0 && w !== 6) out.push(d); }
    return out;
  };
  const examCourses = withHours;
  const mids = shuffle(r, weekdays(-12, Math.max(examCourses.length, 1) + 6)).slice(0, examCourses.length);
  const finals = weekdays(56, examCourses.length);
  const makeups = weekdays(75, examCourses.length);
  examCourses.forEach((c, i) => {
    const s = slotsOf(c.code, c.section ?? 1)[0];
    const [h, m] = (s?.start ?? '10:00').split(':').map(Number);
    const room = s?.room ?? info[c.code].room;
    const over = absence[c.code].reduce((a, x) => a + x, 0) > Math.floor((c.t + c.u) * 14 * 0.3) && !c.waived;
    const types: [ExamType, number][] = [['Ara Sınav', mids[i]], ...(over ? [] : [['Yarıyıl Sonu', finals[i]], ['Bütünleme', makeups[i]]] as [ExamType, number][])];
    for (const [type, off] of types) exams.push({ code: c.code, type, date: addDays(off, h, m), durationMin: type === 'Ara Sınav' ? 90 : 120, room });
  });

  // messages
  const hw = grades.find((g) => g.vize.score !== undefined && g.vize.announced !== undefined && g.vize.announced <= 3) ?? grades.find((g) => g.vize.score !== undefined);
  const hwCourse = hw ? current.find((c) => c.code === hw.code) : undefined;
  const otherCourse = current.find((c) => c.instructor && c.code !== hwCourse?.code && c.t + c.u > 0);
  const springRetakes = failed.filter((f) => f.offered === 'Bahar');
  const agnoNow = cumulativeGpa(taken);
  const inbox: Message[] = [
    { id: 'm1', from: advisor.name, to: displayName, kind: 'Danışman', date: addDays(-1, 16, 20), read: false, subject: 'Bahar dönemi ders kaydı ön görüşmesi',
      body: `Merhaba ${displayName.split(' ')[0]},\n\nBahar dönemi ders seçimin için ${semester + 1}. yarıyıl müfredatına birlikte bakalım.${springRetakes.length ? ` Başarısız olduğun ${springRetakes.map((f) => f.course.code).join(', ')} ${springRetakes.length > 1 ? 'derslerini' : 'dersini'} Bahar döneminde öncelikli olarak (alttan) seçmen gerekiyor; kalan AKTS hakkını buna göre planlayalım.` : ''}${agnoNow < 2 ? ` AGNO’n 2.00’ın altında olduğu için dönemlik üst sınırın 30 AKTS.` : ''} Kayıt haftasından önce ${advisor.hours} arasında ofisimde görüşebiliriz.\n\nİyi çalışmalar.` },
    ...(hwCourse ? [{ id: 'm2', from: hwCourse.instructor!, to: displayName, course: hwCourse.code, kind: 'Ders' as const, date: addDays(-(hw?.vize.announced ?? 1), 11, 5), read: false,
      subject: `${hwCourse.code} — Ara sınav notları açıklandı`,
      body: `Sevgili öğrenciler,\n\n${hwCourse.name} ara sınav notları OBS’ye girilmiştir. Sınav kâğıtlarını Perşembe 10:30’da ofisimde inceleyebilirsiniz.` }] : []),
    ...(otherCourse ? [{ id: 'm3', from: otherCourse.instructor!, to: displayName, course: otherCourse.code, kind: 'Ders' as const, date: addDays(-3, 9, 40), read: true,
      subject: `${otherCourse.code} — Proje teslimi hakkında`,
      body: `Merhaba,\n\n${otherCourse.name} dersinin dönem projesi için ara rapor teslim tarihi önümüzdeki hafta Cuma günüdür. Raporları ders sayfasına yükleyiniz.` }] : []),
    { id: 'm4', from: 'Yazılım Mühendisliği Bölüm Başkanlığı', to: 'Tüm öğrenciler', kind: 'Bölüm', date: addDays(-5, 14, 0), read: true, subject: ANNOUNCEMENTS[1].title, body: ANNOUNCEMENTS[1].body },
  ];
  // Gönderilen mesaj: "geçen hafta laboratuvara katılamadım" yalnızca devamsızlık kaydında o hafta (8. hafta) gerçekten
  // devamsız görünen, uygulamalı ve programda olan bir ders için yazılır; yoksa genel bir proje sorusu gönderilir.
  const labMissed = current.find((c) => c.instructor && c.u > 0 && !c.clash && (absence[c.code]?.[7] ?? 0) > 0);
  const anyCourse = current.find((c) => c.instructor && c.t + c.u > 0 && !c.clash);
  const sent: Message[] = labMissed
    ? [{ id: 's1', from: displayName, to: labMissed.instructor!, course: labMissed.code, kind: 'Ders', date: addDays(-8, 18, 30), read: true,
      subject: 'Laboratuvar telafisi hakkında',
      body: `Hocam merhaba,\n\nBu haftaki ${labMissed.code} laboratuvar oturumuna sağlık raporum nedeniyle katılamadım. Telafi için uygun bir zaman olup olmadığını öğrenebilir miyim?\n\n${displayName}` }]
    : anyCourse ? [{ id: 's1', from: displayName, to: anyCourse.instructor!, course: anyCourse.code, kind: 'Ders', date: addDays(-8, 18, 30), read: true,
      subject: 'Dönem projesi hakkında soru',
      body: `Hocam merhaba,\n\n${anyCourse.code} dönem projesinde grup üye sayısı en fazla kaç olabilir? Ara rapor şablonunu ders sayfasında bulamadım.\n\n${displayName}` }]
      : [];

  // statistics
  const terms = Array.from({ length: semester }, (_, i) => ({ semester: i + 1, name: termName(entryYear, i + 1) }));
  const stats: TermStat[] = terms.map((t) => {
    const list = taken.filter((c) => c.semester === t.semester);
    const graded = list.filter((c) => c.grade);
    const upto = taken.filter((c) => c.semester <= t.semester);
    const gpaGraded = graded.filter((c) => c.grade !== 'YT' && c.grade !== 'YZ');
    return {
      ...t, count: list.length, ects: list.reduce((s, c) => s + c.ects, 0),
      passedEcts: graded.filter((c) => !isFail(c.grade)).reduce((s, c) => s + c.ects, 0),
      yano: gpaGraded.length ? gpa(graded) : null, agno: gpaGraded.length ? cumulativeGpa(upto) : null, inProgress: graded.length === 0,
    };
  });
  const done = stats.filter((s) => s.yano !== null);

  return {
    year, semester, term: termName(entryYear, semester), entryYear, number, advisor,
    prep: `İngilizce Hazırlık — Başarılı (${prepYear}-${prepYear + 1})`, enrolled: `${prepYear}-${prepYear + 1} (Hazırlık)`,
    terms, taken, current, grades, schedule, exams, absence, info, inbox, sent,
    agno: cumulativeGpa(taken), lastYano: done.length ? done[done.length - 1].yano! : 0,
    ectsDone: passedEcts(taken), stats, tier, failed, deferred,
  };
}
