# Yeni sohbet için bağlam: MSKÜ OBS projesi

> Bu metni yeni bir Claude sohbetinin ilk mesajı olarak yapıştır. Proje klasörü: `~/Desktop/msku-obs`.
> Aynı klasörde daha kısa bir özet de var: `PROJE_OZETI.md`.

---

## 0. Kim, ne, neden

- Muğla Sıtkı Koçman Üniversitesi (MSKÜ) **Yazılım Mühendisliği 4. sınıf** öğrencisiyim.
- **SE4513 Human-Computer Interaction** dersi için grup projesi yapıyoruz. Proje notun %50'si, final %50'si.
- Hocanın istediği: var olan bir arayüzü HCI ilkelerine göre inceleyip yeniden tasarlamak (başka bir grup Yemeksepeti'ni yapmıştı).
- Biz **MSKÜ Öğrenci Bilgi Sistemi'ni (OBS, obs.mu.edu.tr)** seçtik.
  - Herkes kullanıyor, sorunları somut, hoca hemen tanır.
  - Trendyol'u düşündük ama derste zaten örnek olarak işlenmişti.
- Amaç: eski OBS'nin kullanılabilirlik sorunlarını belgelemek, her sorunu ders slaytlarındaki bir ilkeyle gerekçelendirmek, sorunları çözen **modern, sade, çalışan** bir frontend prototip yapmak. Sunumda canlı demo yapılacak, raporda "hangi ilkeyi neden uyguladık" sorusu cevaplanacak.
- Proje ekip işi. Ben bir yere kadar ilerlettim, **ekip arkadaşım devam edecek** (proje klasörünü zipleyip ona gönderiyorum).

### Dersin proje şartları (Lec1 slaytı)
- Grup 2–4 kişi.
- ~15 dk **İngilizce** sunum (soru-cevap dahil); demo, görsel ve araç içermeli.
- **4–6 sayfa rapor, ACM Single Column şablonu.** Raporda hangi guideline'ların ve ilkelerin uygulandığı, artı/eksiler ve UX tasarımı anlatılmalı.
- Sunumdan sonra en geç 2 gün içinde e-postayla teslim; geç teslimde günde %10 kesinti.
- Yapay zekâ kullanılabilir ama **metin birebir kopyalanamaz** (yoksa 0 puan). Raporu kendi cümlelerimizle yazmalıyız.
- Beklenen yöntemler: prototip, gerçek kullanıcıyla test, anket, uzman görüşmesi, storyboard.

### Ders slaytları (Lec1–Lec7) — projede kullanılan kavramlar
- **Lec1:** Kötü tasarım kullanıcının değil tasarımcının hatasıdır; tasarım bazen kasıtlı olarak kötüdür (dark pattern); gizlilik.
- **Lec2:** Etkileşimli sistem, HCI / UI / UX, kullanılabilirlik (ISO 9241), erişilebilirlik, kullanıcı çeşitliliği (yaşlı, engelli, kültürel), beceri düzeyleri (novice → expert), güvenilirlik, etkileşim tasarımının 5 boyutu, ölçme (öğrenme süresi, hız, hata oranı, akılda kalma, memnuniyet).
- **Lec3:** Tasarım süreci, ihtiyaç keşfi (görüşme, gözlem), persona, senaryo, storyboard, paydaş analizi, görev sıklığı analizi, hata türleri (slip / mistake / lapse, mode error), zorlayıcı işlevler (interlock, lock-in, lock-out), "Are you sure?" sorunu, hata mesajlarının anlaşılır ve eyleme dönük olması.
- **Lec4:** Görsel hiyerarşi (boyut, en fazla 2 büyük öğe, 3 yazı boyutu), renk (kırmızı = acil, sadece renge güvenme, renk körlüğü), kontrast, boşluk, hizalama (sayılar sağa), Poynter göz izleme (sol üst öncelikli), duygu.
- **Lec5:** Widget, mikro etkileşim, gruplama, Gestalt yakınlık, grid, navigasyon, breadcrumb, menü genişliği / derinliği (Miller 7±2), affordance (açık, negatif, sahte), kâğıt prototip.
- **Lec6:** Tasarım kuralları; Dix ilkeleri (öngörülebilirlik, sentezlenebilirlik / anında dürüstlük, tanıdıklık, tutarlılık, diyalog inisiyatifi, görev aktarımı, özelleştirilebilirlik, gözlemlenebilirlik, kurtarılabilirlik, yanıt verebilirlik), ISO 9241, Shneiderman'ın 8 altın kuralı, Norman'ın 7 ilkesi, Nielsen'in 10 sezgisel kuralı. Sınıf içi etkinlik Trendyol/Amazon üzerineydi.
- **Lec7:** Kavramsal ve zihinsel modeller ("Register" yerine "Continue" ile 300 milyon dolar örneği), sneaking / preselection, bilişsel model, Human Processor, GOMS / KLM, algı, Gestalt yasaları, dikkat türleri, bellek (7±2).

---

## 1. Eski OBS'de tespit ettiğimiz sorunlar (ekran görüntülerinden)

Ayrıntılı liste (28 madde, Nielsen 0–4 ciddiyet + ilke + çözüm) **`docs/heuristic-evaluation.md`** dosyasında. Özet:

- **Sol menü:** ~30 bağlantı. "Genel İşlemler" tek başına 15 öğe (Kullanım Kılavuzu, Özlük, Harç, Bölüm Ders Programı…). "Ders ve Dönem İşlemleri" 10 öğe. İlgili sayfalar farklı gruplarda (Sınav Takvimi "Genel"de, Not Listesi "Ders ve Dönem"de). Bütün grupların adı "…İşlemleri".
- **Üst bar:** "2026-2027 Güz" buton gibi görünüyor ama tıklanmıyor (sahte affordance). Megafon + kırmızı "2" ne anlama geldiği belli değil. Mavi yüzen erişilebilirlik butonu tabloların üstüne biniyor. Oturum süresi sağ altta minicik "30:00".
- **Ana sayfa:** 8 kutu tıklanamıyor. Bölüm adı 3 kartta tekrar ediyor, "Fakülte" iki kez yazıyor. "Ek Akademik Bilgiler: -1", danışman altında yalnız "-" gibi anlamsız veriler var. Yeşil bant + uyarı üçgeni + "Bilgilendirme" metni birbiriyle çelişiyor. Hızlı erişim en altta ve Not Listesi orada yok.
- **Not Listesi:** Her ders için ayrı tablo; aynı başlık satırı 8 kez tekrar ediyor. Çoğunda "Kayıt Yok" veya "--" var. Her derste kırmızı "Sonuçlandırılmadı" yazıyor (alışma etkisi). Not ile sınıf ortalaması arasında "İlan Tarihi" sütunu var, sayılar sola hizalı.
- **Ders Kayıt:** Kayıt kapandı diye kırmızı alarm bandı. Onaylanmış kayıtta bile kırmızı "UYARI! En Fazla Alabileceğiniz AKTS Aşıldı". "Z/S", "T+U", "Alış: Alttan", "Aç.Nedeni: Dnm." gibi kısaltmalar. Satır sonlarında belirsiz "Diğer Bilgiler" / renkli mini ikonlar (mystery meat).
- **Ders Programı:** Aynı ders her saat kutusunda tekrar ediyor (ör. SE 4009 08:30, 09:30, 10:30, 11:30). Boş 06:00–06:45 satırı var. "Detaylı | Sade | Yazdır" minicik metin düğmeleri.
- **Sınav Takvimi:** Her derse ayrı tablo; tarihlerin çoğu "(Açıklanmadı)". 4 seçenek için aramalı açılır menü kullanılmış.
- **Mezuniyet İlerleme:** "Mezuniyet kuralları eksik olduğundan tamamlanma oranı şu an hesaplanamamaktadır" mesajı 3 kez. Açıklamasız kırmızı ✕ ve "(!)" işaretleri. Kimlik kartları tekrar ediyor.
- **Dönem Ortalamaları:** İki gökkuşağı renkli grafik; renklerin anlamı yok. "Muaf" 4.00 diye bir dönem gibi çiziliyor, aktif dönem 0.00.
- **Transkript:** "T" butonu ayrı sekmede gri bir belge açıyor ve **T.C. Kimlik No ekranda tam görünüyor**.
- **Transkript Senaryosu:** Yoğun iki sütunlu tablo; her satırda düzenleme ikonu; ayrı bir "hazırla" adımı; aynı başarı mesajı iki yerde.
- **Devamsızlık:** Gri "Yoklama Girişi Yapılmamış" yazıları ve etiketsiz ⓘ ikonları. %30 sınırını öğrenci kafadan hesaplıyor.
- **Açılan Bölüm Dersleri:** Uzun, filtresiz tablo; "T", "U/L", "Z" ✓ sütunları; aynı ders her şube için ayrı satır.
- **Hesap:** Şifre değiştirme özelliği yok.

---

## 2. Sürecin kronolojisi (bu sohbette neler oldu)

1. **Fikir aşaması:** OBS, MHRS, e-Devlet, bankacılık, kiosk ve Trendyol karşılaştırıldı; OBS seçildi.
2. **Slaytlar okundu** (Lec1–7) ve projeye uygulanabilecek kavramlar çıkarıldı.
3. **İlk prototip** (`obs-redesign`):
   - "HCI Lens": her değişen öğenin üstünde numaralı rozet; tıklanınca önce / sonra / ilke / ciddiyet gösteriyordu.
   - "HCI Merkezi": personalar, görev sıklığı, paydaş analizi, heuristic tablo, KLM, kullanılabilirlik testi + SUS, tasarım sistemi.
   - Ayrıca TR/EN dil desteği, kayıt taslağı, çakışma kontrolü, final hesaplayıcı.
4. **Kapsamlı gereksinim listesi geldi** ve proje sıfırdan **`msku-obs`** olarak yeniden yazıldı:
   - giriş ekranı, 11 sayfalık sade menü
   - gerçek MSKÜ Yazılım Mühendisliği (%100 İngilizce) müfredatı
   - Apple / Stripe / Linear estetiği, MSKÜ laciverti
5. **Revizyonlar** (benim geri bildirimlerimle):
   - Yazdırma / PDF'de ders programının sağ tarafı (Cuma) kesiliyordu → düzeltildi, A4'e sığıyor.
   - İsim girişe göre değişmeli → e-postadan ad-soyad türetiliyor.
   - Öğrenci numarası kişiye göre değişmeli.
   - **"SE4513 Sunum modu / HCI Lens / HCI Merkezi" uygulamadan tamamen kaldırıldı** (istemedim). İçerik rapor için `docs/heuristic-evaluation.md` dosyasına aktarıldı.
   - Karanlık / aydınlık mod düğmesi eklendi.
   - **Final hesaplayıcı** eklendi; ayrı menü yerine Not Listesi'nin içinde.
   - Yönetmelik kuralları işlendi: kredi limitleri, not ağırlıkları, geçme notu, mezuniyet şartları.
   - **Mezuniyet Kredisi Talebi** sayfası sol menüye eklendi.
   - Şifre kuralı: `adsoyad123`. Şifre değiştirme ve 5 hatalı denemede 30 saniye kilit.
   - Mesajlarda **sil (geri alınabilir)** ve **okunmadı olarak işaretle**. Alıcı listesinde tüm hocalar unvanlarıyla; ders seçimi kaldırıldı.
   - Ana sayfa devamsızlık kartı: sınıra yakın ders varsa "Kritik Ders Yok" yazmıyor, dersi ve kalan saati gösteriyor.
   - Türkçe karakter algılama (kirgiz → Kırgız) ve Hesap sayfasında **ayrı Ad / Soyad alanları**.
   - Birleşik kullanıcı adlarını ayırma (mertdemir → Mert Demir, ahmetkoseoglu → Ahmet Köseoğlu).
   - **Her kullanıcı için ayrı öğrenci profili:** farklı sınıf, numara, notlar, dersler, program, devamsızlık, mesajlar.
   - MSKÜ logosu eklendi (`public/msku-logo.png`, kenar boşlukları kırpılmış).
6. **Taşıma:** Proje `~/Desktop/trendyol/msku-obs` konumundan **`~/Desktop/msku-obs`** konumuna taşındı. `PROJE_OZETI.md` yazıldı.
   - Boş kalan `~/Desktop/trendyol` klasörünü (içinde sadece `.DS_Store` ve `.claude/launch.json`) güvenlik kontrolü yüzünden silemedik; elle silinmesi gerekiyor.

---

## 3. Uygulamanın şu anki hali

**Teknoloji:** React 18 + TypeScript + Vite, ikonlar lucide-react. Grafikler kütüphanesiz SVG.
- **Backend yok.** Tüm veriler sahte veri + state; `localStorage` / `sessionStorage` kullanılıyor.
- Çalıştırma: `cd ~/Desktop/msku-obs && npm install && npm run dev` → **http://localhost:5173**
- `.claude/launch.json` var; Claude'un tarayıcı panelinde `msku-obs` adıyla başlatılabilir.

### Görsel stil
- Açık gri / beyaz yüzeyler `#F8FAFC` / `#FFFFFF`, MSKÜ laciverti `#0F172A` / `#1E3A8A`, kenarlık `#E2E8F0`, Inter yazı tipi.
- Karanlık mod var. Yazdırmada her zaman açık renk.
- Renk tek başına anlam taşımıyor; her durumda ikon + metin de var.
- Kırmızı yalnızca gerçek risk için kullanılıyor. "Yeni" etiketi mor.

### Kabuk (Shell)
- **Sol menü** (11 sayfa, 4 grup):
  - Genel: Ana Sayfa
  - Akademik & Ders İşlemleri: Alınan Dersler & Ders Kayıt · Not Listesi · Transkript & Senaryo · Müfredat & Mezuniyet Durumu · Dönem Ortalamaları · Devamsızlık Durumu · Mezuniyet Kredisi Talebi
  - Takvim & Katalog: Ders Programı & Sınav Takvimi · Açılan Bölüm Dersleri
  - İletişim & Hesap (en altta): Mesajlar (okunmamış sayısıyla) · Hesap & Kullanıcı İşlemleri · Çıkış Yap
- **Üst bar:** sayfa başlığı ve grubu, çalışan dönem seçici, ay/güneş tema düğmesi, bildirim zili (okunmamış mesajlar + yeni notlar), profil menüsü (ad, numara, e-posta, oturum süresi + Uzat, Hesap, Mesajlar, Çıkış).
- **Oturum:** 30 dk; bitmeden 2 dk önce uyarı penceresi, süre dolunca çıkış.
- **⌘K / Ctrl+K komut paleti:** sayfa, ders ve işlem arama. Görünür bir düğmesi yok, uzmanlar için kısayol.
- **Mobil:** Alt gezinme çubuğu (Ana Sayfa, Dersler, Notlar, Program). Sol menü açılır çekmeceye dönüşüyor.
- **Geçmiş dönem:** Dönem seçicide geçmiş bir dönem seçilince ilgili sayfalar "dönem tamamlandı / transkripte git" gösteriyor. Not Listesi o dönemin harf notlarını gösteriyor.

### Sayfalar
- **Giriş:**
  - Sol tarafta lacivert marka paneli ve logo, sağda form.
  - E-posta alanında `@posta.mu.edu.tr` soneki görünüyor; sadece kullanıcı adı yazmak yeterli.
  - Yazarken "Giriş adresi: … · Hoş geldin, Ali Kırgız" önizlemesi çıkıyor.
  - Yanlış uzantıda satır içi hata. Şifre göster/gizle, Caps Lock uyarısı, kalan deneme hakkı, 5 hatada 30 sn kilit.
  - Demo notunda şifre kuralı yazıyor. Google vb. giriş yok.
- **Ana Sayfa:**
  - Selamlama ("İyi günler, Ali") ve "Yazılım Mühendisliği · X. Sınıf · Y. Yarıyıl".
  - **4 tıklanabilir özet kartı** (hover'da yükselir, ↗ belirir):
    - AGNO → Dönem Ortalamaları
    - Aktif Dönem (X ders / Y AKTS) → Alınan Dersler
    - Mezuniyet İlerlemesi (X/240 AKTS, %) → Müfredat
    - Devamsızlık Özeti → Devamsızlık; "Tüm dersler güvenli", "N derste sınıra yakın + ders + kalan saat" veya kırmızı "kritik" gösterir
  - Alt kısım: Bugünkü / Sıradaki dersler (→ program), Yaklaşan sınavlar (geri sayımlı, → sınav takvimi), Duyurular & hoca mesajları (→ mesajlar).
- **Alınan Dersler & Ders Kayıt:**
  - "Öğrenci kesinleştirme: Kesinleştirildi" ve "Danışman onayı: Onaylandı" yeşil rozetleri.
  - AKTS çubuğu; üst sınır AGNO'ya göre (30 / 36 / 40).
  - Ders tablosu: kod, şube, tür, T+U, AKTS, öğretim üyesi.
  - Her satırda **yalnızca 2 buton:**
    - **Ders İçeriği:** sağdan açılan çekmece; şube, T+U, AKTS, tür, öğretim üyesi, derslik, ders amacı, haftalık saatler.
    - **Programda Gör:** Ders Programı'na gidip o dersi vurgular, diğerlerini soluklaştırır.
- **Not Listesi:**
  - Tek tablo: Vize, Ödev/Proje, Final ("Bekleniyor" rozeti), şu anki ortalama, durum rozeti (İyi gidiyor / Ortalama / Dikkat / Bekleniyor).
  - Her notun altında sınıf ortalaması ve fark oku; "Yeni" rozeti.
  - **Final Hesaplayıcı** (başlıkta genel buton + her satırda "Final hesapla"):
    - ders seçimi; açıklanmamış vize/ödev için tahmini not girişi
    - final kaydırıcısı ve sayı kutusu
    - canlı ders ortalaması ve harf notu ("Bu final notuyla dersi CC ile geçersin")
    - AA…DD için gereken en düşük final notu kartları; tıklayınca final o nota ayarlanır
- **Transkript & Senaryo** (2 sekme):
  - **Resmi Transkript:** uygulama içi belge görünümü (logo, ad, numara, bölüm, hazırlık, AGNO, AKTS, yarıyıl bazlı tablolar, YANO/AGNO). **PDF İndir / Yazdır** (`window.print`, yazdırma CSS'i). T.C. numarası yok.
  - **Transkript Senaryosu (what-if):** her dersin harf notu açılır menüden değiştirilir; **Yeni Ders Ekle** (seçmeli havuzundan); **Sıfırla**. Üstte yapışkan çubuk: Mevcut AGNO, Yeni AGNO, değişim (yeşil + / kırmızı −), aktif dönem YANO'su.
- **Müfredat & Mezuniyet Durumu:**
  - İlerleme çubukları (tamamlanan + alınıyor + kalan): Toplam AKTS (x/240), Zorunlu (166), Bölüm İçi Teknik Seçmeli (48), Bölüm Dışı Seçmeli (23), Disiplinlerarası Proje (3), Staj (0/2).
  - 1–8 yarıyıl sekmeleri ve durum filtresi (Tümü / Tamamlandı / Alınıyor / Alınmadı).
- **Dönem Ortalamaları:** Sade tablo (ders sayısı, alınan / başarılan AKTS, YANO, AGNO) ve tek SVG grafik (YANO çubuk, AGNO çizgi, hover'da ayrıntı). Aktif dönem "Devam" olarak işaretli, 0 diye çizilmiyor.
- **Devamsızlık Durumu:**
  - Her ders için ilerleme çubuğu, `9 / 12 Saat (%75)` ve kalan saat.
  - Rozetler: Güvenli (yeşil, <%60), Dikkat — Sınıra Yakın (turuncu, %60–85), Kritik Sınır (kırmızı, ≥%85).
  - **Haftalık detay** penceresi 14 haftayı gösteriyor (tam katılım / devamsız / henüz yapılmadı).
- **Mezuniyet Kredisi Talebi:**
  - Dönemlik AKTS sınırı tablosu; öğrencinin satırı vurgulu.
  - Şart kontrolü: 4. sınıf, ≥156 AKTS, AGNO ≥ 2.00; yeşil ✓ veya kırmızı ✕ ve mevcut değer.
  - Şart sağlanıyorsa form: dönem, +ek AKTS (42'ye kadar), eklenecek ders, gerekçe (en az 20 karakter). Gönderilen talepler adım çubuğuyla listeleniyor (Gönderildi → Danışman onayı → Bölüm onayı).
  - Şart sağlanmıyorsa kilitli bilgi kutusu ve "Formu önizle" bağlantısı.
- **Ders Programı & Sınav Takvimi** (2 sekme):
  - **Program:** Pzt–Cum, 08:30–17:15. Ardışık saatler tek blok; Teori / Uygulama etiketi. **Detaylı / Sade** geçişi ve **Programı Yazdır** (A4 yatay, sayfaya sığar). `?course=` ile vurgulama.
  - **Sınav Takvimi:** tip filtresi (Tümü / Ara Sınav / Yarıyıl Sonu / Bütünleme), "Geçmiş sınavları göster" kutusu, aylara göre gruplu liste (tarih, saat, süre, derslik), geri sayım rozeti ("4 gün sonra"). Geçmiş sınavlar "Yapıldı".
- **Açılan Bölüm Dersleri:** Güz döneminde açılan dersler (1, 3, 5, 7. yarıyıllar + 5. yarıyıl seçmeli havuzu). Arama, sınıf (1–4) ve tür (Zorunlu / Seçmeli) filtresi; "Aldığınız ders" işareti.
- **Mesajlar** (Gelen Kutusu / Gönderilenler / Yeni Mesaj Yaz):
  - İki panelli okuma görünümü.
  - **Sil** (toast'ta "Geri al") ve **Okunmadı olarak işaretle**. İşaretleyince hiçbir mesaj otomatik açılmıyor; toast'ta geri alma var.
  - **Yeni mesaj:** alıcı listesinde tüm öğretim üyeleri unvanlarıyla, 3 grupta (Danışmanınız / Bu dönem derslerinize girenler / Diğer öğretim üyeleri); ders seçimi yok. Konu ve mesaj (en az 10 karakter) doğrulaması.
  - Mesajlar kullanıcı başına ayrı saklanıyor.
- **Hesap & Kullanıcı İşlemleri:**
  - **Profil:** fotoğraf yükleme, önizleme, kare kırpma (en fazla 2 MB), kaydet / vazgeç / kaldır.
  - Bilgiler: Ad, Soyad, numara, e-posta, fakülte, bölüm, sınıf, dönem, durum, danışman.
  - Düzenlenebilir: **ayrı Ad ve Soyad alanları**, telefon.
  - **Şifre yenileme:** mevcut / yeni / tekrar; şifre gücü çubuğu (5 kademe) ve kontrol listesi (8 karakter, büyük harf, küçük harf, rakam, sembol); en az "İyi" seviye şart; satır içi hatalar; başarı mesajı.
  - **Görünüm ve erişilebilirlik:** yazı boyutu (3 kademe), yüksek kontrast, renk körü dostu renkler, animasyonları azalt, koyu tema.

---

## 4. Giriş, kimlik ve kişiye özel veri (önemli mantık)

- **E-posta:** `ad.soyad@posta.mu.edu.tr` ya da sadece `ad.soyad`; birleşik `mertdemir` de olur.
- **Varsayılan şifre:** ad + soyad, bitişik, küçük harf + `123` (`ali.kirgiz` → `alikirgiz123`, `mertdemir` → `mertdemir123`).
  - Büyük/küçük harf ve Türkçe karakter duyarsız.
  - Başka şifre kabul edilmiyor.
  - Hesap sayfasında şifre değiştirilirse o e-posta için yalnızca yeni şifre geçerli (`localStorage` → `msku.passwords`, düz metin, demo amaçlı).
- **İsim:** `src/data/names.ts` içindeki ad ve soyad sözlüğüyle Türkçeleştirme (kirgiz → Kırgız, koseoglu → Köseoğlu, "-oğlu" eki) ve birleşik adı ayırma (`splitJoined`). Kullanıcı Hesap sayfasında düzeltebiliyor (`msku.profiles`, e-postaya göre).
- **Kişiye özel profil:** `src/lib/academic.ts` → `generate(email, displayName)`. E-postadan tohumlu (seeded) rastgele sayı üretiliyor. Sınıf (2, 3 veya 4) ve tohum `localStorage` → `msku.students` içinde saklanıyor. Üretilenler:
  - sınıf → aktif yarıyıl (2026-2027 Güz → 3, 5 veya 7)
  - giriş yılı ve hazırlık yılı
  - **öğrenci no** = hazırlık yılının son 2 hanesi + `0717` + 3 hane (4. sınıf → `22…`)
  - danışman (Cihat Çetinkaya / Emine Elif Tülay / Selim Yılmaz / Erkut Tekeli)
  - geçmiş dönemler: zorunlular + seçmeli havuzundan seçimler; öğrenciye özgü başarı düzeyiyle harf notları
  - AGNO, YANO, tamamlanan AKTS
  - aktif dönem dersleri (7. yarıyılda 3 seçmeli)
  - ders bilgileri (şube, derslik, amaç)
  - bu dönemin vize ve ödev notları
  - çakışmasız haftalık program (sabah ve öğleden sonra 4'er saatlik bloklar)
  - devamsızlık (çoğunlukla güvenli; bazen 1 ders sınıra yakın, nadiren kritik)
  - sınavlar (ara, yarıyıl sonu, bütünleme)
  - gelen ve gönderilen mesajlar
- Hocası belirtilmemiş seçmelilere bölüm hocalarından biri atanıyor.
- Store'da: `useApp()` (genel durum, `me` = ad, numara, sınıf vb.) ve `useData()` (`StudentData`). Sayfalar kişiye özel veriyi `useData()` ile alıyor.

**Denenmiş kullanıcılar:**

| E-posta | Şifre | Sınıf | Numara | AGNO | Not |
|---|---|---|---|---|---|
| `ali.kirgiz` | `alikirgiz123` | 4 (7. yy) | 220717122 | 3.60 | 180 AKTS, mezuniyet kredisine uygun |
| `mertdemir` | `mertdemir123` | 2 (3. yy) | 240717440 | 2.07 | MATH 1856 TT, TDB 1802 FF (Bahar'da alttan) |
| `ahmetkoseoglu` | `ahmetkoseoglu123` | 3 (5. yy) | 230717777 | 2.84 | SE 1002 alttan geçildi, ÜSD 0412 TT |
| `umut.gunes` | `umutgunes123` | 2 (3. yy) | — | 1.53 | Alttan ders, TT, AKTS sınırı 30, ertelenen ders |

> Profil üretim kodu değişirse notlar değişebilir; sınıf saklandığı için değişmez.

---

## 5. Yönetmelik kuralları (benim beyanım, tek yerde: `src/data/msku.ts` → `REG`)

- **Dönemlik AKTS sınırı:** AGNO < 2.00 → 30 · 2.00–2.99 → 36 · ≥ 3.00 → 40. Hiçbir zaman 45 yok.
- **Mezuniyet kredisi:** 4. sınıf, en az 156 AKTS tamamlamış, AGNO ≥ 2.00 → 42 AKTS'ye kadar (36 + 6 talep).
- **Not ağırlığı:** yarıyıl içi %40 (vize; ödev/proje varsa vize %30 + ödev %10), final %60.
- **Geçme:** ders ortalaması ≥ 40 ve final ≥ 40 (çan eğrisi olan derslerde farklı olabilir).
- **Harf aralıkları (onayladım):** AA ≥ 90 · BA ≥ 85 · BB ≥ 80 · CB ≥ 75 · CC ≥ 60 · DC ≥ 50 · DD ≥ 40 · altı FF.
- **Mezuniyet:** 166 zorunlu + 48 bölüm içi teknik seçmeli + 23 bölüm dışı seçmeli + 3 disiplinlerarası proje = **240 AKTS**, AGNO ≥ 2.00.
- **Devamsızlık sınırı:** haftalık saat × 14 hafta × %30.

## 6. Müfredat verisi

- Gerçek MSKÜ Yazılım Mühendisliği (%100 İngilizce) müfredatı; ders kodu, adı, AKTS, tür ve öğretim üyeleri ben verdim. Hepsi `src/data/msku.ts` → `CURRICULUM`.
- 5. yarıyıl ek seçmeli havuzu (`FALL_POOL`): SE 3503, SE 3507, SE 3509.
- Bölüm dışı seçmeli olarak 3. ve 4. yarıyıla birer ÜSD dersi eklendi (5 AKTS).
- **ENG 3500 Interdisciplinary Engineering Project** (3 AKTS, 7. yarıyıl) "Disiplinlerarası Proje" türünde eklendi.
- Kredi toplamları tutarlı (her yarıyıl 30 AKTS, toplam 240). SE 4007 ve SE 4004 eksik zorunlu kredi için yer tutucu derslerdir.
- `msku.ts` içinde eski sabit "Kerem Yılmaz" örnek verileri (`student`, `GRADES`, `SCHEDULE`, `EXAMS`, `COURSE_INFO` vb.) hâlâ duruyor. Bazıları yedek veya katalog olarak kullanılıyor (`COURSE_INFO`, `ANNOUNCEMENTS`, `student.programShort` vb.).

## 7. Dosya yapısı

```
~/Desktop/msku-obs/
├── PROJE_OZETI.md                 devir belgesi (kısa)
├── YENI_SOHBET_BAGLAMI.md         bu belge
├── README.md
├── docs/heuristic-evaluation.md   28 sorun + çözüm + ilke + ciddiyet (rapor kaynağı)
├── public/msku-logo.png           logo (256×256, kırpılmış) + favicon
├── index.html, package.json, vite.config.ts (base './'), tsconfig.json
├── .claude/launch.json            npm run dev, port 5173
└── src/
    ├── App.tsx            giriş kontrolü, sayfa yönlendirme (hash router: #/dashboard …)
    ├── main.tsx
    ├── styles.css         tasarım değişkenleri, karanlık mod, temel bileşenler (eski lens/test stilleri kalıntı)
    ├── pages.css          sayfa stilleri, responsive, yazdırma (@page timetable landscape)
    ├── data/msku.ts       müfredat, REG, tipler, örnek veriler, duyurular
    ├── data/names.ts      Türkçe ad/soyad sözlüğü, turkishWord, splitJoined
    ├── lib/academic.ts    kişiye özel profil üreteci (StudentData)
    ├── lib/store.tsx      AppProvider: ayarlar, rota, oturum (sessionStorage msku.auth), şifre kontrolü,
    │                      profil, me, data, mesajlar (kullanıcı başına), toast, oturum süresi, ⌘K
    ├── lib/util.ts        tarih, GPA, courseAverage, attendance, passwordStrength, contrast, downloadFile
    ├── components/Shell.tsx   Sidebar, MobileNav, TopBar (dönem, tema, bildirim, profil), SessionGuard, Toasts, Avatar
    ├── components/Palette.tsx ⌘K komut paleti
    ├── components/nav.ts      menü tanımı
    ├── components/ui.tsx      Card, CardHead, Button, Chip, Progress, PageHeader, Tabs, Drawer, Modal, Segmented, Logo
    └── pages/  Login, Dashboard, Courses, Grades, Transcript, Curriculum, Averages, Attendance,
                GradCredit, Schedule, Offered, Messages, Account
```

`localStorage` anahtarları: `msku.settings`, `msku.students`, `msku.profiles`, `msku.passwords`, `msku.inbox.<email>`, `msku.sent.<email>`, `msku.gradRequests`, `msku.lastUser`.
`sessionStorage`: `msku.auth`.

---

## 8. Benim tercihlerim / çalışma şeklim

- Benimle **Türkçe** konuş. Uygulamanın arayüzü Türkçe; sunum ve rapor İngilizce olacak.
- Değişikliklerden sonra uygulamayı **tarayıcıda gerçekten test et**, sonra ne yaptığını açıkça anlat.
- **Gerçek kişisel veri kullanma.** Ekran görüntülerimde gerçek ad, numara ve T.C. no var; bunlar koda asla girmez.
- Uygulamada **"sunum modu", HCI Lens, HCI Merkezi gibi şeyler istemiyorum.** Uygulama gerçek bir OBS gibi görünmeli.
- Modern, sade, profesyonel görünüm (Apple / Stripe / Linear), MSKÜ renkleri.
- Kişiye göre her şey değişmeli; tek sabit öğrenci olmamalı.
- Rapor metni yapay zekâdan birebir alınamaz; bana kaynak ver, ben yazarım.

## 9. Sırada ne var (yapılacaklar)

**Proje teslimi için:**
- [ ] Kullanıcı testi: en az 5 öğrenci; aynı görevler eski OBS'de ve prototipte; süre, hata ve başarı ölçülecek. Görevler:
  - "SE 3007 vize notunu bul"
  - "Kaç saat devamsızlık hakkın kaldı?"
  - "Laboratuvar hangi gün?"
  - "Transkripti PDF al"
  - "Not değişseydi AGNO kaç olurdu?"
  - "Şifreni değiştir"
- [ ] SUS anketi (10 soru), eski ile yeni karşılaştırması.
- [ ] Kısa görüşmeler, personalar, kart sıralama (card sorting).
- [ ] İngilizce rapor (ACM tek sütun, 4–6 sayfa); kaynak: `docs/heuristic-evaluation.md` + `PROJE_OZETI.md`.
- [ ] 15 dk İngilizce sunum:
  1. Sorun (eski ekranlar, kişisel bilgiler bulanık)
  2. Kullanıcılar ve yöntem
  3. Canlı demo: giriş → kartlar → Ders İçeriği / Programda Gör → Final Hesaplayıcı → Senaryo → Devamsızlık → Mezuniyet Kredisi → şifre
  4. Erişilebilirlik ve karanlık mod
  5. Test sonuçları ve SUS
  6. Sınırlılıklar

**Prototipte olası iyileştirmeler:**
- [x] Eksik 11 AKTS'lik zorunlu dersler (yer tutucu SE 4007 + SE 4004).
- [ ] Hocası belirsiz seçmeliler: SE 3504, SE 4503, SE 4505, SE 4504, SE 4510.
- [ ] Bahar dönemi ders kaydı akışı (taslak, ekle/çıkar, çakışma, ön koşul) yok.
- [ ] `styles.css` içindeki eski lens/test stilleri ve `msku.ts` içindeki kullanılmayan sabit veriler temizlenebilir.
- [ ] Ad/soyad sözlüğü genişletilebilir.
- [ ] Git deposu (GitHub) kurulabilir; proje şu an Git deposu değil.
- [ ] `~/Desktop/trendyol` boş klasörü elle silinmeli (içinde sadece `.DS_Store` ve `.claude/launch.json` var).

## 10. Bilinen sınırlılıklar
- Gerçek sistem değil: backend, gerçek kimlik doğrulama ve gerçek veri yok. Şifreler tarayıcıda düz metin; gerçek şifre girilmemeli.
- Veriler tarayıcıya bağlı. Başka bir tarayıcıda sınıf yeniden üretilir, ama e-postaya bağlı olduğu için genelde aynı çıkar.
- Yönetmelik değerleri benim beyanım; resmî yönetmelikle karşılaştırılmalı.
- Profil üretimi rastgele ama tutarlı; gerçekte olmayacak kombinasyonlar çıkabilir.

---

**Yeni sohbette ilk iş:** `~/Desktop/msku-obs` klasöründe çalış, `PROJE_OZETI.md` ve bu belgeyi oku, `npm run dev` ile uygulamayı başlat. Sonra benden gelecek yeni isteklere geç.
