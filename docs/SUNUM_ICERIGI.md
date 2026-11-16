# MSKÜ OBS Redesign — Sunum İçerik Belgesi (SE4513 Human-Computer Interaction)

> **Bu belge ne için?** Başka bir yapay zekâ sohbetine verip slayta dönüştürmek için hazırlandı. Belge kendi içinde eksiksizdir: proje bağlamı, amaçlar, tasarım felsefesi, slayt slayt içerik (İngilizce), konuşmacı notları, demo akışı ve olası sorular.
>
> **Slayta dönüştürecek sohbete talimat:**
> - Sunum **İngilizce**, ~15 dakika (soru-cevap dahil), **canlı demo** içeriyor.
> - Slayt metinleri kısa olsun (slayt başına en fazla 4–5 madde); ayrıntı konuşmacı notlarında.
> - Görsel öneri: her "önce/sonra" slaytında solda eski OBS ekran görüntüsü, sağda yeni tasarım. Eski ekran görüntülerinde **ad, öğrenci no ve T.C. kimlik no bulanıklaştırılmalı.**
> - Renkler: MSKÜ laciverti `#1E3A8A` / `#0F172A`, açık zemin `#F8FAFC`, vurgu için tek bir renk; kırmızı yalnızca "sorun" için.
> - Ders kuralı: yapay zekâ kullanılabilir ama **rapor metni birebir kopyalanamaz.** Slayt içeriği taslaktır; ekip kendi cümleleriyle düzenlemeli.

---

## 1. Proje bir bakışta

| | |
|---|---|
| **Ders** | SE4513 Human-Computer Interaction — Muğla Sıtkı Koçman Üniversitesi, Yazılım Mühendisliği |
| **Görev** | Var olan bir arayüzü HCI ilkelerine göre incelemek ve yeniden tasarlamak |
| **Seçtiğimiz sistem** | MSKÜ Öğrenci Bilgi Sistemi (OBS, obs.mu.edu.tr) |
| **Neden OBS?** | Her öğrenci kullanıyor (test kullanıcısı bulmak kolay), sorunlar somut ve ekran görüntüleriyle belgelenebilir, hoca sistemi tanıyor. Trendyol derste zaten örnek olarak işlendiği için seçilmedi. |
| **Çıktı** | Çalışan bir frontend prototip (React + TypeScript + Vite), 12 sayfa, 4 dil, 28 belgelenmiş kullanılabilirlik sorunu ve çözümü |
| **Kaynak kod** | github.com/dogukancindik/msku-obs |

### Amaçlarımız
1. Eski OBS'nin kullanılabilirlik sorunlarını **ekran görüntüleriyle belgelemek** ve her birini **Nielsen 0–4 ciddiyet** ölçeğiyle puanlamak.
2. Her sorunu **ders slaytlarındaki bir ilkeyle** (Nielsen, Shneiderman, Norman, Dix, Gestalt, Hick yasası, renk/hiyerarşi kuralları) gerekçelendirmek.
3. Sorunları çözen, **modern, sade ve gerçekten çalışan** bir prototip yapmak — "maket" değil, gerçek bir OBS gibi davranan sistem.
4. Sunumda **canlı demo**, raporda "**hangi ilkeyi neden uyguladık**" sorusunun somut cevabı.

---

## 2. Tasarım felsefemiz (sunumun omurgası)

Bütün kararları yedi ilkeye bağladık. Sunumda her önce/sonra örneği bu ilkelerden birine işaret etmeli.

