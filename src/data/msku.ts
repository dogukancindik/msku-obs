// MSKÜ OBS prototipi — örnek veriler.
// Öğrenci profili TAMAMEN KURGUSALDIR. Müfredat (ders kodları, adları, AKTS, öğretim üyeleri)
// MSKÜ Yazılım Mühendisliği (%100 İngilizce) programından alınmıştır; notlar örnek amaçlı üretilmiştir.

import { t as tr } from '../lib/i18n';

export const today = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

export const addDays = (n: number, h = 0, m = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  d.setHours(h, m, 0, 0);
  return d;
};

export const EMAIL_DOMAIN = '@posta.mu.edu.tr';

export const student = {
  name: 'Kerem Yılmaz',
  initials: 'KY',
  number: '230717042',
  email: 'keremyilmaz@posta.mu.edu.tr',
  faculty: 'Mühendislik Fakültesi',
  program: 'Yazılım Mühendisliği (%100 İngilizce)',
  programShort: 'Yazılım Mühendisliği',
  year: 3,
  semester: 5,
  term: '2026-2027 Güz',
  status: 'Aktif',
  enrolled: '2023-2024 (Hazırlık)',
  prep: 'İngilizce Hazırlık — Başarılı (2023-2024)',
  curriculum: '2021 Yazılım Mühendisliği Müfredatı',
  advisor: { name: 'Dr. Öğr. Üyesi Cihat Çetinkaya', office:'Mühendislik Fakültesi, Yazılım Müh. Bölümü', hours: 'Salı 14:00–16:00' },
};

/**
 * Harf notları. FF = başarısız (not), TT = devamsızlıktan başarısız (0 puan, AGNO'ya FF gibi girer).
 * YT / YZ = Yeterli / Yetersiz (staj): AGNO'ya katılmaz; YT ise AKTS kazanılır.
 */
export type Letter = 'AA' | 'BA' | 'BB' | 'CB' | 'CC' | 'DC' | 'DD' | 'FF' | 'TT' | 'YT' | 'YZ';
export const LETTERS: Letter[] = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FF'];
export const POINTS: Record<Letter, number> = { AA: 4, BA: 3.5, BB: 3, CB: 2.5, CC: 2, DC: 1.5, DD: 1, FF: 0, TT: 0, YT: 0, YZ: 0 };
/** AGNO/YANO hesabına giren notlar (YT/YZ hariç) */
export const isGpaGrade = (l?: Letter) => !!l && l !== 'YT' && l !== 'YZ';
/** Başarısız sayılan notlar */
export const isFail = (l?: Letter) => l === 'FF' || l === 'TT' || l === 'YZ';
export const LETTER_INFO: Partial<Record<Letter, string>> = {
  FF: 'Başarısız (sınav notu yetersiz)', TT: 'Devamsızlıktan kaldı', YT: 'Yeterli (staj)', YZ: 'Yetersiz (staj)',
};

export type CourseType = 'Zorunlu' | 'Seçmeli' | 'Üniversite Seçmeli' | 'Disiplinlerarası Proje';
export type Course = {
  code: string;
  name: string;
  ects: number;
  type: CourseType;
  semester: number; // 1..8
  instructor?: string;
  t: number; // theory hours / week
  u: number; // practice hours / week
  grade?: Letter; // completed courses
  elective?: boolean; // part of an elective pool for its semester (6–8)
  // ---- öğrencinin aldığı derslerde (StudentData.taken) kullanılır
  planned?: number; // müfredattaki yarıyılı (semester = alındığı yarıyıl)
  attempt?: number; // kaçıncı alış (1 = ilk)
  superseded?: boolean; // sonradan tekrar alınıp notlandı → AGNO'ya katılmaz
  retakenIn?: number; // tekrar alındığı yarıyıl (varsa)
  waived?: boolean; // tekrar alışta devam zorunluluğu yok
  section?: number; // aktif dönemde kayıtlı olunan şube
  clash?: boolean; // devam zorunluluğu olmayan alttan ders, başka bir dersle çakışıyor (programa yerleşmez)
  deferReason?: 'limit' | 'clash'; // ertelenen müfredat dersinde neden
  score?: number; // kesinleşmiş ders ortalaması (100 üzerinden, harf notuyla tutarlı)
};

