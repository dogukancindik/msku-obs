# MSKÜ OBS (SE4513 Human-Computer Interaction prototipi)

Muğla Sıtkı Koçman Üniversitesi Öğrenci Bilgi Sistemi'nin (OBS) Yazılım Mühendisliği bölümü için HCI odaklı, uçtan uca yeniden tasarımı.
Proje yalnızca frontend'den oluşur: backend yoktur, tüm veriler sahte (mock) veri ve etkileşimli state ile çalışır.

> **Gizlilik:** Öğrenci profilleri tamamen kurgusaldır ve giriş yapılan e-postadan üretilir. Gerçek bir kişiye ait numara, T.C. kimlik no veya not kullanılmamıştır.
> Ders kodları, adları, AKTS değerleri ve öğretim üyeleri MSKÜ Yazılım Mühendisliği müfredatından alınmıştır.

## Çalıştırma

```bash
cd msku-obs
npm install
npm run dev        # http://localhost:5173
```

**Giriş:** `@posta.mu.edu.tr` uzantılı herhangi bir adres (ya da sadece kullanıcı adı, örneğin `ali.kirgiz`). Şifre: **ad + soyad bitişik + 123** (örn. `alikirgiz123`; büyük/küçük harf ve Türkçe karakter fark etmez). Başka şifre kabul edilmez; 5 hatalı denemede giriş 30 saniye kilitlenir.
- Ad ve soyad e-postadan türetilir; yaygın Türkçe adlar için karakterler otomatik düzeltilir: `ali.kirgiz` → **Ali Kırgız** (sözlük: `src/data/names.ts`). Ad ve Soyad, Hesap sayfasında ayrı alanlardan düzenlenebilir.
- Birleşik kullanıcı adları da ayrılır: `mertdemir` → **Mert Demir**, `ahmetkoseoglu` → **Ahmet Köseoğlu**.
- **Her e-posta kendi öğrenci profilini alır** (`src/lib/academic.ts`): sınıf (2–4), giriş yılı, öğrenci numarası (hazırlık yılı + `0717` + 3 hane, ör. 4. sınıf → `22…`), danışman, geçmiş dönem notları ve AGNO, bu dönemin dersleri, haftalık program, sınavlar, devamsızlık ve mesajlar. Hepsi gerçek müfredattan seçilir. Sınıf bilgisi tarayıcıda saklanır; aynı e-posta her zaman aynı profili görür.
- Hesap sayfasından şifre değiştirilirse, o e-posta için artık yalnızca yeni şifre geçerli olur (tarayıcıda saklanır, demo amaçlı). Gerçek OBS şifrenizi yazmayın.

## Ekip için: kurulum ve çalışma akışı

