import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  Alert,
  StyleSheet,
  StatusBar,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Platformlar arası uyumlu bildirim yardımcısı (Mobil: Alert.alert, Web: window.alert / confirm)
const bildirimGoster = (baslik, mesaj, butonlar) => {
  if (Platform.OS === 'web') {
    if (butonlar && butonlar.length > 1) {
      const onaylandi = window.confirm(`${baslik}\n\n${mesaj}`);
      if (onaylandi) {
        const onayButonu = butonlar.find(
          (b) => b.style === 'destructive' || b.text === 'Sil' || b.text === 'Evet'
        );
        if (onayButonu && onayButonu.onPress) {
          onayButonu.onPress();
        }
      }
    } else {
      window.alert(`${baslik}\n\n${mesaj}`);
    }
  } else {
    Alert.alert(baslik, mesaj, butonlar);
  }
};

// Başlangıç için örnek talepler (Test kolaylığı için)
const ornekTalepler = [
  {
    id: 'TLP-1001',
    adSoyad: 'Ahmet Yılmaz',
    birim: 'Öğrenci İşleri',
    baslik: 'Yazıcı Kağıt Sıkıştırdı',
    aciklama: 'Bölüm koridorundaki ağ yazıcısı sürekli kağıt sıkışması hatası veriyor ve çıktı vermiyor.',
    kategori: 'Yazıcı',
    oncelik: 'Yüksek',
    acil: true,
    durum: 'İşlemde',
    tarih: '20.10.2026 09:30',
  },
  {
    id: 'TLP-1002',
    adSoyad: 'Ayşe Kaya',
    birim: 'Bilgisayar Mühendisliği',
    baslik: 'Laboratuvar Bilgisayarı Açılmıyor',
    aciklama: 'Lab-3 teki 12 numaralı bilgisayar güç tuşuna basılmasına rağmen hiçbir şekilde açılmıyor.',
    kategori: 'Bilgisayar',
    oncelik: 'Yüksek',
    acil: false,
    durum: 'Bekliyor',
    tarih: '20.10.2026 09:45',
  },
  {
    id: 'TLP-1003',
    adSoyad: 'Mehmet Demir',
    birim: 'Merkez Kütüphane',
    baslik: 'Wi-Fi Bağlantı Kesintisi',
    aciklama: 'Kütüphane 2. katında eduroam ağına bağlanırken IP adresi alınamıyor uyarısı çıkıyor.',
    kategori: 'İnternet',
    oncelik: 'Orta',
    acil: false,
    durum: 'Tamamlandı',
    tarih: '20.10.2026 08:15',
  },
];

