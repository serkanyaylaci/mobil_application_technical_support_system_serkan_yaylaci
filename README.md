# Hafta 5 | Akıllı Arıza Talep Yönetimi Uygulaması

Bu proje, React Native ve Expo altyapısı kullanılarak **saf JavaScript** ile geliştirilmiş bir Teknik Destek ve Arıza Bildirim / Talep Yönetimi mobil uygulamasıdır.

Geçen haftaki temel form yapısı; gelişmiş olay işleyicileri (event handlers), form doğrulama (validation), dinamik dizi bazlı state yönetimi, detay modalı, onaylı silme ve özgün filtreleme/arama özellikleriyle zenginleştirilmiştir.

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

```bash
# Proje dizinine geçin
cd mobil_application_technical_support_system_serkan_yaylaci

# Bağımlılıkları yükleyin (gerekirse)
npm install

# Expo geliştirici sunucusunu başlatın
npx expo start
```

Uygulamayı:
- **Expo Go** mobil uygulamasıyla QR kodu taratarak,
- Android Emulator (`a` tuşu) veya iOS Simulator (`i` tuşu) ile,
- Web tarayıcısında (`w` tuşu) çalıştırabilirsiniz.

---

## 📱 Uygulanan Gereksinimler ve Kabul Ölçütleri

| Kod | Yapılan İş | Açıklama / Kabul Ölçütü |
| :--- | :--- | :--- |
| **G1** | **Talep Başlığı ve Açıklaması** | Başlık ve açıklama TextInput bileşenleri üzerinden alınır, yazılan değer iki yönlü state bağlantısıyla (`baslik`, `aciklama`) korunur. |
| **G2** | **Kategori Seçimi** | 5 adet kategori (`Bilgisayar`, `Yazıcı`, `İnternet`, `Yazılım`, `Donanım`) sunulur. Seçilen kategori vurgulanır ve yeni kayda aktarılır. |
| **G3** | **Geçersiz Kayıt Engelleme** | Boş veya yalnızca boşluk içeren başlık ve açıklamaların kaydı `.trim()` kontrolleriyle engellenir. Kullanıcıya uyarı verilir. |
| **G4** | **Listeye Ekleme ve Koruma** | Yeni talep `TLP-XXXX` şeklinde benzersiz ID ile `talepler` dizisinin başına eklenir; mevcut önceki kayıtlar korunur. |
| **G5** | **Kısa Dokunmada Detay** | Listedeki arıza kartına kısa dokunulduğunda (`onPress`) özel Detay Modalı açılır; başlık, açıklama, kategori, birim, acil ve durum bilgisi listelenir. |
| **G6** | **Uzun Basma ile Silme Onayı** | Karta uzun basıldığında (`onLongPress`, `delayLongPress={600}`) onay diyaloğu açılır. "Vazgeç" seçildiğinde silinmez, "Sil" seçildiğinde sadece seçilen kayıt silinir. |
| **G7** | **3 Seçenekli Durum Yönetimi** | Her talep için `Bekliyor`, `İşlemde`, `Tamamlandı` durumları seçilebilir. Durum kart üzerindeki hızlı butonlardan veya detay modalından değiştirildiğinde arayüz ve sayaçlar anında güncellenir. |
| **G8** | **Kullanıcı Geri Bildirimi** | Başarılı kayıt, doğrulama hatası, durum güncellemesi ve silme işlemlerinde anlaşılır diyalog / bildirimler sunulur. |

---

## 🌟 Özgün Özellik (D Bölümü): Anlık Durum Filtreleme, Canlı Arama ve İstatistik Sayaçları

Uygulamaya arıza taleplerini hızlı yönetebilmek amacıyla 3 aşamalı akıllı bir yönetim mekanizması kazandırılmıştır:
1. **Dinamik İstatistik Sayaçları:** Ekranın üst kısmında toplam, bekleyen, işlemde ve tamamlanan arıza sayısı her state değişiminde anlık olarak hesaplanır ve renkli kartlarla sunulur.
2. **Durum Filtreleme:** Tek dokunuşla `Tümü`, `Bekliyor`, `İşlemde`, `Tamamlandı` sekmelerine geçilerek yalnızca ilgili durumdaki kayıtlar listelenir.
3. **Canlı Arama Çubuğu:** Kullanıcı arama kutusuna yazdıkça, arıza başlığı, açıklaması, kullanıcı adı, kategori veya talep numarası içerisinde gerçek zamanlı filtreleme yapılır.

---

## 🧪 Test Tablosu (E Bölümü)

