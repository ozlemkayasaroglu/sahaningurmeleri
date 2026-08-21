import { X } from "lucide-react";

interface KvkkModalProps {
  open: boolean;
  onClose: () => void;
}

export function KvkkModal({ open, onClose }: KvkkModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white border border-border rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-foreground">
            KVKK Aydınlatma Metni ve Açık Rıza Beyanı
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu
            ("KVKK") uyarınca, veri sorumlusu sıfatıyla{" "}
            <strong className="text-foreground">
              HP HAKAN MAKİNA İNŞAAT TAAHHÜT SAN. VE TİC. LTD. ŞTİ.
            </strong>{" "}
            ("Şirket") tarafından, "Sahanın Gurmeleri" uygulamasına ("Uygulama")
            üye olan kullanıcıların kişisel verilerinin işlenmesine ilişkin usul
            ve esaslar hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
          </p>

          <div>
            <h3 className="font-semibold text-foreground mb-1">Veri Sorumlusu</h3>
            <p>
              HP Hakan Makina İnşaat Taahhüt San. ve Tic. Ltd. Şti.
              <br />
              Serhat Mah. Alınteri Bulv. No:27/1-1, Yenimahalle/Ankara
              <br />
              E-posta: info@hakanismakinalari.com
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">İşlenen Kişisel Veriler</h3>
            <p>
              Ad-soyad, e-posta adresi, şifre (şifrelenmiş/hash'lenmiş olarak),
              profil fotoğrafı, uygulama içinde paylaştığınız yorum, puan ve
              fotoğraf içerikleri ile bu içeriklere ilişkin tarih/saat kayıtları
              işlenmektedir.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Kişisel Verilerin İşlenme Amacı
            </h3>
            <p>
              Kişisel verileriniz; üyelik ve kimlik doğrulama işlemlerinin
              yürütülmesi, uygulama içi restoran/yorum/puanlama içeriklerinin
              paylaşılabilmesi, kullanıcılar arası etiketleme ve bildirim
              gönderilmesi, şifre sıfırlama gibi hesap güvenliği süreçlerinin
              yürütülmesi ve Şirket'in iç iletişim/saha ekibi organizasyon
              faaliyetlerinin yürütülmesi amaçlarıyla sınırlı olarak
              işlenmektedir.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Kişisel Verilerin Aktarılması
            </h3>
            <p>
              Kişisel verileriniz, Uygulama'nın barındırma (hosting), veri
              tabanı ve dosya depolama altyapısını sağlayan hizmet
              sağlayıcılarımıza (ör. Cloudflare) ve e-posta gönderim
              hizmetimize (ör. Resend), hizmetin sunulabilmesi için gerekli
              olduğu ölçüde ve yalnızca teknik altyapı sağlanması amacıyla
              aktarılmaktadır. Verileriniz, yasal zorunluluklar dışında üçüncü
              kişilerle paylaşılmaz veya satılmaz.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">Hukuki Sebep</h3>
            <p>
              Kişisel verileriniz, KVKK m.5/2 kapsamında bir sözleşmenin
              kurulması/ifasıyla doğrudan ilgili olması ve Şirket'in meşru
              menfaati hukuki sebeplerine dayanılarak; profil fotoğrafı gibi
              isteğe bağlı içerikler bakımından ise açık rızanıza dayanılarak
              işlenmektedir.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">
              KVKK m.11 Kapsamındaki Haklarınız
            </h3>
            <p>
              Kişisel verinizin işlenip işlenmediğini öğrenme, işlenmişse buna
              ilişkin bilgi talep etme, işlenme amacını ve amacına uygun
              kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında
              aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse
              düzeltilmesini isteme, KVKK m.7'deki şartlar oluştuğunda silinmesini/
              yok edilmesini isteme, yapılan işlemlerin ilgili üçüncü kişilere
              bildirilmesini isteme, münhasıran otomatik sistemlerle analiz
              edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz
              etme ve kanuna aykırı işlenme sebebiyle zararın giderilmesini
              talep etme haklarına sahipsiniz. Bu haklarınızı kullanmak için
              info@hakanismakinalari.com adresine yazılı olarak başvurabilirsiniz.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-1">Açık Rıza Beyanı</h3>
            <p>
              Yukarıdaki Aydınlatma Metni'ni okuduğumu, kişisel verilerimin
              yukarıda belirtilen amaçlarla ve kapsamda işlenmesine ve
              (varsa) profil fotoğrafım gibi isteğe bağlı içeriklerin
              işlenmesine açık rıza gösterdiğimi kabul ve beyan ederim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
