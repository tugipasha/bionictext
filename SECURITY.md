Güvenlik Politikası

Bu proje, kullanıcıların güvenliğini ve bütünlüğünü korumayı hedefler. Güvenlik açıklarını sorumlu ve koordineli biçimde ele almak için aşağıdaki süreç uygulanır.

1. Güvenlik Açığı Bildirme

Güvenlik açığı bulduğunuzda lütfen kamuya açık issue açmayın.

Aşağıdaki kanallardan biri üzerinden özel olarak iletin:

GitHub Security Advisory (Önerilen)

E-posta: security@example.com (Lütfen kendi adresinizle değiştirin.)

E-postanın şifrelenmesini isterseniz PGP anahtarımızı kullanabilirsiniz:

-----BEGIN PGP PUBLIC KEY BLOCK-----
(gerçek anahtarınızı buraya ekleyin)
-----END PGP PUBLIC KEY BLOCK-----

2. Rapor İçeriği (Önerilen Format)

Bildirim yaparken aşağıdaki bilgiler çözüm sürecini hızlandırır:

Açığın kısa özeti

Etkilenen dosyalar veya commit hash

Yeniden üretme adımları

Beklenen sonuç vs. gerçekleşen sonuç

Potansiyel etki (veri sızıntısı, XSS, RCE, vb.)

Varsa PoC (Proof of Concept)

Tercih ettiğiniz iletişim yöntemi

3. Kapsam (In-Scope)

Bu güvenlik politikası aşağıdaki bileşenleri kapsar:

index.html

style.css

Tüm statik dosyalar (assets klasörü dahil)

Projeyle doğrudan dağıtılan tüm frontend kodu

4. Hariç Tutulanlar (Out-of-Scope)

Aşağıdaki bileşenler kapsam dışıdır:

Tarayıcı, işletim sistemi, GitHub Pages veya üçüncü taraf servislerdeki açıklar

Kullanıcıların kendi ortamlarında oluştukları yerel konfigürasyon sorunları

Bu repo tarafından sağlanmayan dış bağımlılıklardaki açıklıklar

5. Önceliklendirme ve Ciddiyet Seviyeleri

Raporlar, etkilerine göre şu şekilde sınıflandırılır:

Critical: Kod yürütme, ciddi veri sızıntısı, kimlik doğrulama atlama

High: Yetkisiz erişim, önemli XSS/CSRF zincirleri

Medium: Bilgi sızıntısı, sınırlı etki

Low: UI, konfigürasyon veya düşük riskli sorunlar

6. Yanıt Süreci

Rapor alındığında alındı mesajı gönderilir.

Açık doğrulanır ve ciddiyeti belirlenir.

Gerekirse geçici çözüm duyurulur.

Düzeltme uygulanır ve commit/release notlarıyla duyurulur.

Rapor sahibi, isterse teşekkür bölümünde anılır.

7. Sorumlu Açıklama Süreci

Bu projede sorumlu güvenlik açıklaması politikası uygulanır.

Varsayılan koordineli açıklama süresi: 90 gün
(İstisnai durumlarda daha kısa veya uzun tutulabilir.)

Açık tamamen giderilmeden kamuya açıklama yapılmaz.

8. Ödüllendirme / Credit

Bu proje resmi bir bug bounty programına sahip değildir.
Ancak doğrulanmış bulgu sahipleri, isterlerse release notlarında veya SECURITY.md içinde teşekkür bölümüyle anılır.

9. Örnek Rapor Şablonu
Konu: [BIONICTEXT] Güvenlik Raporu – <kısa başlık>

Merhaba,

Aşağıdaki güvenlik açığını bildirmek istiyorum.

Özet:
<1-2 cümle açıklama>

Etkilenen dosyalar/sürüm:
<dosya yolu veya commit hash>

Yeniden üretme adımları:
1) ...
2) ...
3) ...

PoC:
<varsa örnek kod veya ekran görüntüsü>

Potansiyel etki:
<etki açıklaması>

İletişim:
<e-postanız>
<PGP anahtarınız (opsiyonel)>

Teşekkürler,
<İsminiz veya takma ad>

10. Değişiklikler

Bu politika gerektiğinde güncellenebilir.
En güncel sürüm her zaman bu dosyada tutulur.