export const typeLabel = (x: CourseType) => tr(x === 'Seçmeli' ? 'Teknik Seçmeli' : x === 'Üniversite Seçmeli' ? 'Bölüm Dışı Seçmeli' : x);

const C = (semester: number, code: string, name: string, ects: number, type: CourseType, instructor: string | undefined, t: number, u: number, grade?: Letter): Course =>
  ({ semester, code, name, ects, type, instructor, t, u, grade, elective: type === 'Seçmeli' });

export const CURRICULUM: Course[] = [
  // ---- 1. yarıyıl (2024-2025 Güz)
  C(1, 'SE 1001', 'Introduction to Software Engineering', 6, 'Zorunlu', 'Öğr. Gör. Dr. Övgü Öztürk Ergün', 3, 0, 'BB'),
  C(1, 'SE 1003', 'Introduction to Programming I', 6, 'Zorunlu', 'Doç. Dr. Selim Yılmaz', 3, 2, 'CC'),
  C(1, 'MATH 1851', 'Calculus I', 6, 'Zorunlu', 'Doç. Dr. Mehmet Ali Balcı', 4, 2, 'CC'),
  C(1, 'PHYS 1851', 'General Physics I', 6, 'Zorunlu', 'Prof. Dr. Uğur Erkarslan', 3, 2, 'AA'),
  C(1, 'ENG 1803', 'Academic Writing and Oral Presentation Skills I', 2, 'Zorunlu', 'Öğr. Gör. Müzeyyen Aykaç Erdoğan', 3, 0, 'BB'),
  C(1, 'TDB 1801', 'Turkish I', 2, 'Zorunlu', 'Öğr. Gör. Muhittin Yaşar Özer', 2, 0, 'BA'),
  C(1, 'ISG 1801', 'Occupational Health and Safety I', 2, 'Zorunlu', 'Prof. Dr. İbrahim Ferid Öge', 2, 0, 'AA'),
  // ---- 2. yarıyıl (2024-2025 Bahar)
  C(2, 'SE 1002', 'Software Ethics and Law', 2, 'Zorunlu', 'Doç. Dr. Yasemin Özdem Yılmaz', 2, 0, 'AA'),
  C(2, 'SE 1004', 'Introduction to Programming II', 6, 'Zorunlu', 'Doç. Dr. Selim Yılmaz', 3, 2, 'CB'),
  C(2, 'MATH 1852', 'Calculus II', 6, 'Zorunlu', 'Doç. Dr. Mehmet Ali Balcı', 4, 2, 'BB'),
  C(2, 'MATH 1856', 'Basic Linear Algebra for Engineers', 6, 'Zorunlu', 'Doç. Dr. Özgül İlhan', 3, 0, 'BB'),
  C(2, 'PHYS 1852', 'General Physics II', 6, 'Zorunlu', 'Doç. Dr. Cahit Karanfil', 3, 2, 'BA'),
  C(2, 'TDB 1802', 'Turkish II', 2, 'Zorunlu', 'Öğr. Gör. İlyas Şahin', 2, 0, 'BA'),
  C(2, 'ISG 1802', 'Occupational Health and Safety II', 2, 'Zorunlu', 'Prof. Dr. İbrahim Ferid Öge', 2, 0, 'CB'),
  // ---- 3. yarıyıl (2025-2026 Güz)
  C(3, 'SE 2001', 'Software Engineering Concepts', 5, 'Zorunlu', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 3, 0, 'CB'),
  C(3, 'SE 2003', 'Discrete Mathematics for Software Engineers', 6, 'Zorunlu', 'Doç. Dr. Zeki Bora Ön', 3, 0, 'BB'),
  C(3, 'SE 2005', 'Data Structures', 5, 'Zorunlu', 'Doç. Dr. Emine Elif Tülay', 2, 2, 'BA'),
  C(3, 'SE 2007', 'Probability Theory and Statistics', 6, 'Zorunlu', 'Dr. Öğr. Üyesi Serhat Emre Akhanlı', 3, 0, 'BA'),
  C(3, 'MATH 2855', 'Differential Equations', 6, 'Zorunlu', 'Dr. Öğr. Üyesi Niyazi Şahin', 3, 0, 'AA'),
  C(3, 'ATB 2801', 'Principles of Kemal Atatürk I', 2, 'Zorunlu', 'Öğr. Gör. Dr. Rabia Kocaman Aydın', 2, 0, 'AA'),
  // ---- 4. yarıyıl (2025-2026 Bahar)
  C(4, 'SE 2002', 'Software Design Patterns', 5, 'Zorunlu', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 3, 0, 'AA'),
  C(4, 'SE 2004', 'Algorithms', 5, 'Zorunlu', 'Doç. Dr. Emine Elif Tülay', 3, 0, 'AA'),
  C(4, 'SE 2006', 'Fundamentals of Database Systems', 5, 'Zorunlu', 'Doç. Dr. Selim Yılmaz', 2, 2, 'CC'),
  C(4, 'MATH 2858', 'Numerical Methods and Applications', 5, 'Zorunlu', 'Doç. Dr. Özgül İlhan', 3, 0, 'AA'),
  C(4, 'ATB 2802', 'Principles of Kemal Atatürk II', 2, 'Zorunlu', 'Öğr. Gör. Dr. Rabia Kocaman Aydın', 2, 0, 'BB'),
  C(4, 'ÜSD 0203', 'Fotoğrafçılığa Giriş', 5, 'Üniversite Seçmeli', 'Ortak Seçmeli Havuzu', 2, 0),
  C(4, 'ÜSD 0412', 'Proje Geliştirme ve Yönetimi', 3, 'Üniversite Seçmeli', 'Ortak Seçmeli Havuzu', 2, 0),
  // ---- 5. yarıyıl (2026-2027 Güz) — AKTİF
  C(5, 'SE 3001', 'Summer Practice I', 1, 'Zorunlu', 'Dr. Öğr. Üyesi Tuğba Süzek', 0, 0),
  C(5, 'SE 3003', 'Software Project Management', 6, 'Zorunlu', 'Öğr. Gör. Dr. Övgü Öztürk Ergün', 3, 0),
  C(5, 'SE 3005', 'System and Network Programming', 6, 'Zorunlu', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 3, 2),
  C(5, 'ÜSD 0310', 'Girişimcilik ve İnovasyon', 5, 'Üniversite Seçmeli', 'Ortak Seçmeli Havuzu', 2, 0),
  C(5, 'SE 3007', 'Introduction to Machine Learning', 5, 'Seçmeli', 'Doç. Dr. Selim Yılmaz', 3, 0),
  C(5, 'SE 3501', 'Client-side Programming', 6, 'Seçmeli', 'Doç. Dr. Selim Yılmaz', 2, 2),
  C(5, 'SE 3505', 'Mobile Application Development', 6, 'Seçmeli', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 2, 2),
  // ---- 6. yarıyıl
  C(6, 'SE 3002', 'Fundamentals of Programming Languages', 6, 'Zorunlu', 'Doç. Dr. Emine Elif Tülay', 3, 0),
  C(6, 'SE 3004', 'Software Testing', 6, 'Zorunlu', 'Dr. Öğr. Üyesi Erkut Tekeli', 3, 0),
  C(6, 'SE 3006', 'Software Architectures', 6, 'Zorunlu', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 3, 0),
  C(6, 'SE 3502', 'Server-side Programming', 6, 'Seçmeli', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 2, 2),
  C(6, 'SE 3504', 'Software Maintenance and Evolution', 6, 'Seçmeli', 'Dr. Öğr. Üyesi Erkut Tekeli', 3, 0) /* [varsayılan hoca] */,
  C(6, 'SE 3506', 'Introduction to Software-defined Networking', 6, 'Seçmeli', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 3, 0),
  C(6, 'SE 3508', 'Introduction to Artificial Intelligence', 6, 'Seçmeli', 'Prof. Dr. Bekir Taner Dinçer', 3, 0),
  C(6, 'SE 3510', 'Introduction to Big Data Analysis', 6, 'Seçmeli', 'Prof. Dr. Bekir Taner Dinçer', 3, 0),
  // ---- 7. yarıyıl
  C(7, 'SE 4001', 'Summer Practice II', 1, 'Zorunlu', 'Dr. Öğr. Üyesi Tuğba Süzek', 0, 0),
  C(7, 'SE 4011', 'Software Process Improvement', 5, 'Zorunlu', 'Dr. Öğr. Üyesi Erkut Tekeli', 3, 0), // [yer tutucu] kredi dengesi için zorunlu bölüm dersi
  C(7, 'SE 4007', 'Secure Software Development', 5, 'Zorunlu', 'Dr. Öğr. Üyesi Erkut Tekeli', 3, 0), // [yer tutucu] eksik zorunlu kredi
  C(7, 'ÜSD 0415', 'Bilim ve Teknoloji Tarihi', 5, 'Üniversite Seçmeli', 'Ortak Seçmeli Havuzu', 2, 0),
  C(7, 'ÜSD 0430', 'İş Hayatında İletişim ve Sunum', 5, 'Üniversite Seçmeli', 'Ortak Seçmeli Havuzu', 2, 0), // Multidisciplinary Engineering Projects yerine (ENG 3500 ile aynı ders olduğu için kaldırıldı)
  C(7, 'ENG 3500', 'Interdisciplinary Engineering Project', 3, 'Disiplinlerarası Proje', 'Fakülte Ortak Dersi', 2, 0),
  C(7, 'SE 4005', 'Human Computer Interaction', 6, 'Seçmeli', 'Doç. Dr. Emine Elif Tülay', 3, 0),
  C(7, 'SE 4501', 'Advanced Topics in Software Engineering I', 6, 'Seçmeli', 'Öğr. Gör. Dr. Övgü Öztürk Ergün', 3, 0),
  C(7, 'SE 4503', 'Cloud Computing Concepts', 6, 'Seçmeli', 'Dr. Öğr. Üyesi Cihat Çetinkaya', 3, 0) /* [varsayılan hoca] */,
  C(7, 'SE 4505', 'Software Quality Assurance', 6, 'Seçmeli', 'Dr. Öğr. Üyesi Erkut Tekeli', 3, 0) /* [varsayılan hoca] */,
  C(7, 'SE 4507', 'Computer Vision', 6, 'Seçmeli', 'Öğr. Gör. Dr. Övgü Öztürk Ergün', 3, 0),
  C(7, 'SE 4509', 'Programming for Scientific Computing', 6, 'Seçmeli', 'Doç. Dr. Emine Elif Tülay', 3, 0),
  // ---- 8. yarıyıl
  C(8, 'SE 4002', 'Software Engineering Capstone Project', 6, 'Zorunlu', 'Doç. Dr. Emine Elif Tülay', 2, 2),
  C(8, 'SE 4004', 'Professional Practice and Entrepreneurship in Software', 6, 'Zorunlu', 'Öğr. Gör. Dr. Övgü Öztürk Ergün', 3, 0), // [yer tutucu] eksik zorunlu kredi
  C(8, 'SE 4502', 'Advanced Topics in Software Engineering II', 6, 'Seçmeli', 'Doç. Dr. Emine Elif Tülay', 3, 0),
  C(8, 'SE 4504', 'Programming Web Services', 6, 'Seçmeli', 'Doç. Dr. Selim Yılmaz', 3, 0) /* [varsayılan hoca] */,
  C(8, 'SE 4506', 'Internet of Things Programming', 6, 'Seçmeli', 'Doç. Dr. Selim Yılmaz', 2, 2),
  C(8, 'SE 4508', 'Interactive Multimedia Systems', 6, 'Seçmeli', 'Öğr. Gör. Dr. Övgü Öztürk Ergün', 3, 0),
  C(8, 'SE 4510', 'Quantum Computing', 6, 'Seçmeli', 'Doç. Dr. Zeki Bora Ön', 3, 0) /* [varsayılan hoca] */,
];