**Gerekenler:** [Node.js 18+](https://nodejs.org) ve Git.

```bash
git clone https://github.com/<depo-sahibi>/msku-obs.git
cd msku-obs
npm install
npm run dev        # http://localhost:5173
```

**Değişiklik yaparken (Pull Request akışı):**

```bash
git checkout main && git pull            # en güncel hali al
git checkout -b ozellik/kisa-aciklama     # yeni dal aç
# ... değişiklik yap, npm run dev ile dene ...
git add -A && git commit -m "Ne yaptığını anlatan kısa mesaj"
git push -u origin ozellik/kisa-aciklama
```

Sonra GitHub'da **Compare & pull request** ile PR aç; diğer kişi inceleyip **Merge** eder. `main` dalına doğrudan push yapmayın.

**Mantık testi:** Profil üretimini değiştirdiyseniz uygulama açıkken tarayıcı konsolunda
`(await import('/src/lib/selfcheck.ts')).runSelfCheck(300)` çalıştırın; `failing: 0` olmalı.

## Sayfalar

| Menü | Öne çıkan HCI iyileştirmesi |
|---|---|
| Ana Sayfa | Dört özet kartı tıklanabilir (hover'da yükselir, ↗ ikonu görünür). Bugünkü dersler, yaklaşan sınavlar ve hoca mesajları burada toplanır. |
| Alınan Dersler & Ders Kayıt | Kesinleştirme ve danışman onayı rozetleri, AKTS çubuğu. Her satırda yalnızca 2 etiketli buton var: **Ders İçeriği** (yan çekmece) ve **Programda Gör** (takvimde vurgular). |
| Mezuniyet Kredisi Talebi | Dönemlik AKTS sınırı (AGNO 2.00 altı: 30 · 2.00–2.99: 36 · 3.00 ve üstü: 40) ve şartları sağlayana (4. sınıf, 156 AKTS, AGNO ≥ 2.00) 42 AKTS'ye kadar talep formu. Şartlar sağlanmıyorsa eksikler gösterilir. |
| Not Listesi | Ders başına ayrı tablo yerine tek tablo, "Bekleniyor" rozeti, sınıf ortalamasıyla fark. **Final Hesaplayıcı:** yarıyıl içi %40 + final %60; finalden alınacak nota göre ortalama ve harf notu, her harf için gereken en düşük final notu (geçme notu ve final alt sınırı 40). |
| Transkript & Senaryo | Uygulama içinde resmi transkript önizlemesi ve **PDF İndir / Yazdır**. What-if simülatörü: yeni AGNO, YANO ve fark (+ yeşil / − kırmızı) canlı hesaplanır; **Sıfırla** düğmesi var. |
| Müfredat & Mezuniyet | Dört ilerleme çubuğu (AKTS, zorunlu, seçmeli, staj). 1–8. yarıyıl sekmeleri ve durum filtresi. |
| Dönem Ortalamaları | Sade tablo ve tek grafik: YANO çubuk, AGNO çizgi olarak; üzerine gelince ayrıntı (tooltip) gösterir. |
| Devamsızlık Durumu | İlerleme çubuğu ve Güvenli / Dikkat / Kritik rozetleri. **Haftalık detay** modalı. |
| Ders Programı & Sınav Takvimi | Ardışık saatler tek blokta birleşir. Detaylı/Sade geçişi ve **Programı Yazdır** butonu. Sınav tipi filtresi ve geri sayım rozeti. |
| Açılan Bölüm Dersleri | Arama kutusu, sınıf (1–4) ve tür filtresi. |
| Mesajlar | Gelen Kutusu, Gönderilenler, Yeni Mesaj Yaz. Mesaj silme (geri alınabilir) ve okunmadı olarak işaretleme. Alıcı listesinde tüm öğretim üyeleri unvanlarıyla gruplanmış olarak yer alır (danışman, bu dönemin hocaları, diğerleri). |
| Hesap & Kullanıcı İşlemleri | Profil fotoğrafı önizleme ve değiştirme, şifre gücü göstergeli şifre yenileme, erişilebilirlik ayarları. |

## Logo

Üniversite logosunu `public/msku-logo.png` olarak kaydedin. Logo sol menüde, giriş ekranında ve transkriptte görünür. Dosya yoksa yerine "MSKÜ" yazılı kutu gösterilir.

## Yönetmelik değerleri

Tüm kurallar `src/data/msku.ts` içindeki `REG` nesnesinde: AKTS sınırları, mezuniyet kredisi şartları, not ağırlıkları, geçme notu, harf aralıkları ve mezuniyet şartları (166 zorunlu + 48 teknik seçmeli + 23 bölüm dışı seçmeli + 3 disiplinlerarası proje = 240 AKTS). Harf aralıkları: AA ≥ 90 · BA ≥ 85 · BB ≥ 80 · CB ≥ 75 · CC ≥ 60 · DC ≥ 50 · DD ≥ 40 · altı FF (ekip tarafından onaylandı; çan eğrisi uygulanan derslerde farklı olabilir).

## Rapor kaynağı

`docs/heuristic-evaluation.md`: eski OBS ekran görüntülerinden çıkarılan 28 sorun, yeni çözümleri, uygulanan HCI ilkeleri ve ciddiyet dereceleri. Rapor metnini kendi cümlelerinizle yazın.

## Ekibin kendisinin yapması gerekenler

- [ ] Aynı görevleri gerçek OBS'de ve bu prototipte kronometreyle ölçün; 5 veya daha fazla katılımcıyla SUS anketi yapın.
- [ ] Personaları görüşmelere göre güncelleyin; menü yapısı için kart sıralama (card sorting) çalışması yapın.
- [ ] Raporu kendi cümlelerinizle yazın (ACM tek sütun şablonu).

## Teknik yapı

React 18 + TypeScript + Vite, ikonlar için lucide-react. Grafikler harici kütüphane olmadan SVG ile çizilmiştir.

```
src/data/msku.ts      müfredat, kurgusal öğrenci, notlar, program, sınavlar, mesajlar
src/lib/util.ts       AGNO/YANO, devamsızlık, şifre gücü, tarih yardımcıları
src/lib/store.tsx     oturum, isim/numara türetme, dönem, mesajlar, profil, tema
src/pages/            11 OBS sayfası + Login
```
