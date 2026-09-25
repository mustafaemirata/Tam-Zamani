# Tam Zamanı web sitesi

Tam Zamanı (Perfect Timing) oyununun tanıtım sitesi. Derleme adımı yok: düz HTML, CSS ve biraz JavaScript.

## Sayfalar

| Adres | İçerik |
| --- | --- |
| `/` | Türkçe tanıtım sayfası (tarayıcıda oynanabilen deneme turu dahil) |
| `/en` | İngilizce tanıtım sayfası |
| `/gizlilik` | Gizlilik Politikası ve KVKK Aydınlatma Metni |
| `/en/privacy` | Privacy Policy |
| `/destek` | Destek sayfası (App Store "Support URL") |
| `/en/support` | Support page |
| `/duello?kod=ABC123` | Arkadaş düellosu bağlantısı, uygulamayı açar |

## Yayınlama (GitHub + Vercel)

```bash
cd tamzamani-web
git init
git add .
git commit -m "Tam Zamanı web sitesi"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/tamzamani-web.git
git push -u origin main
```

Sonra vercel.com › Add New › Project › bu depoyu seç. Framework Preset: **Other**, Build Command ve Output Directory boş kalsın. Deploy.

## Görselleri değiştirmek

Ekran görüntüleri `assets/img/ekran-*.webp` dosyalarında (660 px genişlik). Yeni simülatör ekranlarını aynı adlarla koyman yeterli.