/** 5. yarıyıl seçmeli havuzunun açılan diğer dersleri (alınmadı) */
export const FALL_POOL: Course[] = [
  C(5, 'SE 3503', 'Introduction to Optimization', 6, 'Seçmeli', 'Doç. Dr. Zeki Bora Ön', 3, 0),
  C(5, 'SE 3507', 'Information Security', 6, 'Seçmeli', 'Dr. Öğr. Üyesi Erkut Tekeli', 3, 0),
  C(5, 'SE 3509', 'Introduction to Data Science & Engineering', 6, 'Seçmeli', 'Prof. Dr. Bekir Taner Dinçer', 3, 0),
];

/**
 * Bölüm içi teknik seçmeli ders sayısı — yarıyıl bazında. 8 ders × 6 AKTS = 48 AKTS.
 * Her yarıyıl 30 AKTS olacak şekilde planlanmıştır:
 *  1–3: 30 zorunlu · 4: 22 zorunlu + 8 bölüm dışı · 5: 13 zorunlu + 5 bölüm dışı + 2×6 teknik
 *  6: 18 zorunlu + 2×6 teknik · 7: 11 zorunlu (SE 4001, SE 4007, SE 4011) + 3 disiplinlerarası (ENG 3500) + 10 bölüm dışı (ÜSD 0415, ÜSD 0430) + 1×6 teknik · 8: 12 zorunlu + 3×6 teknik
 *  Toplam: 166 zorunlu + 48 teknik + 23 bölüm dışı + 3 disiplinlerarası = 240
 */
