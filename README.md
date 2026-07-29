# Göktürk İlik Sigorta — Web Sitesi

Gaziantep Şehitkamil'de faaliyet gösteren Göktürk İlik Sigorta acentesinin
statik tanıtım ve teklif toplama sitesi. Build adımı yoktur; saf HTML, CSS ve
JavaScript.

## Yerelde çalıştırma

```bash
npm start
```

Ardından http://localhost:3000 adresini açın. (Alternatif olarak `index.html`
dosyasını doğrudan tarayıcıda da açabilirsiniz; yalnızca Google Maps çerçevesi
`file://` protokolünde kısıtlanabilir.)

## Dosya yapısı

| Dosya | İçerik |
| --- | --- |
| `index.html` | Tek sayfa; hero, teklif formu, hizmetler, süreç, SSS, iletişim |
| `kvkk.html` | KVKK aydınlatma metni ve gizlilik politikası |
| `styles.css` | Tasarım sistemi, animasyonlar, responsive kurallar |
| `script.js` | Form doğrulama, WhatsApp yönlendirmesi, hareket motoru |
| `assets/` | Yayına giren optimize görseller (logo, favicon, OG görseli) |
| `assets/source/` | Yüksek çözünürlüklü orijinaller — siteye dahil değildir |
| `robots.txt`, `sitemap.xml` | Arama motoru yönergeleri |

## Teklif formu nasıl çalışır?

Form hiçbir sunucuya istek atmaz. Girilen bilgiler biçimlendirilmiş bir
WhatsApp mesajına dönüştürülür ve `wa.me` bağlantısı **kullanıcının tıklaması
sırasında** yeni sekmede açılır. Tarayıcı sekmeyi engellerse açılan modaldaki
buton yedek yol sunar.

Numarayı değiştirmek için `script.js` içindeki `CONFIG.whatsappPhone` alanını
güncelleyin (ülke kodu dahil, işaretsiz: `905075950731`).

## Görselleri yeniden üretme

`assets/logo.png`, `favicon.png`, `apple-touch-icon.png` ve `og-image.jpg`
dosyaları `assets/source/logo-master.png` üzerinden üretilmiştir. Logo
değişirse master dosyayı güncelleyip görselleri yeniden boyutlandırın
(hedefler: logo 880px genişlik, OG görseli 1200×630).

## Yayına almadan önce

- [ ] `index.html` ve `kvkk.html` içindeki `gokturkiliksigorta.com` alan adını doğrulayın (canonical, OG, JSON-LD, sitemap).
- [ ] Google Search Console'a `sitemap.xml` gönderin.
- [ ] KVKK metnini bir hukuk danışmanına gözden geçirtin.
- [ ] Anlaşmalı şirket logolarınız varsa `index.html` içindeki branş şeridini logolarla değiştirin (ilgili yorum satırı orada).