| # | İlke (slayttaki adı) | Ne demek? | Dayandığı kavram |
|---|---|---|---|
| P1 | **Goals, not modules** | Menü sistemin modüllerine değil öğrencinin hedeflerine göre düzenlenir. | Mental model (Lec7), Hick yasası, menü genişliği 7±2 (Lec5) |
| P2 | **The system thinks for the student** | Öğrencinin kafadan hesapladığı her şeyi (devamsızlık hakkı, gereken final notu, AGNO etkisi, AKTS sınırı) sistem hesaplar. | Dix: dialog initiative, task migratability; Shneiderman #8 kısa süreli bellek yükü |
| P3 | **Everything that looks clickable is clickable** | Sahte affordance yok; tıklanabilen her şey tıklanabilir görünür ve etiketlidir. | Affordance (Norman, Lec5), gulf of execution |
| P4 | **Colour has meaning** | Kırmızı yalnızca gerçek risk; renk tek başına anlam taşımaz (ikon + metin). | Lec4 renk semantiği, renk körlüğü, alışma (habituation, Lec7) |
| P5 | **Prevent errors before explaining them** | Hata mesajı yerine hatayı baştan önleme; mesaj gerekiyorsa eyleme dönük. | Shneiderman #5, Lec3 hata türleri (slip/mistake), forcing functions |
| P6 | **One source of truth** | Aynı bilgi her sayfada aynı sayıyı gösterir; tutarsızlık güveni yıkar. | Tutarlılık (Shneiderman #1), Dix synthesizability, güvenilirlik (Lec2) |
| P7 | **Designed for everyone** | Erişilebilirlik, koyu tema, 4 dil (Arapça sağdan sola), mobil. | Kullanıcı çeşitliliği & erişilebilirlik (Lec2), ISO 9241, Dix customizability |

---

## 3. Slayt slayt içerik

> Süre planı: Giriş 1,5 dk · Sorunlar 3 dk · Tasarım kararları 4 dk · Canlı demo 4 dk · Yazılım/kalite 1 dk · Sonuç & sınırlılıklar 1 dk · Soru-cevap ~1,5 dk.

### Slide 1 — Title
- **MSKÜ OBS, Redesigned** — *A human-centred redesign of our Student Information System*
- SE4513 Human-Computer Interaction · Team members · Date
- Görsel: yeni giriş ekranı (sade lacivert panel + form + e-Devlet düğmesi)

**Speaker notes:** "Every student at our university uses OBS several times a week. We asked a simple question: why does checking a grade or an absence limit feel like work? This project is our answer."

### Slide 2 — Why OBS?
- Used by every student → real, frequent tasks; easy to find test users
- Problems are concrete and visible in screenshots
- Not a toy: grades, graduation, registration — high stakes
- Goal: document problems, justify each with HCI principles, build a working prototype

**Notes:** Trendyol örneği derste işlendiği için farklı ve herkesin günlük kullandığı bir sistem seçtiğimizi söyle.

### Slide 3 — Method
- **Heuristic evaluation** of 12 OBS screens → 28 problems, Nielsen severity 0–4
- Each problem mapped to a course principle (Nielsen, Shneiderman, Norman, Dix, Gestalt, Hick)
- **Redesign + working prototype** (React, TypeScript) — realistic data for any student
- **Validation:** automated consistency tests + planned user test (6 tasks, SUS) *(sonuçlar eklendiğinde güncellenecek)*
- Görsel: süreç şeridi — Observe → Evaluate → Redesign → Build → Test

### Slide 4 — The old OBS in numbers (problem özet slaytı)
- **~30 menu links**, "Genel İşlemler" alone has 15
- **8 separate tables** on the grades page, same header repeated 8×
- **Same course repeated in 4 hourly cells** on the timetable
- **Red "Sonuçlandırılmadı"** on every course → users learn to ignore red
- **3× the same error message** on the graduation page
- **National ID shown in full** on the transcript
- Görsel: eski ekranlardan 3 kırpılmış örnek (bulanık kişisel bilgilerle)

**Notes:** Bu rakamlar `heuristic-evaluation.md` tablosundan. 28 sorunun 12'si "Major" (3).

### Slide 5 — Our design principles
- P1 Goals, not modules · P2 The system thinks for the student · P3 Everything that looks clickable is clickable · P4 Colour has meaning · P5 Prevent errors before explaining them · P6 One source of truth · P7 Designed for everyone
- Görsel: 7 küçük ikonlu kart

**Notes:** "Every decision you will see maps to one of these seven principles."

### Slide 6 — Navigation: 30 links → 11 goals (P1)
| Before | After |
|---|---|
| ~30 links, groups all named "…İşlemleri" | **11 destinations in 4 goal-based groups**: Genel · Akademik & Ders · Takvim & Katalog · İletişim & Hesap |
| Exam calendar in "Genel", grades in "Ders ve Dönem" | Timetable + exams on one page; messages & account next to "Çıkış" |
| Fake "2026-2027 Güz" badge that does nothing | **One real term selector** shared by all pages |

- **Why:** Hick–Hyman law — decision time grows with the number of choices; grouping by *goal* matches the student's mental model.
- **UX effect:** fewer places to look; "where is X?" becomes predictable. ⌘K command palette for expert users (novice → expert, Lec2).

### Slide 7 — Login: simple, safe, familiar (P3, P5)
- Domain **@posta.mu.edu.tr shown as a suffix** → type only your username; live preview "Hoş geldin, Ali Kırgız"
- Show-password toggle, **Caps Lock warning**, remaining attempts, **30-second lock after 5 failures**
- **e-Devlet ile Giriş** kept — a familiar path users trust
- Removed marketing text and demo hints → a real, calm login screen; language switch in the corner (TR / EN / DE / AR)
- **Principles:** error prevention (Shneiderman #5), slips (Lec3), forcing function: lock-out (Lec3), familiarity (Dix)

### Slide 8 — Dashboard: from passive boxes to actions (P2, P3)
| Before | After |
|---|---|
| 8 static boxes, not clickable; "-1", "-", programme name 3× | **4 actionable cards** (GPA · Current term · Graduation progress · Attendance) — hover lifts the card, ↗ icon, click opens details |
| Nothing about *today* | **Today's classes, upcoming exams with countdown, announcements** |
| Problems hidden in separate pages | **Proactive alerts**: "You need to repeat 3 courses", "Limit exceeded (TT)", "GPA below 2.00 → 30 ECTS limit" |

- **Why:** false affordance → explicit affordance (Norman); dialog initiative — the system brings information to the user (Dix).
- **UX effect:** the most frequent questions are answered on the first screen.

### Slide 9 — Grades & Final Calculator (P2, P4)
- **One table instead of eight**: midterm, assignment, final, current average, status
- Class average and difference (↑/↓) **under each score**; numbers right-aligned
- Status computed from grades: *Doing well / Average / Attention / Pending* — **icon + text, not colour alone**
- **Final Calculator:** "With 62 in the final you pass with CC"; minimum final score for every letter (AA…DD), click to apply
- Past terms: course average /100, letter, weighted points, term GPA
- **Principles:** Gestalt common region & proximity, habituation (red everywhere → ignored), Shneiderman #8 reduce memory load, number alignment (Lec4)

**Notes:** Hesaplayıcının harf notunu ekranda görünen yuvarlanmış ortalamaya göre verdiğini (40.0 görünüp FF çıkmaması) "dürüst arayüz" örneği olarak anlat.

### Slide 10 — Transcript & What-if Scenario (P2, P6)
- In-app transcript, grouped by semester, **one "Download PDF / Print" button**, **no national ID shown** (privacy, Lec1)
- Failed (FF), failed-by-absence (TT) and repeated courses clearly marked; old grade struck through, *only the latest grade counts*
- **What-if simulator:** change a letter → new GPA, difference (+ green / − red) **instantly**; "Reset" restores everything
- "If you pass SE 1004 with CC, your GPA becomes 1.73" — **shows that high-ECTS courses move the GPA more**
- Spring courses are added to the spring term (a course can only be taken when it is offered)
- **Principles:** immediate honesty / synthesizability (Dix), permit easy reversal (Shneiderman #6), privacy

### Slide 11 — Curriculum & Graduation: an honest progress report (P2, P6)
| Before | After |
|---|---|
| "Graduation rules missing, cannot calculate" ×3, unexplained red ✕ | **Progress bars**: Total ECTS x/240 · Required x/166 · Technical electives x/48 · Non-departmental x/23 · Interdisciplinary project x/3 · Internship |
| Long unordered course list | **Semester tabs 1–8** with the student's *real record* (repeats appear in the semester they were taken) + status filter |
| — | "**Courses to repeat**" card: why (FF/TT), when it is offered (Fall/Spring), whether attendance is required |

- Each card lists the actual courses: "Completed: ÜSD 0203 (BB), ÜSD 0412 (CC)"
- Warns early: "With the remaining electives you would be 1 ECTS short"
- **Principles:** error messages must help the user (Lec3), visibility of system status (Nielsen #1), selective attention (Lec7)

### Slide 12 — Attendance: no mental arithmetic (P2, P4)
- Before: raw hours, grey "Yoklama Girişi Yapılmamış", unlabelled ⓘ, **student calculates the 30% limit**
- After: **"9 / 12 hours (75%) · 3 hours left"** + progress bar + badge *Safe / Near limit / Critical / Limit exceeded — TT*
- Weekly detail (14 weeks), repeat courses: "attendance not required"
- Dashboard card names the risky course and hours left
- **Principles:** task migratability (Dix), never colour alone, visual hierarchy (Lec4)

### Slide 13 — Spring registration: rules built into the interface (P5)
- Repeat courses first and **locked** (cannot be removed by mistake)
- **ECTS limit bar** (30/36/40 by GPA); submitting is **blocked** if the limit is exceeded
- Choose a section → options show "✓ no clash" or "⚠ clashes with SE 2002"; **weekly calendar preview updates instantly**
- Clash messages suggest a fix: "Section 1 of SE 1004 has no clash"
- Draft → Advisor pre-approval → Registration week (stepper); status "Awaiting advisor approval"
- **Principles:** forcing functions (interlock, Lec3), error prevention over error messages, closure (Shneiderman #4), visibility

**Notes:** Eski OBS'de onaylanmış kayıtta bile kırmızı "UYARI! AKTS aşıldı" çıkıyordu; biz kuralı arayüze gömdük, hatayı oluşmadan engelledik.

### Slide 14 — Timetable, exams and catalogue (P1, P3)
- Consecutive hours merged: **one block per session** (Lecture/Practice label), grid starts at 08:30
- "Show in timetable" from a course highlights it and dims the rest
- Exams: chronological list, type filter, countdown ("in 4 days"), past exams marked "Held"
- Offered courses: search, year/type filters, Fall/Spring, sections and times from **the same department timetable**
- **Principles:** Gestalt continuity, right widget for the job (Lec5), explicit labels instead of tiny text buttons

### Slide 15 — Messages, account, accessibility, languages (P3, P7)
- Messages: inbox / sent / compose; delete with **Undo**, mark as unread; recipients grouped (your advisor / your instructors / others)
- **Password change** (did not exist): strength meter + checklist, inline errors, old password invalid after change
- Graduation credit request: suggestions from the curriculum, free typing allowed, **edit and delete** submitted requests
- Accessibility moved from a floating button that covered tables to settings: **text size, high contrast, colour-blind palette, reduced motion, dark theme**
- **4 languages**: Türkçe, English, Deutsch, العربية (**right-to-left** layout); dates and day names localised
- Responsive: bottom navigation on mobile, tables scroll inside their cards
- **Principles:** user diversity & accessibility (Lec2), customizability (Dix), ISO 9241-171

### Slide 16 — Live demo (4 min)
Bkz. Bölüm 5 — demo senaryosu.

### Slide 17 — Engineering for consistency (P6) — "software philosophy"
- **Single source of truth:** curriculum, regulations (ECTS limits, grading, graduation) and the department timetable each live in one file; every page reads from them
- **Realistic, personal data:** every e-mail gets its own student (year, grades, failed/repeated courses, timetable, attendance, messages) — deterministic, so the same student always sees the same data
- **Automated self-check:** 1,200+ generated students verified against 30+ rules (repeat only in the right term, ECTS limits, no timetable/exam clashes, totals add up to 240)
- **Independent recalculation:** GPA and ECTS recomputed separately and compared — 0 differences
- **Page sweep:** 4 languages × 16 pages, 0 crashes or untranslated strings
- **Why it matters for HCI:** inconsistent numbers destroy trust (reliability, Lec2) — one wrong ECTS total and students stop believing the whole system.

### Slide 18 — Results *(kullanıcı testinden sonra doldurulacak)*
- Task success, time, errors: old OBS vs prototype (6 tasks)
- SUS score: old vs new
- Quotes from participants
- Görsel: iki sütunlu çubuk grafik (süre) + SUS göstergesi

> ⚠️ **Gerçek test yapılmadan rakam uydurulmamalı.** Test yapılmadıysa slayt başlığı "Planned evaluation" olmalı ve Bölüm 6'daki plan gösterilmeli.

### Slide 19 — Limitations & future work
- Prototype only: no real backend or authentication; data is generated, stored in the browser
- Regulation values (ECTS limits, grade ranges) from student knowledge — must be verified against the official regulation
- Some course names are placeholders (SE 4007, SE 4011, SE 4004, ÜSD 0430)
- Next: real user testing with more students, card sorting for the menu, prerequisite checks in registration, integration with the real OBS data

### Slide 20 — Conclusion
- 28 problems → 7 principles → one consistent, working system
- "Bad design is the designer's fault, not the user's" (Lec1)
- Thank you — Questions?

---

## 4. Önce / sonra özet tablosu (rapor ve slaytlar için tek bakışta)

| Alan | Eski OBS | Yeni tasarım | Neden? (ilke) | Kullanıcı deneyimine etkisi |
|---|---|---|---|---|
| Menü | ~30 bağlantı, hepsi "…İşlemleri" | 11 hedef, 4 grup | Hick yasası, mental model | Aranan şey tahmin edilebilir yerde |
| Dönem | Sahte buton görünümlü etiket | Çalışan tek dönem seçici | Affordance, tutarlılık | Geçmiş dönem notları, dersleri, devamsızlığı tek yerden |
| Giriş | Tam adres yazma, şifre kontrolü yok | Uzantı otomatik, şifreyi göster, Caps Lock, kilit, e-Devlet | Hata önleme, slip | Daha az hatalı giriş, güven |
| Ana sayfa | 8 tıklanamaz kutu, tekrar eden bilgi | 4 tıklanabilir kart + bugün + uyarılar | Affordance, dialog initiative | İlk ekranda cevap |
| Notlar | 8 ayrı tablo, her yerde kırmızı | Tek tablo, durum rozeti, final hesaplayıcı | Gestalt, alışma, bellek yükü | "Finalden kaç almalıyım?" sorusu tek tıkla |
| Transkript | Ayrı sekme, T.C. no açık | Uygulama içi, PDF, kimlik no yok | Gizlilik, tutarlılık | Güvenli ve hızlı belge |
| Senaryo | Yoğun tablo, ayrı adım | Canlı AGNO, +/− renk, sıfırla | Anında dürüstlük, geri alınabilirlik | Kararların etkisi görülerek öğrenilir |
| Müfredat | Aynı hata mesajı 3×, açıklamasız ✕ | Kategori çubukları, gerçek kayıt, tekrar edilecek dersler | Eyleme dönük mesaj | Mezuniyete ne kaldığı net |
| Devamsızlık | Ham saat, kafadan %30 hesabı | Kalan saat, çubuk, rozet | Görev aktarımı | Hesap yok, risk görünür |
| Ders kaydı | Onaydan sonra bile kırmızı uyarı | Kilitli alttan dersler, AKTS çubuğu, şube çakışma kontrolü, takvim önizleme | Zorlayıcı işlevler | Hatalı kayıt oluşmadan engellenir |
| Program | Aynı ders 4 hücrede | Tek blok, vurgulama | Gestalt süreklilik | Daha az görsel gürültü |
| Erişilebilirlik | Tabloları kapatan yüzen buton | Ayarlar sayfası + koyu tema + 4 dil + RTL | Kullanıcı çeşitliliği | Herkes için kullanılabilir |
| Hesap | Şifre değiştirme yok | Güç göstergeli şifre değiştirme | Görünürlük, kapanış | Güvenlik kullanıcının elinde |

---

## 5. Canlı demo senaryosu (~4 dk)

> Demo hesabı: kullanıcı adı `umut.gunes`, şifre `umutgunes123` (başarısız, alttan ve devamsızlık durumlarını gösterir). Mezuniyet kredisi için `ali.kirgiz` başka tarayıcıda 4. sınıf olarak hazırlanabilir. Demo şifre kuralı: ad + soyad bitişik + 123.

1. **Giriş (20 sn):** sadece kullanıcı adı yaz → "Hoş geldin" önizlemesi; dil düğmesini göster.
2. **Ana sayfa (40 sn):** AGNO kartı "2.00 altında · sınır 30 AKTS"; "3 dersi alttan alman gerekiyor" uyarısı; devamsızlık kartına tıkla → Devamsızlık sayfası (TT olan ders).
3. **Not Listesi (40 sn):** tek tablo, sınıf ortalaması okları; **Final Hesaplayıcı** → kaydırıcı, "AA için gereken final" kartına tıkla.
4. **Dönem seçici (20 sn):** geçmiş döneme geç → ders ortalaması + harf notu; Transkript o döneme kayar.
5. **Transkript Senaryosu (40 sn):** SE 1004 için "CC ile" → AGNO 1.53 → 1.73; Sıfırla.
6. **Bahar Ders Kaydı (50 sn):** kilitli alttan dersler; bir şubeyi değiştir → çakışma uyarısı ve takvim önizlemesi değişir; AKTS sınırını aşan dersi ekle → gönder düğmesi kilitlenir; geri al, "Danışmana gönder" → "Danışman onayında".
7. **Müfredat (20 sn):** kategori kartları, "Tekrar alınması gereken dersler".
8. **Hesap (20 sn):** koyu tema + Arapça → sayfa sağdan sola döner; Türkçeye dön.

**Yedek plan:** canlı demo aksarsa her adımın ekran görüntüsü slaytların sonunda "Backup" bölümünde olsun.

---

## 6. Değerlendirme planı (henüz yapılmadıysa slayt 18'de gösterilecek)

- **Katılımcı:** en az 5 öğrenci, aynı görevler önce eski OBS'de sonra prototipte (sıra dengelenebilir).
- **Görevler:**
  1. "SE 3007 vize notunu bul"
  2. "Kaç saat devamsızlık hakkın kaldı?"
  3. "Laboratuvar hangi gün?"
  4. "Transkripti PDF al"
  5. "Bir not değişseydi AGNO kaç olurdu?"
  6. "Şifreni değiştir"
- **Ölçümler:** görev süresi, hata sayısı, başarı (Lec2: hız, hata oranı, öğrenme süresi, memnuniyet) + **SUS** (10 soru) her iki sistem için.
- **Ek yöntemler:** kısa görüşme, persona, kart sıralama (menü grupları için).

---

## 7. Olası sorular ve cevaplar (Q&A hazırlığı)

| Soru | Cevap özeti |
|---|---|
| Why not just fix the old OBS's colours? | Problems were structural (navigation, duplicated tables, mental arithmetic), not cosmetic — 12 of 28 were "Major". |
| How do you know the new design is better? | Each change is grounded in a course principle; consistency is verified automatically; user test with SUS compares both systems (sonuçlar / plan). |
| Is the data real? | No. Every student is generated from the e-mail address, but with the real MSKÜ Software Engineering curriculum and rules, so behaviour is realistic. No real personal data is used. |
| Why 11 menu items? | Hick's law and 7±2: four groups of at most 7, organised by student goals instead of system modules. |
| Why keep e-Devlet login? | Familiarity and trust (Dix: familiarity); it is a path students already use. |
| Why four languages? | User diversity (Lec2): international and exchange students; Arabic tests right-to-left layout. |
| What about accessibility? | Text size, high contrast, colour-blind palette, reduced motion, dark theme; colour never carries meaning alone. |
| Biggest limitation? | No backend and no real user data yet; regulation values need official verification. |

---

## 8. Sunumda kullanılabilecek rakamlar (hepsi doğrulanmış)

- Menü: **~30 → 11** öğe, 4 grup
- Not listesi: **8 tablo → 1 tablo**
- Ders programı: aynı ders **4 hücre → 1 blok**
- **28** belgelenmiş sorun, **12** tanesi "Major"
- Müfredat: **240 AKTS** = 166 zorunlu + 48 teknik seçmeli + 23 bölüm dışı + 3 disiplinlerarası; her yarıyıl 30
- Otomatik test: **1.200+** üretilmiş öğrenci profili, **30+** kural, **0** hata
- Dil: **4** dil, **650+** çevrilmiş arayüz metni, **320** sayfa yüklemesinde 0 hata
- Erişilebilirlik: **5** ayar (yazı boyutu, kontrast, renk körü, hareket, koyu tema)

---

## 9. Kaynaklar (raporda atıf için)

- Ders slaytları: Lec1–Lec7 (SE4513) — kötü tasarım, kullanılabilirlik, hata türleri, görsel hiyerarşi, widget/navigasyon, Nielsen/Shneiderman/Norman/Dix kuralları, mental model, Gestalt, bellek.
- Nielsen, J. — *10 Usability Heuristics for User Interface Design*.
- Shneiderman, B. — *Eight Golden Rules of Interface Design*.
- Norman, D. — *The Design of Everyday Things* (affordance, gulf of execution/evaluation).
- Dix, A. et al. — *Human-Computer Interaction* (learnability, flexibility, robustness ilkeleri).
- Hick, W. E. / Hyman, R. — seçim sayısı ve karar süresi.
- Brooke, J. — *SUS: A quick and dirty usability scale*.
- ISO 9241-11 (kullanılabilirlik tanımı), ISO 9241-171 (yazılım erişilebilirliği).
- Proje içi: `docs/heuristic-evaluation.md` (28 sorun, ciddiyet, ilke), `PROJE_OZETI.md` (teknik ayrıntılar ve son kontrol).