export const ELECTIVES_REQUIRED: Record<number, number> = { 5: 2, 6: 2, 7: 1, 8: 3 };
export const ECTS_TOTAL = 240;

/**
 * MSKÜ yönetmelik değerleri (prototip). Tek yerden değiştirilebilir.
 * Kaynak: öğrenci beyanı — kesin değerler için güncel MSKÜ Önlisans ve Lisans Eğitim-Öğretim Yönetmeliği'ne bakılmalı.
 */
export const REG = {
  // Dönemlik AKTS üst sınırı
  ectsLimit: (agno: number) => (agno >= 3 ? 40 : agno >= 2 ? 36 : 30),
  // Mezuniyet kredisi: 4. sınıfta, en az 156 AKTS tamamlamış ve AGNO ≥ 2.00 olan öğrenci 42 AKTS'ye kadar alabilir
  gradCredit: { maxEcts: 42, minCompleted: 156, minAgno: 2, minYear: 4 },
  // Not hesabı
  weights: { midterm: 40, final: 60 },
  passMin: 40, // en düşük geçme notu (ders ortalaması)
  finalMin: 40, // final sınavında alınması gereken en düşük not
  scale: [
    { l: 'AA', min: 90 }, { l: 'BA', min: 85 }, { l: 'BB', min: 80 }, { l: 'CB', min: 75 },
    { l: 'CC', min: 60 }, { l: 'DC', min: 50 }, { l: 'DD', min: 40 }, { l: 'FF', min: 0 },
  ],
  // Tekrar (alttan) alınan derste: önceki alışta devam şartını sağlamış öğrenciden tekrar devam aranmaz.
  // Devamsızlıktan (TT) kalınan derste devam zorunludur. Son alınan not AGNO'ya girer.
  repeatAttendanceWaived: true,
  // Mezuniyet şartları (AKTS) — toplam 240
  graduation: { mandatory: 166, technical: 48, nonDept: 23, interdisciplinary: 3 },
};