// TEKNİK DESTEK VE ARIZA TALEP YÖNETİMİ BİLEŞENİ
function TeknikDestekEkrani() {
  // A. EKRAN SEKMESİ (Form ve Liste/Yönetim Görünümü Arasında Geçiş)
  const [aktifSekme, setAktifSekme] = useState('form'); // 'form' veya 'liste'

  // B. FORM STATE'LERİ (G1, G2)
  const [adSoyad, setAdSoyad] = useState('');
  const [birim, setBirim] = useState('');
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kategori, setKategori] = useState('');
  const [oncelik, setOncelik] = useState('Orta');
  const [acil, setAcil] = useState(false);

  // C. TALEP LİSTESİ STATE'İ (G4: Talepler dizide tutulur, öncekiler korunur)
  const [talepler, setTalepler] = useState(ornekTalepler);

  // D. DETAY MODAL STATE'İ (G5: Kısa dokunmada detay gösterme)
  const [seciliTalep, setSeciliTalep] = useState(null);
  const [detayModalGorunur, setDetayModalGorunur] = useState(false);

  // E. ÖZGÜN ÖZELLİK STATE'LERİ (D: Canlı arama ve duruma göre filtreleme)
  const [aramaMetni, setAramaMetni] = useState('');
  const [durumFiltresi, setDurumFiltresi] = useState('Tümü'); // 'Tümü', 'Bekliyor', 'İşlemde', 'Tamamlandı'

  // Sabit Seçenekler (G2, G7)
  const kategoriler = ['Bilgisayar', 'Yazıcı', 'İnternet', 'Yazılım', 'Donanım'];
  const oncelikler = ['Düşük', 'Orta', 'Yüksek'];
  const durumSecenekleri = ['Bekliyor', 'İşlemde', 'Tamamlandı'];

  // FORM TEMİZLEME
  const formuTemizle = () => {
    setAdSoyad('');
    setBirim('');
    setBaslik('');
    setAciklama('');
    setKategori('');
    setOncelik('Orta');
    setAcil(false);
  };

  // 1. TALEP OLUŞTURMA & DOĞRULAMA (G1, G2, G3, G4, G8)
  const talepOlustur = () => {
    // G3: Boş veya yalnızca boşluk içeren alanların kontrolü
    if (!adSoyad.trim() || !birim.trim() || !baslik.trim()) {
      bildirimGoster(
        'Eksik Bilgi',
        'Lütfen Ad Soyad, Birim ve Arıza Başlığı alanlarını doldurunuz.'
      );
      return;
    }

    if (!aciklama.trim() || aciklama.trim().length < 10) {
      bildirimGoster(
        'Geçersiz Açıklama',
        'Arıza açıklaması boş olamaz ve en az 10 karakter içermelidir.'
      );
      return;
    }

    // G2: Kategori seçimi kontrolü
    if (!kategori) {
      bildirimGoster(
        'Kategori Eksik',
        'Lütfen arıza için en az bir kategori seçiniz.'
      );
      return;
    }

    // G4: Benzersiz ID oluşturma ve yeni talebi hazırlama
    const yeniTalep = {
      id: 'TLP-' + Math.floor(1000 + Math.random() * 9000),
      adSoyad: adSoyad.trim(),
      birim: birim.trim(),
      baslik: baslik.trim(),
      aciklama: aciklama.trim(),
      kategori: kategori,
      oncelik: oncelik,
      acil: acil,
      durum: 'Bekliyor', // G7: Varsayılan başlangıç durumu
      tarih: new Date().toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // G4: Yeni kayıt listeye eklenir, öncekiler korunur
    setTalepler((prev) => [yeniTalep, ...prev]);

    // Formu temizle
    formuTemizle();

    // G8: Kullanıcı geri bildirimi
    bildirimGoster(
      'İşlem Başarılı',
      `"${yeniTalep.baslik}" talebiniz başarıyla oluşturuldu ve listeye eklendi.`
    );

    // Yeni kaydı hemen görebilmesi için liste sekmesine geçiş yap
    setAktifSekme('liste');
  };

  // 2. KISA DOKUNMA İLE DETAY GÖSTERME (G5)
  const talepDetayAc = (talep) => {
    setSeciliTalep(talep);
    setDetayModalGorunur(true);
  };

  // 3. UZUN BASMA İLE SİLME ONAYI (G6, G8)
  const talepSilOnayi = (talep) => {
    bildirimGoster(
      'Talebi Sil',
      `"${talep.baslik}" (${talep.id}) arıza kaydını silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz.`,
      [
        {
          text: 'Vazgeç',
          style: 'cancel',
          onPress: () => {
            // Vazgeçme silmez (G6 kabul ölçütü)
          },
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // Yalnızca seçilen kayıt silinir (G6)
            setTalepler((prev) => prev.filter((item) => item.id !== talep.id));
            if (seciliTalep && seciliTalep.id === talep.id) {
              setDetayModalGorunur(false);
              setSeciliTalep(null);
            }
            bildirimGoster('Silindi', 'Arıza talebi başarıyla silindi.');
          },
        },
      ]
    );
  };

  // 4. DURUM DEĞİŞTİRME (G7: Bekliyor / İşlemde / Tamamlandı, anında yansır)
  const durumGuncelle = (talepId, yeniDurum) => {
    setTalepler((prev) =>
      prev.map((item) =>
        item.id === talepId ? { ...item, durum: yeniDurum } : item
      )
    );

    // Eğer detay modalı açıksa onun da durumunu senkronize et
    if (seciliTalep && seciliTalep.id === talepId) {
      setSeciliTalep((prev) => ({ ...prev, durum: yeniDurum }));
    }

    bildirimGoster('Durum Güncellendi', `Talep durumu "${yeniDurum}" olarak ayarlandı.`);
  };

  // D. ÖZGÜN ÖZELLİKLER: İSTATİSTİKLER VE ANLIK FİLTRELEME
  const toplamSayi = talepler.length;
  const bekleyenSayisi = talepler.filter((t) => t.durum === 'Bekliyor').length;
  const islemdeSayisi = talepler.filter((t) => t.durum === 'İşlemde').length;
  const tamamlananSayisi = talepler.filter((t) => t.durum === 'Tamamlandı').length;

  // Arama metnine ve durum filtresine göre filtrelenen talepler
  const filtrelenmisTalepler = talepler.filter((item) => {
    const durumUyumu = durumFiltresi === 'Tümü' || item.durum === durumFiltresi;
    const aramaKucuk = aramaMetni.toLowerCase().trim();
    const aramaUyumu =
      !aramaKucuk ||
      item.baslik.toLowerCase().includes(aramaKucuk) ||
      item.aciklama.toLowerCase().includes(aramaKucuk) ||
      item.kategori.toLowerCase().includes(aramaKucuk) ||
      item.adSoyad.toLowerCase().includes(aramaKucuk) ||
      item.id.toLowerCase().includes(aramaKucuk);
    return durumUyumu && aramaUyumu;
  });

  // Durum rengi ve arka plan stili yardımcısı
  const getDurumStili = (durum) => {
    switch (durum) {
      case 'Bekliyor':
        return { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' };
      case 'İşlemde':
        return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' };
      case 'Tamamlandı':
        return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* ÜST BAŞLIK VE SEKME GEÇİŞİ */}
      <View style={styles.header}>
        <Text style={styles.title}>Teknik Destek Sistemi</Text>
        <Text style={styles.subtitle}>Akıllı Arıza Talep Yönetimi</Text>

        {/* SEKME SEÇİCİ (Form vs Liste) */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabButton, aktifSekme === 'form' && styles.activeTabButton]}
            onPress={() => setAktifSekme('form')}
          >
            <Text
              style={[styles.tabButtonText, aktifSekme === 'form' && styles.activeTabButtonText]}
            >
              📝 Yeni Talep
            </Text>
          </Pressable>

          <Pressable
            style={[styles.tabButton, aktifSekme === 'liste' && styles.activeTabButton]}
            onPress={() => setAktifSekme('liste')}
          >
            <Text
              style={[styles.tabButtonText, aktifSekme === 'liste' && styles.activeTabButtonText]}
            >
              📋 Talepler ({talepler.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ============================================================== */}
        {/* SEKME 1: YENİ TALEP OLUŞTURMA FORMU                            */}
        {/* ============================================================== */}
        {aktifSekme === 'form' && (
          <View>
            <Text style={styles.sectionTitle}>Talep Sahibi Bilgileri</Text>

            <Text style={styles.label}>Ad Soyad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınızı ve soyadınızı giriniz"
              placeholderTextColor="#94a3b8"
              value={adSoyad}
              onChangeText={setAdSoyad}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Birim / Bölüm *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Bilgi İşlem / Öğrenci İşleri"
              placeholderTextColor="#94a3b8"
              value={birim}
              onChangeText={setBirim}
            />

            <Text style={styles.sectionTitle}>Arıza Detayları</Text>

            {/* G1: Talep Başlığı */}
            <Text style={styles.label}>Arıza Başlığı *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Monitör sinyal yok hatası veriyor"
              placeholderTextColor="#94a3b8"
              value={baslik}
              onChangeText={setBaslik}
            />

            {/* G1: Talep Açıklaması */}
            <Text style={styles.label}>Arıza Açıklaması *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Yaşadığınız sorunu detaylıca açıklayınız (en az 10 karakter)"
              placeholderTextColor="#94a3b8"
              value={aciklama}
              onChangeText={setAciklama}
              multiline={true}
              textAlignVertical="top"
            />

            {/* G2: En az 3 arıza kategorisi seçilebilir */}
            <Text style={styles.label}>Arıza Kategorisi *</Text>
            <View style={styles.optionsContainer}>
              {kategoriler.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setKategori(item)}
                  style={[
                    styles.optionButton,
                    kategori === item && styles.selectedOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      kategori === item && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Öncelik Seviyesi */}
            <Text style={styles.label}>Öncelik Seviyesi</Text>
            <View style={styles.optionsContainer}>
              {oncelikler.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setOncelik(item)}
                  style={[
                    styles.optionButton,
                    oncelik === item && styles.selectedOption,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      oncelik === item && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Acil Müdahale Switch */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelArea}>
                <Text style={styles.switchText}>Acil Müdahale Talebi</Text>
                <Text style={styles.switchHint}>
                  Kritik arızalar için öncelikli inceleme isteyin.
                </Text>
              </View>
              <Switch
                value={acil}
                onValueChange={setAcil}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={acil ? '#2563eb' : '#f8fafc'}
              />
            </View>

            {/* BUTONLAR */}
            <Pressable style={styles.submitButton} onPress={talepOlustur}>
              <Text style={styles.submitButtonText}>Talep Oluştur</Text>
            </Pressable>

            <Pressable style={styles.clearButton} onPress={formuTemizle}>
              <Text style={styles.clearButtonText}>Formu Temizle</Text>
            </Pressable>

            {/* LİSTEYE GEÇİŞ BUTONU */}
            <Pressable
              style={styles.viewListShortcut}
              onPress={() => setAktifSekme('liste')}
            >
              <Text style={styles.viewListShortcutText}>
                Tüm Talepleri Görüntüle ({talepler.length}) →
              </Text>
            </Pressable>
          </View>
        )}

        {/* ============================================================== */}
        {/* SEKME 2: TALEP LİSTESİ VE AKILLI YÖNETİM PANELİ                */}
        {/* ============================================================== */}
        {aktifSekme === 'liste' && (
          <View>
            {/* ÖZGÜN ÖZELLİK: İSTATİSTİK SAYAÇLARI KARTI */}
            <Text style={styles.sectionTitle}>Talep Özeti ve Durumlar</Text>
            <View style={styles.statsContainer}>
              <View style={[styles.statBox, { borderColor: '#cbd5e1' }]}>
                <Text style={styles.statNumber}>{toplamSayi}</Text>
                <Text style={styles.statLabel}>Toplam</Text>
              </View>
              <View style={[styles.statBox, { borderColor: '#fcd34d', backgroundColor: '#fefce8' }]}>
                <Text style={[styles.statNumber, { color: '#b45309' }]}>{bekleyenSayisi}</Text>
                <Text style={[styles.statLabel, { color: '#b45309' }]}>Bekliyor</Text>
              </View>
              <View style={[styles.statBox, { borderColor: '#93c5fd', backgroundColor: '#eff6ff' }]}>
                <Text style={[styles.statNumber, { color: '#1d4ed8' }]}>{islemdeSayisi}</Text>
                <Text style={[styles.statLabel, { color: '#1d4ed8' }]}>İşlemde</Text>
              </View>
              <View style={[styles.statBox, { borderColor: '#86efac', backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.statNumber, { color: '#15803d' }]}>{tamamlananSayisi}</Text>
                <Text style={[styles.statLabel, { color: '#15803d' }]}>Bitti</Text>
              </View>
            </View>

            {/* ÖZGÜN ÖZELLİK: ANLIK ARAMA ÇUBUĞU */}
            <Text style={styles.label}>Taleplerde Ara</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Başlık, içerik veya talep no yazınız..."
              placeholderTextColor="#94a3b8"
              value={aramaMetni}
              onChangeText={setAramaMetni}
            />

            {/* ÖZGÜN ÖZELLİK: DURUMA GÖRE FİLTRELEME BUTONLARI */}
            <Text style={styles.label}>Duruma Göre Filtrele</Text>
            <View style={styles.filterRow}>
              {['Tümü', 'Bekliyor', 'İşlemde', 'Tamamlandı'].map((durumSecimi) => (
                <Pressable
                  key={durumSecimi}
                  onPress={() => setDurumFiltresi(durumSecimi)}
                  style={[
                    styles.filterChip,
                    durumFiltresi === durumSecimi && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      durumFiltresi === durumSecimi && styles.filterChipTextActive,
                    ]}
                  >
                    {durumSecimi}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* KULLANICI İPUCU */}
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                💡 <Text style={{ fontWeight: 'bold' }}>İpucu:</Text> Detayı görmek için karta <Text style={{ fontWeight: 'bold' }}>dokunun</Text>. Talebi silmek için karta <Text style={{ fontWeight: 'bold' }}>uzun basın</Text>.
              </Text>
            </View>

            {/* TALEP LİSTESİ */}
            <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
              Kayıtlı Arıza Talepleri ({filtrelenmisTalepler.length})
            </Text>

            {filtrelenmisTalepler.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={styles.emptyTitle}>Kayıt Bulunamadı</Text>
                <Text style={styles.emptySubtitle}>
                  {aramaMetni || durumFiltresi !== 'Tümü'
                    ? 'Filtre kriterlerinize uygun talep bulunamadı.'
                    : 'Henüz kayıtlı arıza talebi bulunmuyor.'}
                </Text>
              </View>
            ) : (
              filtrelenmisTalepler.map((item) => {
                const durumRenk = getDurumStili(item.durum);

                return (
                  /* G5 (Kısa Dokunma: Detay) & G6 (Uzun Basma: Silme Onayı) */
                  <Pressable
                    key={item.id}
                    onPress={() => talepDetayAc(item)}
                    onLongPress={() => talepSilOnayi(item)}
                    delayLongPress={600}
                    style={({ pressed }) => [
                      styles.ticketCard,
                      pressed && styles.ticketCardPressed,
                    ]}
                  >
                    {/* Üst Bilgi Satırı: ID, Kategori ve Acil Rozeti */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardBadges}>
                        <View style={styles.badgeCategory}>
                          <Text style={styles.badgeCategoryText}>📁 {item.kategori}</Text>
                        </View>
                        {item.acil && (
                          <View style={styles.badgeUrgent}>
                            <Text style={styles.badgeUrgentText}>🚨 ACİL</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.ticketId}>{item.id}</Text>
                    </View>

                    {/* Başlık ve Açıklama Önizlemesi */}
                    <Text style={styles.ticketTitle}>{item.baslik}</Text>
                    <Text style={styles.ticketDesc} numberOfLines={2}>
                      {item.aciklama}
                    </Text>

                    {/* Alt Bilgi Satırı: Kullanıcı, Tarih ve Durum Rozeti */}
                    <View style={styles.cardFooterRow}>
                      <View>
                        <Text style={styles.ticketUser}>👤 {item.adSoyad} ({item.birim})</Text>
                        <Text style={styles.ticketDate}>🕒 {item.tarih}</Text>
                      </View>

                      {/* G7: Durum Rozeti */}
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: durumRenk.bg, borderColor: durumRenk.border },
                        ]}
                      >
                        <Text style={[styles.statusBadgeText, { color: durumRenk.text }]}>
                          ● {item.durum}
                        </Text>
                      </View>
                    </View>

                    {/* Hızlı Durum Değiştirme Butonları (G7: Anında Değişim) */}
                    <View style={styles.quickStatusRow}>
                      <Text style={styles.quickStatusLabel}>Durumu Güncelle:</Text>
                      <View style={styles.quickStatusButtons}>
                        {durumSecenekleri.map((d) => (
                          <Pressable
                            key={d}
                            onPress={() => durumGuncelle(item.id, d)}
                            style={[
                              styles.quickStatusBtn,
                              item.durum === d && styles.quickStatusBtnActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.quickStatusBtnText,
                                item.durum === d && styles.quickStatusBtnTextActive,
                              ]}
                            >
                              {d}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        )}

        <Text style={styles.footer}>
          Üniversite Bilgi İşlem • Akıllı Arıza Talep Yönetimi (Lab-5)
        </Text>
      </ScrollView>

      {/* ============================================================== */}
      {/* G5: TALEP DETAY MODALI (Kısa Dokunmada Açılır)                 */}
      {/* ============================================================== */}
      <Modal
        visible={detayModalGorunur}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDetayModalGorunur(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {seciliTalep && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Başlığı ve Kapat İkonu */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Arıza Talebi Detayı</Text>
                    <Text style={styles.modalSubtitle}>{seciliTalep.id}</Text>
                  </View>
                  <Pressable
                    style={styles.modalCloseIcon}
                    onPress={() => setDetayModalGorunur(false)}
                  >
                    <Text style={styles.modalCloseIconText}>✕</Text>
                  </Pressable>
                </View>

                {/* Güncel Durum Rozeti */}
                <View style={styles.modalStatusContainer}>
                  <Text style={styles.modalFieldLabel}>Mevcut Durum:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getDurumStili(seciliTalep.durum).bg,
                        borderColor: getDurumStili(seciliTalep.durum).border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: getDurumStili(seciliTalep.durum).text },
                      ]}
                    >
                      ● {seciliTalep.durum}
                    </Text>
                  </View>
                </View>

                {/* Detay Alanları (G5) */}
                <View style={styles.detailItem}>
                  <Text style={styles.modalFieldLabel}>Arıza Başlığı:</Text>
                  <Text style={styles.modalFieldValueBold}>{seciliTalep.baslik}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.modalFieldLabel}>Arıza Açıklaması:</Text>
                  <Text style={styles.modalFieldValue}>{seciliTalep.aciklama}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalFieldLabel}>Kategori:</Text>
                    <Text style={styles.modalFieldValue}>{seciliTalep.kategori}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalFieldLabel}>Öncelik:</Text>
                    <Text style={styles.modalFieldValue}>{seciliTalep.oncelik}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalFieldLabel}>Acil Müdahale:</Text>
                    <Text
                      style={[
                        styles.modalFieldValueBold,
                        { color: seciliTalep.acil ? '#dc2626' : '#475569' },
                      ]}
                    >
                      {seciliTalep.acil ? '🚨 Evet' : 'Hayır'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalFieldLabel}>Tarih:</Text>
                    <Text style={styles.modalFieldValue}>{seciliTalep.tarih}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.modalFieldLabel}>Talep Sahibi / Birim:</Text>
                  <Text style={styles.modalFieldValue}>
                    {seciliTalep.adSoyad} — {seciliTalep.birim}
                  </Text>
                </View>

                {/* G7: DURUM DEĞİŞTİRME BUTONLARI */}
                <Text style={[styles.modalFieldLabel, { marginTop: 16 }]}>
                  Durumu Değiştir (G7):
                </Text>
                <View style={styles.modalStatusButtonsRow}>
                  {durumSecenekleri.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => durumGuncelle(seciliTalep.id, d)}
                      style={[
                        styles.modalStatusButton,
                        seciliTalep.durum === d && styles.modalStatusButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalStatusButtonText,
                          seciliTalep.durum === d && styles.modalStatusButtonTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* SİLME BUTONU (G6) */}
                <Pressable
                  style={styles.modalDeleteButton}
                  onPress={() => talepSilOnayi(seciliTalep)}
                >
                  <Text style={styles.modalDeleteButtonText}>🗑 Talebi Sil</Text>
                </Pressable>

                {/* KAPAT BUTONU */}
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setDetayModalGorunur(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Kapat</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// KÖK BİLEŞEN
export default function App() {
  return (
    <SafeAreaProvider>
      <TeknikDestekEkrani />
    </SafeAreaProvider>
  );
}

// STİLLER
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 4,
    marginTop: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabButtonText: {
    color: '#2563eb',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 14,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 90,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  optionButton: {
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  selectedOption: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  optionText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchLabelArea: {
    flex: 1,
    paddingRight: 10,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  switchHint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 10,
    marginTop: 22,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#ffffff',
    padding: 13,
    borderRadius: 10,
    marginTop: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  clearButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  viewListShortcut: {
    padding: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  viewListShortcutText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },

  // İSTATİSTİK SAYAÇLARI
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
  },

  // ARAMA VE FİLTRELEME
  searchInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 11,
    fontSize: 14,
    color: '#0f172a',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  tipBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#0369a1',
    lineHeight: 18,
  },

  // LİSTE KARTLARI
  ticketCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  ticketCardPressed: {
    backgroundColor: '#f8fafc',
    transform: [{ scale: 0.99 }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  badgeCategory: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCategoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  badgeUrgent: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeUrgentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  ticketDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  ticketUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  ticketDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickStatusRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quickStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 5,
  },
  quickStatusButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  quickStatusBtn: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickStatusBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  quickStatusBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  quickStatusBtnTextActive: {
    color: '#ffffff',
  },

  // BOŞ LİSTE GÖRÜNÜMÜ
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },

  // MODAL STİLLERİ
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  modalCloseIcon: {
    padding: 6,
  },
  modalCloseIconText: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  modalStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
  },
  detailItem: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
  },
  modalFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  modalFieldValue: {
    fontSize: 14,
    color: '#0f172a',
  },
  modalFieldValueBold: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalStatusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 14,
  },
  modalStatusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  modalStatusButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modalStatusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  modalStatusButtonTextActive: {
    color: '#ffffff',
  },
  modalDeleteButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  modalDeleteButtonText: {
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 25,
  },
});
