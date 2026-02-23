# Glitch Market Admin Panel

Bu proje, "Glitch Market" platformu için geliştirilmiş, tutarsız ve "bozuk" (glitch'li) ürün verilerini yöneten profesyonel bir admin paneli mülakat çalışmasıdır. Projenin temel odağı, kirli veriyi normalize etmek ve bu süreçleri şeffaf bir şekilde yöneticiye sunmaktır.

## �️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda ayağa kaldırmak için:

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

3. Tarayıcıda açın: `http://localhost:5173`

---

## 📂 Klasör Yapısı

```text
src/
├── api/            # Fake API katmanı (setTimeout & simüle DB)
├── components/     # UI Bileşenleri (Layout, Button vb.)
├── data/           # Mock JSON verisi (Ham/Bozuk veri kaynağı)
├── pages/          # Sayfa bileşenleri (Table, Detail, Edit)
├── types/          # TypeScript arayüz tanımları (RawProduct, Product)
├── utils/          # Normalizasyon ve yardımcı fonksiyonlar (Logic)
└── App.tsx         # Routing ve Query Provider yapılandırması
```

---

## 🧠 Mimari ve Veri Akışı (Data Flow)

Uygulama **"Unidirectional Data Flow"** (Tek Yönlü Veri Akışı) prensibiyle çalışır:
1. **Fetch:** `api/products.ts` üzerinden "ham" (Raw) veri çekilir.
2. **Handle:** `@tanstack/react-query` bu veriyi yönetir ve önbelleğe alır.
3. **Normalize:** Veri UI'a ulaşmadan hemen önce `normalizeProduct` katmanından geçer.
4. **Display:** UI, sadece temizlenmiş (Normalized) ve tip güvenliği sağlanmış veriyi gösterir.

---

## ⚠️ Glitch Handling (Hata Yönetimi) Stratejisi

Uygulama, verideki kusurları sadece düzeltmekle kalmaz, bunları "Glitch Score" adında bir metriğe dönüştürür.

### Nasıl Normalize Ediyoruz?
- **Fiyat (Price):** "12,90" gibi string formatları regex ile temizlenip sayıya çevrilir. Hatalıysa +30 puan eklenir.
- **Stok (Stock):** Negatif değerler mutlak sıfıra çekilir. Hatalıysa +20 puan eklenir.
- **Kategori (Category):** Dizi olarak gelen kategorilerin ilk elemanı seçilir, boşsa "Uncategorized" atanır. +15 puan eklenir.
- **Tarih (UpdatedAt):** Geçersiz tarihler `null` değerine çekilir veya fallback atanır. +20 puan eklenir.
- **İsim (Name):** Boş veya tanımsız isimler "Unknown Product" olarak normalize edilir. +20 puan eklenir.

### Edge-Case Yaklaşımı
Veri tipi tamamen beklenmedik bir formatta gelirse (örneğin fiyatın nesne gelmesi), uygulama çökmemesi için `try-catch` benzeri korumacı bir mantıkla varsayılan değerleri basar ve bu durumu `glitchReport` içinde admin'e raporlar.

---

## ✨ Bonus Özellikler

- **Gelişmiş Audit Log:** Her düzenleme (Edit) işleminde, hangi alanın eski değerden yeni değere geçtiği konsola detaylı bir JSON raporu olarak basılır.
- **Glitch Score Badges:** Hata skoruna göre (0-100) renk değiştiren (Yeşil, Turuncu, Kırmızı) görsel göstergeler.
- **Pagination & Sorting:** Client-side sayfalama ve 3 farklı kolonda (İsim, Fiyat, Skor) sıralama desteği.

---

## 🤖 AI Kullanımı ve Şeffaflık

Bu proje geliştirilirken **Antigravity AI (Gemini)** aracı yoğun bir şekilde kullanılmıştır. AI şu alanlarda destek vermiştir:
- **Normalizasyon Algoritması:** Karmaşık kirli veri senaryoları için esnek regex ve kontrol yapıları tasarlanırken beyin fırtunası yapılmıştır.
- **UI/UX Tasarımı:** Tailwind CSS ile modern, "glassmorphism" esintili ve kullanıcı dostu bir admin tema oluşturulmasında AI önerilerinden faydalanılmıştır.
- **Type Safety:** TypeScript interface yapılarının "Raw" ve "Normalized" olarak ayrıştırılmasında AI'nın sağladığı yapısal öneriler projenin sağlamlığını artırmıştır.

---
_Bu çalışma, Glitch Market Frontend Case gerekliliklerine göre özenle hazırlanmıştır._