export const TERMS = [
  { semester: 1, name: '2024-2025 Güz' },
  { semester: 2, name: '2024-2025 Bahar' },
  { semester: 3, name: '2025-2026 Güz' },
  { semester: 4, name: '2025-2026 Bahar' },
  { semester: 5, name: '2026-2027 Güz' },
];

export const CURRENT = CURRICULUM.filter((c) => c.semester === 5);
export const byCode = (code: string) => [...CURRICULUM, ...FALL_POOL].find((c) => c.code === code);

// -------------------------------------------------- aktif dönem: ders içeriği
export const COURSE_INFO: Record<string, { section: number; credit: number; aim: string; room: string }> = {
  'SE 3001': { section: 1, credit: 0, room: '—', aim: 'İkinci yarıyıl sonunda yapılan 20 iş günlük stajın raporlanması ve değerlendirilmesi; öğrencinin yazılım geliştirme sürecini gerçek bir kurumda gözlemlemesi.' },
  'SE 3003': { section: 1, credit: 3, room: 'CB-09', aim: 'Yazılım projelerinde kapsam, zaman, maliyet ve risk yönetimini; çevik (Scrum) ve plan güdümlü yaklaşımları uygulamalı olarak öğretmek.' },
  'SE 3005': { section: 1, credit: 4, room: 'CB-09 · Yazılım Müh. Lab.', aim: 'Süreç, iş parçacığı, soket ve IPC kavramlarıyla Unix/Linux üzerinde sistem ve ağ programlama yetkinliği kazandırmak.' },
  'SE 3007': { section: 1, credit: 3, room: 'FZ-04', aim: 'Denetimli ve denetimsiz öğrenmenin temel algoritmalarını, model değerlendirme yöntemlerini ve Python ile uygulamalarını tanıtmak.' },
  'SE 3501': { section: 1, credit: 3, room: 'Yazılım Müh. Lab.', aim: 'HTML, CSS ve modern JavaScript ile erişilebilir, duyarlı ve bileşen tabanlı istemci tarafı web uygulamaları geliştirmek.' },
  'SE 3505': { section: 1, credit: 3, room: 'Yazılım Müh. Lab.', aim: 'Mobil platformların mimarisini, arayüz tasarım ilkelerini ve çapraz platform uygulama geliştirmeyi proje temelli öğretmek.' },
};