| Senaryo | Test Adımı | Beklenen Sonuç | Gerçek Sonuç | Durum |
| :--- | :--- | :--- | :--- | :---: |
| **T1. Başlık Boşken Kaydet** | Formda başlık alanını boş bırakıp "Talep Oluştur" butonuna basma | Kayıt yapılmaz, "Lütfen arıza başlığını giriniz" uyarısı çıkar | Doğrulama devreye girdi, form engellendi | **GEÇTİ** |
| **T2. Geçerli Talep Ekle** | Tüm zorunlu alanları doldurup kategori seçerek kaydetme | Yeni talep `TLP-XXXX` ID'siyle listenin en başına eklenir, öncekiler korunur | Kayıt başarıyla eklendi, liste sekmesine yönlendirdi | **GEÇTİ** |
| **T3. Uzun Bas → Vazgeç** | Listedeki arıza kartına basılı tutup çıkan diyalogda "Vazgeç"e basma | Silme işlemi iptal edilir, talep listede kalmaya devam eder | Talep silinmedi, liste aynen korundu | **GEÇTİ** |
| **T4. Durumu Değiştir** | Bir talebin durumunu "Bekliyor"dan "Tamamlandı"ya değiştirme | Kartın rozet rengi yeşile döner, tamamlanan sayacı 1 artar | Görünüm ve sayaç anında güncellendi | **GEÇTİ** |
| **T5. Özgün Özellik Testi** | Arama kutusuna "Yazıcı" yazıp "İşlemde" filtresini seçme | Yalnızca "İşlemde" durumundaki yazıcı arızaları filtrelenir | Çoklu kriter anında filtrelendi | **GEÇTİ** |

---

## 🤖 Yapay Zekâ Destekli Kodlama Raporu (C ve F Bölümleri)

### Prompt 1
- **Kullanılan Prompt:** *"React Native'de geçen haftaki tekil talep formunu bu hafta için bir talepler listesi state'ine dönüştür, karta kısa basınca detay açılan, uzun basınca silme onayı soran olay işleyicilerini JavaScript olarak yaz."*
- **Alınan Yanıt Özeti:** `talepler` dizisi için `useState`, kısa dokunma için `onPress`, uzun basma için `onLongPress` ve `Alert.alert` ile onaylı silme yapısı önerildi.
- **Kendi Yaptığım Değişiklik:** Mobil ile Web ortamları arasındaki farkı gözeterek web tarayıcısında `Alert.alert` butonlarının çalışmaması sorununa karşı `Platform.OS === 'web'` kontrolü ekleyip `window.confirm` uyumluluğu sağladım.

### Prompt 2
- **Kullanılan Prompt:** *"Arıza talepleri için Bekliyor, İşlemde ve Tamamlandı durumlarını anlık güncelleyen ve bu durumlara göre hem sayıları hesaplayan hem de filtreleyen özgün özelliği kodla."*
- **Alınan Yanıt Özeti:** `.filter()` metotları ile türetilmiş sayaçlar ve durum filtreleme butonları mantığı kuruldu.
- **Kendi Yaptığım Değişiklik:** Hem durum filtresini hem de metin arama girdisini tek bir birleşik filtreleme fonksiyonunda harmanlayarak kullanıcının aynı anda hem arama yapabilmesini hem de duruma göre filtreleyebilmesini sağladım.

---

## 📝 Kısa Öz Değerlendirme (H Bölümü)

1. **En çok zorlandığın olay hangisiydi, neden?**  
   Uzun basma (`onLongPress`) olayında yanlışlıkla kısa dokunma tetiklenmesini önlemek ve web ile mobilde silme onayı diyaloglarının platform farklılıklarını yönetmek en dikkat gerektiren kısımdı. `delayLongPress` parametresi ile kullanıcı deneyimini iyileştirdim.
2. **Yapay zekâ hangi noktada gerçekten yardımcı oldu?**  
   React Native `Modal` bileşeninin sayfa üzerinde konumlandırılması ve durum rozetlerinin renk eşleştirmelerini (stil yardımcısı) hızlıca kurma noktasında hız kazandırdı.
3. **Kendi verdiğin en önemli yazılım tasarım kararı neydi?**  
   Ekranın üstüne form ve liste arasında akıcı geçiş sağlayan bir sekme (Tab) yapısı eklemek ve form başarıyla gönderildiğinde kullanıcıyı doğrudan liste ekranına yönlendirmek oldu.
4. **Uygulamayı yeniden geliştirseydin hangi etkileşimi farklı yapardın?**  
   Kayıtların kalıcılığı için `AsyncStorage` veya yerel SQLite entegrasyonu ekleyerek uygulama kapatılıp açıldığında da taleplerin saklanmasını sağlardım.
