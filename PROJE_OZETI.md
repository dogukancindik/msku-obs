# MSKÜ OBS: Proje Özeti ve Devir Notları

**Ders:** SE4513 Human-Computer Interaction (İnsan-Bilgisayar Etkileşimi)
**Proje:** Muğla Sıtkı Koçman Üniversitesi Öğrenci Bilgi Sistemi'nin (OBS) HCI ilkelerine göre baştan tasarlanmış, çalışan bir prototipi
**Durum:** Çalışan, sunuma hazır bir frontend prototipi. Bu belge, projeye devam edecek ekip arkadaşı için yazıldı.

---

## İçindekiler

1. [Projenin amacı](#1-projenin-amacı)
2. [Dersin proje şartları](#2-dersin-proje-şartları)
3. [Süreç: Nasıl ilerledik?](#3-süreç-nasıl-ilerledik)
4. [Eski OBS'de tespit ettiğimiz sorunlar](#4-eski-obsde-tespit-ettiğimiz-sorunlar)
5. [Yeni tasarım: Sayfa sayfa ne yaptık?](#5-yeni-tasarım-sayfa-sayfa-ne-yaptık)
6. [Giriş, kullanıcılar ve kişiye özel veri](#6-giriş-kullanıcılar-ve-kişiye-özel-veri)
7. [Yönetmelik kuralları](#7-yönetmelik-kuralları)
8. [Uygulanan HCI ilkeleri (ders slaytlarıyla eşleşme)](#8-uygulanan-hci-ilkeleri-ders-slaytlarıyla-eşleşme)
9. [Teknik yapı](#9-teknik-yapı)
10. [Nasıl çalıştırılır?](#10-nasıl-çalıştırılır)
11. [Yapılacaklar (devam edecek kişi için)](#11-yapılacaklar-devam-edecek-kişi-için)
12. [Bilinen sınırlılıklar](#12-bilinen-sınırlılıklar)

---

## 1. Projenin amacı

Hocamız, var olan bir arayüzü HCI ilkelerine göre inceleyip yeniden tasarlamamızı istedi (örnek olarak başka bir grup Yemeksepeti'ni yapmıştı). Biz her gün kullandığımız ama kullanılabilirliği zayıf olan **MSKÜ OBS**'yi seçtik.

Hedeflerimiz:

- Mevcut OBS'nin ekranlarını inceleyip **kullanılabilirlik sorunlarını belgelemek**.
- Her sorunu dersin slaytlarındaki bir ilkeyle (Nielsen, Shneiderman, Norman, Dix, Gestalt, Hick yasası vb.) **gerekçelendirmek**.
- Sorunları çözen, **modern, sade ve gerçekten çalışan** bir prototip geliştirmek (Apple / Stripe / Linear estetiği).
- Sunumda canlı demo yapabilmek ve raporda "hangi ilkeyi neden uyguladık" sorusuna somut cevap vermek.

Neden OBS'yi seçtik:
- Bütün öğrenciler kullanıyor, test kullanıcısı bulmak kolay.
- Sorunlar gerçek ve somut (ekran görüntüleriyle belgelendi).
- Hoca sorunları hemen tanır.

---

## 2. Dersin proje şartları

Ders slaytlarından (Lec1, s.14–15) çıkardığımız şartlar:

| Şart | Detay |
|---|---|
| Not ağırlığı | Proje %50, final %50 |
| Grup | 2–4 kişi |
| Sunum | ~15 dakika (soru-cevap dahil), **İngilizce**, demo/görsel/araç içermeli |
| Rapor | 4–6 sayfa, **ACM Single Column** şablonu; hangi guideline'lar ve ilkeler uygulandı, artılar ve eksiler, UX tasarımı |
| Teslim | Sunumdan sonra en geç 2 gün içinde e-postayla; geç teslim günde %10 kesinti |
| Yapay zekâ | Kullanılabilir **ama metin birebir kopyalanamaz**, yoksa 0 puan. Raporu kendi cümlelerimizle yazmalıyız. |
| Beklenen yöntemler | Prototip, gerçek kullanıcılarla test, anket, uzman görüşmesi, storyboard |

---

## 3. Süreç: Nasıl ilerledik?

1. **Fikir aşaması:** Trendyol, MHRS, e-Devlet, bankacılık gibi alternatifleri karşılaştırdık. Trendyol derste zaten örnek olarak işlendiği için **OBS'de karar kıldık**.
2. **Slaytların analizi:** 7 ders slaytı (Lec1–Lec7) okundu; projede hangi kavramların kullanılacağı belirlendi (bkz. Bölüm 8).
3. **Mevcut OBS'nin incelenmesi:** Ana sayfa, Not Listesi, Ders Kayıt, Ders Programı, Sınav Takvimi, Mezuniyet İlerleme, Müfredat, Dönem Ortalamaları, Transkript, Transkript Senaryosu, Devamsızlık ve Açılan Bölüm Dersleri ekranlarının görüntüleri alındı ve sorunlar listelendi (bkz. Bölüm 4).
4. **İlk prototip:** "HCI Lens" (her öğeyi açıklayan numaralı rozetler), personalar, KLM ve kullanılabilirlik testi modülleri içeren bir sürüm yapıldı.
5. **Yeniden tasarım:** Ayrıntılı bir gereksinim listesine göre proje **baştan yazıldı**:
   - giriş ekranı
   - 11 sayfalık sade menü
   - gerçek MSKÜ Yazılım Mühendisliği müfredatı
   - kurgusal öğrenci verisi
6. **Revizyon turları** (ekip geri bildirimiyle):
   - Sunum modu (HCI Lens, HCI Merkezi) uygulamadan **kaldırıldı**. İçeriği rapor için `docs/heuristic-evaluation.md` dosyasına aktarıldı.
   - Yazdırma/PDF düzeltildi (ders programı sayfaya sığmıyordu).
   - Karanlık/aydınlık mod eklendi.
   - Final hesaplayıcı eklendi.
   - Yönetmelik kuralları işlendi: kredi limitleri, %40/%60, geçme notu 40, mezuniyet şartları.
   - **Mezuniyet Kredisi Talebi** sayfası eklendi.
   - Şifre kuralı (`adsoyad123`), şifre değiştirme ve 5 hatalı denemede kilit eklendi.
   - Mesajlarda silme / geri alma / okunmadı işaretleme eklendi.
   - Türkçe karakterli ad-soyad algılama eklendi (`ali.kirgiz` → Ali Kırgız, `mertdemir` → Mert Demir).
   - **Her kullanıcıya kendine özgü öğrenci profili** üretildi: sınıf, numara, notlar, dersler, program, devamsızlık, mesajlar.
   - Üniversite logosu eklendi.

---

## 4. Eski OBS'de tespit ettiğimiz sorunlar

Tamamı (28 madde, ciddiyet derecesi ve ilkelerle birlikte) **`docs/heuristic-evaluation.md`** dosyasında. Özet:

| Ekran | Sorun | İlke |
|---|---|---|
| Sol menü | ~30 bağlantı; "Genel İşlemler" tek başına 15 öğe; ilgili sayfalar farklı gruplarda (Sınav Takvimi "Genel"de, Not Listesi "Ders ve Dönem"de) | Hick yasası, Miller 7±2, Gestalt yakınlık |
| Üst bar | "2026-2027 Güz" buton gibi görünüyor ama tıklanmıyor; megafon + "2" ne anlama geliyor belli değil; yüzen erişilebilirlik butonu tabloların üstüne biniyor | Sahte affordance, Nielsen #8 |
| Ana sayfa | 8 kutu tıklanamıyor; bölüm adı 3 kez, "Fakülte" 2 kez tekrar ediyor; "Ek Akademik Bilgiler: -1" gibi anlamsız veri | Sahte affordance, Nielsen #8, 1D (kelimeler) |
| Ana sayfa | Yeşil bant + uyarı üçgeni + "Bilgilendirme" çelişiyor | Renk ve anlam (Stroop), Lec4 |
| Not Listesi | Her derse ayrı tablo; tabloların çoğu "Kayıt Yok" / "--"; her derste kırmızı "Sonuçlandırılmadı" | Tutarlılık, renk anlamı, alışma (habituation) |
| Ders Kayıt | Anlamsız ikonlar / "Diğer Bilgiler"; onaylanmış kayıtta kırmızı "UYARI! En Fazla AKTS Aşıldı"; "Z/S", "Alış: Alttan", "Aç.Nedeni: Dnm." gibi kısaltmalar | Mystery meat navigation, renk anlamı |
| Ders Programı | Aynı ders her saat kutusunda tekrar ediyor (4 kez); boş 06:00 satırı | Gestalt süreklilik, görsel gürültü |
| Sınav Takvimi | Her derse ayrı tablo; 4 seçenek için aramalı açılır menü | Doğru arayüz öğesi seçimi |
| Mezuniyet İlerleme | "Mezuniyet kuralları eksik olduğundan hesaplanamıyor" hatası 3 kez gösteriliyor; açıklamasız kırmızı ✕ ve "(!)" işaretleri | Hata mesajları kullanıcıya yardım etmeli |
| Dönem Ortalamaları | İki gökkuşağı grafik (renk anlam taşımıyor); "Muaf" 4.00 olarak, aktif dönem 0.00 olarak çiziliyor | Renk kullanımı, veri dürüstlüğü |
| Transkript | Ayrı sekmede gri belge açılıyor ve **T.C. Kimlik No ekranda tam görünüyor** | Gizlilik, tutarlılık |
| Transkript Senaryosu | Çok yoğun iki sütunlu tablo; her satırda düzenleme ikonu; ayrı "hazırla" adımı | Anında geri bildirim (Dix) |
| Devamsızlık | Gri "Yoklama Girişi Yapılmamış" yazıları; %30 sınırı kafadan hesaplanmalı | Görev aktarımı (Dix), görsel hiyerarşi |
| Açılan Dersler | Arama/filtre yok; "T", "U/L", "Z" ✓ sütunları; aynı ders her şube için ayrı satır | Esneklik, tanıma > hatırlama |
| Hesap | Şifre değiştirme özelliği yok | Eksik işlev |

---

## 5. Yeni tasarım: Sayfa sayfa ne yaptık?

### Genel yapı
- **Sol menü:** 11 sayfa, 4 grup (Hick yasası). En altta İletişim & Hesap ve Çıkış.
  - **Genel:** Ana Sayfa
  - **Akademik & Ders İşlemleri:** Alınan Dersler & Ders Kayıt · Not Listesi · Transkript & Senaryo · Müfredat & Mezuniyet Durumu · Dönem Ortalamaları · Devamsızlık Durumu · Mezuniyet Kredisi Talebi
  - **Takvim & Katalog:** Ders Programı & Sınav Takvimi · Açılan Bölüm Dersleri
  - **İletişim & Hesap:** Mesajlar · Hesap & Kullanıcı İşlemleri · Çıkış Yap
- **Üst bar:** sayfa başlığı, çalışan dönem seçici, karanlık/aydınlık mod düğmesi, bildirim/mesaj zili, profil menüsü (oturum süresi ve "Uzat" düğmesi burada).
- **Oturum:** 30 dakikalık süre; bitmeden 2 dakika önce uyarı penceresi açılıyor.
- **Uzman kısayolu:** `⌘K` / `Ctrl+K` ile sayfa, ders ve işlem arama (komut paleti).
- **Mobil:** Telefonda alt gezinme çubuğu (Ana Sayfa, Dersler, Notlar, Program).
- **Tema:** MSKÜ laciverti (`#0F172A`, `#1E3A8A`), açık gri/beyaz yüzeyler (`#F8FAFC`), yumuşak kenarlıklar (`#E2E8F0`), Inter yazı tipi.
- **Logo:** `public/msku-logo.png`. Sol menüde, giriş ekranında, transkriptte ve tarayıcı sekmesinde görünüyor.

### Sayfalar

| Sayfa | Ne yapıyor? |
|---|---|
| **Giriş** | Kurumsal e-posta alanı `@posta.mu.edu.tr` uzantısını kendisi ekler; yazarken "Hoş geldin, Ali Kırgız" önizlemesi gösterir. Şifreyi göster/gizle, Caps Lock uyarısı, hatalı denemede kalan hak sayısı ve 30 saniyelik kilit var. Üçüncü parti (Google vb.) giriş yok. |
| **Ana Sayfa** | Dört **tıklanabilir** özet kartı (üzerine gelince yükselir ve ↗ çıkar): AGNO, Aktif Dönem, Mezuniyet İlerlemesi, Devamsızlık Özeti. Devamsızlık kartı, sınıra yakın ders varsa adını ve kalan saati gösterir. Altında sıradaki dersler, yaklaşan sınavlar (geri sayımlı), duyurular ve hoca mesajları. |
| **Alınan Dersler & Ders Kayıt** | "Kesinleştirildi" ve "Onaylandı" rozetleri, AKTS çubuğu (AGNO'ya göre üst sınır). Her derste yalnızca 2 etiketli buton: **Ders İçeriği** (yan çekmece: şube, T+U, AKTS, öğretim üyesi, derslik, ders amacı) ve **Programda Gör** (programda o dersi vurgular). |
| **Not Listesi** | Tek tablo: Vize, Ödev/Proje, Final ("Bekleniyor" rozeti), sınıf ortalaması, fark oku ve durum rozeti. **Final Hesaplayıcı:** finalden alınacak nota göre ortalama ve harf notunu canlı hesaplar, her harf için gereken en düşük final notunu gösterir. |
| **Transkript & Senaryo** | Sekme 1: uygulama içinde resmi transkript önizlemesi ve **PDF İndir / Yazdır** (T.C. numarası gösterilmez). Sekme 2: **What-if simülatörü**; harf notunu değiştir veya seçmeli ekle, yeni AGNO, dönem ortalaması ve fark (+ yeşil / − kırmızı) anında hesaplanır, **Sıfırla** düğmesi var. |
| **Müfredat & Mezuniyet** | İlerleme çubukları: Toplam AKTS, Zorunlu (166), Bölüm İçi Teknik Seçmeli (48), Bölüm Dışı Seçmeli (23), Disiplinlerarası Proje (3), Staj. Altında 1–8. yarıyıl sekmeleri ve durum filtresi (Tümü / Tamamlandı / Alınıyor / Alınmadı). |
| **Dönem Ortalamaları** | Sade tablo ve tek grafik (dönem ortalaması çubuk, AGNO çizgi, üzerine gelince ayrıntı). Aktif dönem 0.00 olarak çizilmez, "Devam" olarak işaretlenir. |
| **Devamsızlık Durumu** | Her ders için ilerleme çubuğu, `9 / 12 Saat (%75)` gösterimi, renk + ikon + metin rozetleri (Güvenli / Dikkat — Sınıra Yakın / Kritik Sınır). **Haftalık detay** penceresi hangi haftada kaç saat devamsızlık yapıldığını gösterir. |
| **Mezuniyet Kredisi Talebi** | Dönemlik AKTS sınırı tablosu, şartların kontrolü (4. sınıf, en az 156 AKTS, AGNO ≥ 2.00) ve 42 AKTS'ye kadar talep formu. Şart sağlanmıyorsa eksikler kırmızıyla ve en erken başvuru dönemiyle gösterilir. |
| **Ders Programı & Sınav Takvimi** | Ardışık saatler **tek blokta** (`08:30 – 12:15`). **Detaylı / Sade** görünüm geçişi ve **Programı Yazdır** (A4'e sığar). Sınav takviminde tip filtresi (Ara Sınav / Yarıyıl Sonu / Bütünleme), derslik, saat ve geri sayım rozeti. |
| **Açılan Bölüm Dersleri** | Arama kutusu, sınıf (1–4) ve tür (Zorunlu / Seçmeli) filtresi; öğrencinin aldığı dersler işaretli. |
| **Mesajlar** | Gelen Kutusu, Gönderilenler, Yeni Mesaj Yaz. **Sil** (geri alınabilir), **Okunmadı olarak işaretle**. Alıcı listesinde tüm öğretim üyeleri unvanlarıyla, 3 grupta: danışman, bu dönemin hocaları, diğerleri. |
| **Hesap & Kullanıcı İşlemleri** | Profil fotoğrafı yükleme (önizleme, kare kırpma), ayrı **Ad / Soyad** alanları, telefon. **Şifre yenileme:** mevcut / yeni / tekrar alanları, şifre gücü göstergesi ve kontrol listesi. Erişilebilirlik ayarları: yazı boyutu, yüksek kontrast, renk körü dostu renkler, animasyonları azaltma, koyu tema. |

---

## 6. Giriş, kullanıcılar ve kişiye özel veri

### Giriş kuralı (demo)
- **E-posta:** `ad.soyad@posta.mu.edu.tr` ya da sadece `ad.soyad` (uzantı otomatik eklenir). Birleşik yazım da olur: `mertdemir`.
- **Şifre:** ad + soyad, bitişik, küçük harf + `123`. Örnekler: `ali.kirgiz` → `alikirgiz123`, `mertdemir` → `mertdemir123`, `ahmetkoseoglu` → `ahmetkoseoglu123`.
- Büyük/küçük harf ve Türkçe karakter fark etmez (`AliKırgız123` de olur).
- Başka şifre kabul edilmez. 5 hatalı denemede giriş 30 saniye kilitlenir.
- Hesap sayfasından şifre değiştirilirse, o e-posta için **yalnızca yeni şifre** geçerli olur.

### İsim algılama
- E-posta Türkçe karakter içeremediği için bir ad/soyad sözlüğüyle düzeltilir: `kirgiz` → **Kırgız**, `koseoglu` → **Köseoğlu** ("-oğlu" eki tanınır), `dogukan` → **Doğukan**.
- Birleşik adlar ayrılır: `mertdemir` → **Mert Demir**, `alirizakirgiz` → **Ali Rıza Kırgız**.
- Sözlük: `src/data/names.ts`. Sözlükte olmayan adlar olduğu gibi kalır; öğrenci Hesap sayfasından düzeltebilir.

### Her kullanıcı farklı bir OBS görür
`src/lib/academic.ts`, giriş yapılan e-postaya göre **kalıcı** bir öğrenci profili üretir. Aynı e-posta her zaman aynı profili alır; sınıf bilgisi tarayıcıda saklanır.

| Üretilen | Nasıl |
|---|---|
| Sınıf | 2, 3 veya 4 (aktif dönem 2026-2027 Güz → 3., 5. veya 7. yarıyıl) |
| Öğrenci numarası | Hazırlık yılı + `0717` + 3 hane (ör. 4. sınıf → `22…`, 3. sınıf → `23…`) |
| Danışman | Bölüm hocalarından biri |
| Geçmiş notlar, AGNO, dönem ortalaması | Müfredattaki dersler; öğrenciye özgü başarı düzeyiyle |
| Bu dönemin dersleri | O yarıyılın zorunluları ve seçmeli havuzundan seçilenler |
| Haftalık program | Çakışmasız; sabah 08:30–12:15, öğleden sonra 13:30–17:15 blokları |
| Sınavlar, devamsızlık, mesajlar | Derslere göre üretilir; mesajlar kullanıcı başına ayrı saklanır |

Denenmiş örnek kullanıcılar:

| E-posta | Şifre | Sınıf | Numara | AGNO |
|---|---|---|---|---|
| `ali.kirgiz` | `alikirgiz123` | 4. sınıf | 220717122 | 3.60 | Başarılı; 180 AKTS, mezuniyet kredisine uygun |
| `mertdemir` | `mertdemir123` | 2. sınıf | 240717440 | 2.07 | Zorlanan; MATH 1856 (TT) ve TDB 1802 (FF) Bahar'da alttan alınacak |
| `ahmetkoseoglu` | `ahmetkoseoglu123` | 3. sınıf | 230717777 | 2.84 | Orta; SE 1002'yi alttan geçmiş, ÜSD 0412 (TT) bekliyor |
| `umut.gunes` | `umutgunes123` | 2. sınıf | — | 1.53 | Her durum: alttan ders (ISG 1801), SE 2007'de devamsızlık sınırı aşıldı, AKTS sınırı 30, ertelenen ders |
| `oguz.kurt` | `oguzkurt123` | 4. sınıf | — | 1.76 | Alttan MATH 2855 (devam muaf), ertelenen dersler |
| `zeynep.demir` | `zeynepdemir123` | 4. sınıf | — | 2.76 | Seçmeli dersi (SE 3509) alttan alıyor |

Profil türü (başarılı / orta / zorlanan) e-postadan belirlenir (`src/lib/academic.ts`, `TIER_SALT`). Başarısız ders bir sonraki aynı dönemde (Güz→Güz) öncelikli alınır; AKTS sınırı aşılırsa o yarıyılın son dersleri ertelenir; eski not transkriptte kalır ama AGNO'ya son not girer.

> Not: Profil üretim kodu değişirse aynı e-postanın notları da değişebilir. Sınıf bilgisi ise tarayıcıda saklandığı için değişmez.

---

## 7. Yönetmelik kuralları

Hepsi tek yerde: **`src/data/msku.ts` → `REG` nesnesi.** Değiştirmek için yalnızca orayı düzenleyin.

| Kural | Değer |
|---|---|
| Dönemlik AKTS sınırı | AGNO < 2.00 → 30 · 2.00–2.99 → 36 · ≥ 3.00 → 40 |
| Mezuniyet kredisi | 4. sınıf + en az 156 AKTS + AGNO ≥ 2.00 → 42 AKTS'ye kadar |
| Not ağırlığı | Yarıyıl içi %40 (vize + varsa ödev/proje) · Final %60 |
| Geçme | Ders ortalaması ≥ 40 **ve** final ≥ 40 |
| Harf aralıkları (ekipçe onaylandı) | AA ≥ 90 · BA ≥ 85 · BB ≥ 80 · CB ≥ 75 · CC ≥ 60 · DC ≥ 50 · DD ≥ 40 · altı FF |
| Mezuniyet | 166 zorunlu + 48 bölüm içi teknik seçmeli + 23 bölüm dışı seçmeli + 3 disiplinlerarası proje = **240 AKTS**, AGNO ≥ 2.00 |
| Devamsızlık sınırı | Haftalık ders saatinin 14 haftalık toplamının %30'u |

---

## 8. Uygulanan HCI ilkeleri (ders slaytlarıyla eşleşme)

| Ders | Kavram | Projede nerede? |
|---|---|---|
| Lec1 | Kötü tasarım tasarımcının hatasıdır; gizlilik | T.C. numarası gösterilmiyor; dürüst grafikler |
| Lec2 | Kullanılabilirlik, erişilebilirlik, kullanıcı çeşitliliği, 5 boyut | Erişilebilirlik ayarları, sade kelimeler, ⌘K uzman kısayolu |
| Lec3 | Hata türleri (slip, mistake), zorlayıcı işlevler (lock-out), görev sıklığı analizi | Caps Lock uyarısı, giriş kilidi, oturum uyarısı, form doğrulamaları, sık kullanılan işler üstte |
| Lec4 | Görsel hiyerarşi, renk, kontrast, sayıların hizalanması | Özet kartları, kırmızı yalnızca gerçek risk için, sağa hizalı sayılar |
| Lec5 | Gruplama, gezinme, affordance, mikro etkileşimler | 11 öğelik menü, tıklanabilir kartlar (↗), etiketli butonlar, geri al bildirimleri |
| Lec6 | Dix ilkeleri, Shneiderman'ın 8 altın kuralı, Norman, Nielsen | Geri alma (#6), kapanış (#4), hata önleme (#5), anında geri bildirim |
| Lec7 | Zihinsel modeller, Gestalt, dikkat, bellek, KLM/GOMS | Birleşik program blokları, tek not tablosu, final hesaplayıcı (bellek yükünü azaltır) |

Ayrıntılı eşleşme (28 karar) için: **`docs/heuristic-evaluation.md`**

---

## 9. Teknik yapı

- **React 18 + TypeScript + Vite**, ikonlar için `lucide-react`. Grafikler harici kütüphanesiz SVG.
- **Backend yok.** Tüm veriler sahte veri ve etkileşimli state ile çalışıyor. Ayarlar, profiller, mesajlar ve şifreler tarayıcının `localStorage` / `sessionStorage` alanında tutuluyor.

```
msku-obs/
├── PROJE_OZETI.md            ← bu belge
├── README.md                 kısa kurulum ve özellik listesi
├── docs/
│   └── heuristic-evaluation.md   eski OBS'nin 28 sorunu + çözüm + ilke (rapor kaynağı)
├── public/
│   └── msku-logo.png         üniversite logosu
├── index.html
├── package.json
└── src/
    ├── App.tsx               sayfa yönlendirme, giriş kontrolü
    ├── main.tsx
    ├── styles.css            tasarım değişkenleri (renk, tipografi, karanlık mod)
    ├── pages.css             sayfa stilleri, yazdırma (PDF) stilleri
    ├── data/
    │   ├── msku.ts           müfredat, REG yönetmelik kuralları, örnek veriler
    │   └── names.ts          Türkçe ad/soyad sözlüğü ve birleşik ad ayırma
    ├── lib/
    │   ├── academic.ts       kişiye özel öğrenci profili üreteci
    │   ├── store.tsx         oturum, şifre, profil, mesajlar, tema
    │   └── util.ts           tarih, ortalama, devamsızlık, şifre gücü yardımcıları
    ├── components/
    │   ├── Shell.tsx         sol menü, üst bar, profil menüsü, oturum uyarısı
    │   ├── Palette.tsx       ⌘K komut paleti
    │   ├── nav.ts            menü tanımı
    │   └── ui.tsx            Card, Button, Chip, Modal, Drawer, Tabs, Logo…
    └── pages/                Login, Dashboard, Courses, Grades, Transcript, Curriculum,
                              Averages, Attendance, GradCredit, Schedule, Offered,
                              Messages, Account
```

---

## 10. Nasıl çalıştırılır?

Bilgisayarda **Node.js 18 veya üstü** kurulu olmalı.

```bash
cd msku-obs
npm install        # ilk seferde (node_modules klasörü yoksa)
npm run dev        # http://localhost:5173
```

Sunum için derleme: `npm run build` → `dist/` klasörü oluşur.

**Zipleyip paylaşırken:** `node_modules` klasörü (~106 MB) zip'e konmasa da olur; karşı taraf `npm install` ile yeniden oluşturur. `dist` ve `.vite` de silinebilir, yeniden üretilir.

**Demo verisini sıfırlamak için:** Tarayıcıda geliştirici araçlarını açın → Application → Local Storage → `msku.` ile başlayan anahtarları silin.

---

## 11. Yapılacaklar (devam edecek kişi için)

### Proje (puanın %50'si) için mutlaka yapılması gerekenler
- [ ] **Kullanıcı testi:** En az 5 öğrenciyle aynı görevleri hem eski OBS'de hem prototipte yaptırın; süre, hata sayısı ve başarı ölçün. Örnek görevler:
  - "SE 3007 vize notunu bul"
  - "Bir dersten kaç saat devamsızlık hakkın kaldı?"
  - "Laboratuvarın hangi gün?"
  - "Transkripti PDF al"
  - "Bir dersin notu değişseydi AGNO kaç olurdu?"
  - "Şifreni değiştir"
- [ ] **SUS anketi:** Testten sonra 10 soruluk System Usability Scale; eski OBS ile prototipin puanlarını karşılaştırın.
- [ ] **Görüşme ve personalar:** 4–6 öğrenciyle kısa görüşme (1. sınıf, son sınıf, Erasmus, görme sorunu olan öğrenci).
- [ ] **Kart sıralama (card sorting):** Menü yapısını doğrulamak için 10+ öğrenciyle.
- [ ] **Rapor:** ACM Single Column şablonu, 4–6 sayfa, İngilizce. Kaynak olarak `docs/heuristic-evaluation.md` ve bu belgeyi kullanın; **metni kendi cümlelerinizle yazın**.
- [ ] **Sunum:** 15 dakika, İngilizce. Önerilen akış:
  1. Sorun (1 dk): eski OBS ekran görüntüleri, kişisel bilgiler bulanık
  2. Kullanıcılar ve yöntem (2 dk)
  3. Canlı demo (5–6 dk): giriş → ana sayfa kartları → Ders İçeriği / Programda Gör → Final Hesaplayıcı → Transkript Senaryosu → Devamsızlık → Mezuniyet Kredisi → şifre değiştirme
  4. Erişilebilirlik ve karanlık mod (1 dk)
  5. Test sonuçları ve SUS (3 dk)
  6. Sınırlılıklar, soru-cevap (2–3 dk)

### Prototipte iyileştirilebilecekler (isteğe bağlı)
- [x] Kredi matematiği düzeltildi: her yarıyıl 30 AKTS; 166 zorunlu + 48 teknik + 23 bölüm dışı + 3 disiplinlerarası = 240. Eksik 11 zorunlu AKTS için **yer tutucu** dersler eklendi: SE 4007 Secure Software Development (5, 7. yy) ve SE 4004 Professional Practice and Entrepreneurship in Software (6, 8. yy). Gerçek ders adları bulunursa değiştirilmeli. Bölüm dışı seçmeliler: ÜSD 0203 (5) + ÜSD 0412 Proje Geliştirme (3) 4. yy, ÜSD 0310 (5) 5. yy, ÜSD 0415 + ÜSD 0430 (5+5) 7. yy.
- [x] **SE 4003 Multidisciplinary Engineering Projects kaldırıldı**: ENG 3500 Interdisciplinary Engineering Project ile aynı ders (bölümde kullanılan ad Interdisciplinary). Yerine 7. yy'a bölüm dışı seçmeli ÜSD 0430 İş Hayatında İletişim ve Sunum (5) geldi. Mezuniyet şartları (166/48/23/3) değişmesin diye daha önce doldurma amacıyla eklenen ÜSD 0521 kaldırılıp yerine yer tutucu zorunlu SE 4011 Software Process Improvement (5) kondu. Yer tutucu zorunlular: SE 4007, SE 4011, SE 4004 — gerçek ders adları bulunursa değiştirilmeli.
- [ ] Müfredatta öğretim üyesi belirtilmemiş seçmelilere (SE 3504, SE 4503, SE 4505, SE 4504, SE 4510) profil üretilirken rastgele bir bölüm hocası atanıyor; gerçek hocalar yazılabilir.
- [ ] Bahar dönemi ders kaydı (taslak, ders ekle/çıkar, çakışma kontrolü) henüz yok. Şu an güz dönemi onaylanmış kayıt gösteriliyor.
- [ ] Ad/soyad sözlüğü (`src/data/names.ts`) genişletilebilir.
- [ ] `src/styles.css` içinde artık kullanılmayan eski "HCI Lens" ve test modu stilleri temizlenebilir (çalışmayı etkilemiyor).
- [ ] Projeyi bir Git deposuna (GitHub) koymak, ekip çalışmasını kolaylaştırır.

---

## 12. Bilinen sınırlılıklar

- **Gerçek bir sistem değil:** Backend, gerçek kimlik doğrulama veya gerçek veri yok. Şifreler demo amaçlı ve tarayıcıda düz metin olarak saklanıyor; **gerçek şifre girilmemeli**.
- Veriler tarayıcıya bağlı. Başka bir bilgisayarda veya tarayıcıda aynı e-postayla girince sınıf bilgisi yeniden üretilir; e-postaya bağlı olduğu için çoğunlukla aynı çıkar.
- Harf aralıkları ve yönetmelik değerleri ekip beyanına dayanıyor; resmî yönetmelikle karşılaştırılmalı.
- Profil üretimi rastgele ama tutarlı. Gerçekte olmayacak kombinasyonlar çıkabilir (örneğin çok yüksek bir AGNO).

### Mantık tutarlılık testi
`src/lib/selfcheck.ts` geliştirici aracıdır (uygulama kullanmaz). Uygulama açıkken tarayıcı konsolunda:
`(await import('/src/lib/selfcheck.ts')).runSelfCheck(500)` → 500 e-posta × 2./3./4. sınıf = 1500 profili kurallara göre denetler (alttan ders yalnız aynı dönemde ve ilk uygun yarıyılda, 1. yarıyılda alttan ders yok, AKTS sınırı, kaybolan zorunlu ders yok, TT dersinde final yok, AGNO/AKTS toplamları, program çakışması). Profil üretimi değiştirildiğinde `failing: 0` olmalı. Harf kodları: FF = sınavdan başarısız, TT = devamsızlıktan kaldı, YT/YZ = staj yeterli/yetersiz.

### Ortak ders programı ve Bahar ders kaydı
- `src/data/timetable.ts`: **herkes için aynı** bölüm ders programı (şube, gün/saat, derslik). Aynı yarıyılın dersleri aynı şube grubunda çakışmaz; çakışma ancak farklı yarıyıldan (alttan/ertelenmiş) ders alınca çıkar. Öğrencinin programı, sınav saatleri, Açılan Dersler (Güz/Bahar) ve kayıt bu dosyayı kullanır. Tüm dersler katalogdaki tek bir hocaya bağlıdır (SE 3504, SE 4503, SE 4505, SE 4504, SE 4510 için hoca varsayılandır, gerçeğiyle değiştirilmeli).
- Aktif dönemde çakışan ders: devam zorunluysa alınmaz ("saat çakışması" ile ertelenir); devam zorunluluğu olmayan (FF) alttan ders kayıtlı olur ama programa yerleşmez, yalnızca sınavına girilir.
- `src/lib/registration.ts` + Ders Kayıt sayfasındaki **Bahar Ders Kaydı** sekmesi (2/4/6/8. yarıyıl): Bahar'da açılan alttan dersler önce ve kilitli (zorunlular), ertelenen dersler, yeni yarıyılın zorunluları, teknik seçmeli havuzu; AKTS sınırı, şube seçimi, çakışma, seçmeli sayısı kontrolü; Taslak → Danışmana gönder → Kayıt haftası. Taslak `msku.springReg` içinde kullanıcı başına saklanır.
- Tutarlılık testi (`runSelfCheck`) artık ders programı, şubeler, hocalar, sınavlar (hafta sonu/çakışma yok), mesajlar ve önerilen Bahar taslağını da denetler. Son çalıştırma: 1800 profil, 0 hata. 30 rastgele kullanıcı × 16 sayfa tarama testi: 0 çökme / "undefined" / "NaN".

### Dil desteği (Türkçe / English / Deutsch / العربية)
- Giriş ekranının sağ üstünde ve uygulamada üst barda (🌐) dil seçici; Hesap → Görünüm'de de var. Seçim `msku.settings.lang` içinde saklanır.
- Arayüz metinleri Türkçe yazılır ve `t('…')` ile sarılır (`src/lib/i18n.ts`); çeviriler `src/i18n/dict.ts` içinde `Türkçe → [EN, DE, AR]`. Değişkenler: `t('{n} ders', { n })`. **Yeni metin eklerken sözlüğe de eklenmeli.**
- Tarih/gün adları seçili dile göre biçimlenir; Arapçada sayfa sağdan sola döner (CSS mantıksal özellikler + `[dir='rtl']` kuralları).
- Bilerek çevrilmeyenler: kişi ve hoca adları, ders adları (Bölüm dışı seçmelilerin Türkçe adları dahil), hocaların mesaj içerikleri.
- Eksik çeviri kontrolü: başka bir dil seçiliyken `window.__i18nMissing` sözlükte bulunmayan metinleri listeler.

### Bahar kaydında şube seçimi
- Öğrencinin seçtiği şube sabitlenir (`Draft.pinned`); sistem onu kendiliğinden değiştirmez. Şube listesinde her seçeneğin hangi dersle çakıştığı yazar; haftalık takvim önizlemesi seçime göre güncellenir, çakışan bloklar yan yana ve taralı gösterilir. Çakışma uyarıları çözüm önerir ("SE 1004 için Şube 1 çakışmasız").

### Son kontrol (16 Kasım 2026)
- Giriş: boş alan / yanlış uzantı hataları, kalan deneme sayısı, 5 hatada 30 sn kilit, büyük/küçük harf duyarsız şifre, e-Devlet bağlantısı (giris.turkiye.gov.tr) — çalışıyor.
- Tutarlılık: AGNO (Ana Sayfa = Dönem Ortalamaları = Transkript), tamamlanan AKTS (Ana Sayfa = Müfredat = Transkript = Ortalamalar), aktif dönem ders/AKTS, devamsızlık özeti, okunmamış mesaj rozeti — 12 kullanıcıda birebir aynı.
- 240 AKTS: plan her yarıyıl 30, kategoriler 166/48/23/3; teknik seçmeli havuzu 131 AKTS. Kural testi ve bağımsız hesap denetimi 0 hata.
- Dönem seçici: geçmiş dönemde Not Listesi (100 üzerinden ders ortalaması + harf + ağırlıklı puan + dönem/AGNO), Dersler, Devamsızlık (notlarla tutarlı; TT derste sınır aşılmış) gösterilir; Transkript seçilen döneme kayar.
- Hesap: fotoğraf yükleme/kaydetme, ad-telefon kaydı, şifre değiştirme (eski şifre geçersizleşir), yazı boyutu, yüksek kontrast, renk körü modu, animasyon azaltma, koyu tema — kalıcı.
- Dil: 4 dil × 5 kullanıcı × 16 sayfa = 320 yükleme, 0 hata; kodda 579 çeviri anahtarı, sözlükte eksik yok.
- Mobil (375 px): hiçbir sayfa yatay taşmıyor; tablolar kendi kutusunda kayar; dil düğmesi mobilde görünür.