// -------------------------------------------------- haftalık program (ardışık saatler tek blok)
export type Slot = { code: string; day: number; start: string; end: string; kind: 'Teori' | 'Uygulama'; room: string };
export const SCHEDULE: Slot[] = [
  { code: 'SE 3003', day: 0, start: '13:30', end: '16:15', kind: 'Teori', room: 'CB-09' },
  { code: 'SE 3005', day: 1, start: '08:30', end: '11:15', kind: 'Teori', room: 'CB-09' },
  { code: 'SE 3007', day: 2, start: '09:30', end: '12:15', kind: 'Teori', room: 'FZ-04' },
  { code: 'SE 3501', day: 2, start: '13:30', end: '17:15', kind: 'Uygulama', room: 'Yazılım Müh. Lab.' },
  { code: 'SE 3005', day: 3, start: '13:30', end: '15:15', kind: 'Uygulama', room: 'Yazılım Müh. Lab.' },
  { code: 'SE 3505', day: 4, start: '08:30', end: '12:15', kind: 'Uygulama', room: 'Yazılım Müh. Lab.' },
];

// -------------------------------------------------- not listesi (aktif dönem)
export type Assess = { score?: number; avg?: number; weight: number; announced?: number };
export type GradeRow = { code: string; vize: Assess; odev: Assess; final: Assess; passFail?: boolean };
export const GRADES: GradeRow[] = [
  // Yarıyıl içi toplam %40 (vize + varsa ödev/proje), final %60
  { code: 'SE 3003', vize: { score: 78, avg: 68.4, weight: 30, announced: 9 }, odev: { score: 88, avg: 81.0, weight: 10, announced: 2 }, final: { weight: 60 } },
  { code: 'SE 3005', vize: { weight: 30 }, odev: { score: 92, avg: 74.5, weight: 10, announced: 12 }, final: { weight: 60 } },
  { code: 'SE 3007', vize: { score: 64, avg: 61.7, weight: 40, announced: 1 }, odev: { weight: 0 }, final: { weight: 60 } },
  { code: 'SE 3501', vize: { score: 85, avg: 72.3, weight: 30, announced: 6 }, odev: { score: 90, avg: 83.6, weight: 10, announced: 6 }, final: { weight: 60 } },
  { code: 'SE 3505', vize: { weight: 30 }, odev: { score: 80, avg: 77.2, weight: 10, announced: 4 }, final: { weight: 60 } },
  { code: 'SE 3001', vize: { weight: 0 }, odev: { weight: 0 }, final: { weight: 100 }, passFail: true },
];

// -------------------------------------------------- devamsızlık
export const WEEKS = 14;
export const WEEKS_DONE = 9;
export const ABSENCE: Record<string, number[]> = {
  // hafta bazında devamsızlık saatleri (1..9. hafta)
  'SE 3003': [0, 0, 0, 2, 0, 0, 0, 0, 0],
  'SE 3005': [0, 2, 0, 0, 3, 0, 0, 1, 0],
  'SE 3007': [0, 3, 0, 3, 0, 0, 3, 0, 0],
  'SE 3501': [0, 0, 2, 0, 0, 2, 0, 0, 0],
  'SE 3505': [0, 0, 0, 0, 0, 0, 2, 0, 0],
};

// -------------------------------------------------- sınav takvimi
export type ExamType = 'Ara Sınav' | 'Yarıyıl Sonu' | 'Bütünleme';
export type Exam = { code: string; type: ExamType; date: Date; durationMin: number; room: string };
export const EXAMS: Exam[] = [
  { code: 'SE 3005', type: 'Ara Sınav', date: addDays(-12, 10, 0), durationMin: 90, room: 'CB-09' },
  { code: 'SE 3003', type: 'Ara Sınav', date: addDays(-9, 13, 30), durationMin: 90, room: 'CB-09' },
  { code: 'SE 3501', type: 'Ara Sınav', date: addDays(-6, 13, 30), durationMin: 90, room: 'Yazılım Müh. Lab.' },
  { code: 'SE 3007', type: 'Ara Sınav', date: addDays(-1, 9, 30), durationMin: 90, room: 'FZ-04' },
  { code: 'SE 3005', type: 'Ara Sınav', date: addDays(4, 8, 30), durationMin: 90, room: 'CB-09' },
  { code: 'SE 3505', type: 'Ara Sınav', date: addDays(6, 9, 0), durationMin: 90, room: 'Yazılım Müh. Lab.' },
  { code: 'SE 3003', type: 'Yarıyıl Sonu', date: addDays(56, 13, 30), durationMin: 120, room: 'Mühendislik Sanal Derslik 1' },
  { code: 'SE 3005', type: 'Yarıyıl Sonu', date: addDays(57, 9, 0), durationMin: 120, room: 'CB-09' },
  { code: 'SE 3007', type: 'Yarıyıl Sonu', date: addDays(59, 9, 30), durationMin: 120, room: 'FZ-04' },
  { code: 'SE 3501', type: 'Yarıyıl Sonu', date: addDays(60, 13, 30), durationMin: 120, room: 'Yazılım Müh. Lab.' },
  { code: 'SE 3505', type: 'Yarıyıl Sonu', date: addDays(62, 9, 0), durationMin: 120, room: 'Yazılım Müh. Lab.' },
  { code: 'SE 3003', type: 'Bütünleme', date: addDays(74, 13, 30), durationMin: 120, room: 'CB-09' },
  { code: 'SE 3005', type: 'Bütünleme', date: addDays(75, 9, 0), durationMin: 120, room: 'CB-09' },
  { code: 'SE 3007', type: 'Bütünleme', date: addDays(76, 9, 30), durationMin: 120, room: 'FZ-04' },
];

// -------------------------------------------------- mesajlar
export type Message = { id: string; from: string; to: string; course?: string; subject: string; body: string; date: Date; read: boolean; kind: 'Danışman' | 'Ders' | 'Bölüm' };
export const INBOX: Message[] = [
  { id: 'm1', from: 'Dr. Öğr. Üyesi Cihat Çetinkaya', to: student.name, subject: 'Bahar dönemi ders kaydı ön görüşmesi', kind: 'Danışman', date: addDays(-1, 16, 20), read: false,
    body: 'Merhaba Kerem,\n\nBahar dönemi seçmeli derslerin için 6. yarıyıl havuzundan iki ders seçmen gerekiyor. Server-side Programming ve Software Maintenance and Evolution derslerinin saatleri çakışmıyor. Kayıt haftasından önce Salı 14:00–16:00 arasında görüşebiliriz.\n\nİyi çalışmalar.' },
  { id: 'm2', from: 'Doç. Dr. Selim Yılmaz', to: student.name, course: 'SE 3007', subject: 'SE 3007 — Ara sınav notları açıklandı', kind: 'Ders', date: addDays(-1, 11, 5), read: false,
    body: 'Sevgili öğrenciler,\n\nIntroduction to Machine Learning ara sınav notları OBS’ye girilmiştir. Sınav kâğıtlarını Perşembe 10:30’da ofisimde inceleyebilirsiniz. Proje teslim tarihi değişmemiştir.' },
  { id: 'm3', from: 'Öğr. Gör. Dr. Övgü Öztürk Ergün', to: student.name, course: 'SE 3003', subject: 'Sprint 2 değerlendirmesi', kind: 'Ders', date: addDays(-3, 9, 40), read: true,
    body: 'Merhaba,\n\nSprint 2 demosundaki burndown grafiğiniz çok düzenliydi. Bir sonraki sprintte risk kayıt defterinizi güncellemeyi unutmayın. Proje notunuz OBS’ye girilmiştir.' },
  { id: 'm4', from: 'Yazılım Mühendisliği Bölüm Başkanlığı', to: 'Tüm öğrenciler', subject: 'Yaz stajı raporlarının son teslim tarihi', kind: 'Bölüm', date: addDays(-5, 14, 0), read: true,
    body: 'Summer Practice I (SE 3001) staj raporlarının son teslim tarihi 30 Kasım’dır. Raporlar bölüm sekreterliğine imzalı olarak teslim edilmelidir.' },
];
export const SENT: Message[] = [
  { id: 's1', from: student.name, to: 'Dr. Öğr. Üyesi Cihat Çetinkaya', course: 'SE 3005', subject: 'Laboratuvar telafisi hakkında', kind: 'Ders', date: addDays(-8, 18, 30), read: true,
    body: 'Hocam merhaba,\n\nGeçen haftaki laboratuvar oturumuna sağlık raporum nedeniyle katılamadım. Telafi için uygun bir zaman olup olmadığını öğrenebilir miyim?\n\nKerem Yılmaz' },
];

export const ANNOUNCEMENTS = [
  { id: 'a1', date: addDays(-2), title: 'Ara sınav haftası salon değişikliği', body: 'SE 3005 ara sınavı CB-09 salonunda yapılacaktır.' },
  { id: 'a2', date: addDays(-4), title: 'Kariyer günleri başvuruları açıldı', body: 'Mühendislik Fakültesi kariyer günleri 3–4 Aralık’ta yapılacaktır.' },
];
