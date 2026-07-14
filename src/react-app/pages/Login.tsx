import { useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@/react-app/context/AuthContext";
import { useNavigate } from "react-router";

type Tab = "login" | "register";

export default function LoginPage() {
  const { fetchUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giriş başarısız");
        return;
      }
      await fetchUser();
      navigate("/");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (regPassword !== regPassword2) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayıt başarısız");
        return;
      }
      await fetchUser();
      navigate("/");
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sol panel — kurumsal gradient */}
      <div className="hidden lg:flex lg:w-1/2 hm-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Dekoratif daireler */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 inline-block">
            <img
              src="/hakanlogo.png"
              alt="Hakan Makina"
              className="h-24 w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Saha Günlüğü</h2>
          <p className="text-white/75 text-lg leading-relaxed max-w-sm">
            Satış ekibinin keşfettiği en iyi restoranları tek platformda görün
            ve paylaşın.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { val: "50+", lbl: "Restoran" },
              { val: "10+", lbl: "Şehir" },
              { val: "5★", lbl: "Ortalama" },
            ].map((s) => (
              <div key={s.lbl} className="bg-white/10 rounded-xl p-3">
                <p className="text-xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-white/70 mt-0.5">{s.lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobil logo */}
          <div className="lg:hidden text-center mb-8">
            <img
              src="/hakanlogo.png"
              alt="Hakan Makina"
              className="h-16 w-auto mx-auto mb-3"
            />
            <h1 className="text-xl font-bold text-foreground">Saha Günlüğü</h1>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-lg overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border">
              <button
                onClick={() => {
                  setTab("login");
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                  tab === "login"
                    ? "text-primary border-b-2 border-primary "
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </button>
              <button
                onClick={() => {
                  setTab("register");
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                  tab === "register"
                    ? "text-primary border-b-2 border-primary bg-primary/3"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Kayıt Ol
              </button>
            </div>

            <div className="p-7">
              {error && (
                <div className="mb-5 px-4 py-3 rounded-lg bg-destructive/8 border border-destructive/25 text-destructive text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="ornek@sirketiniz.com"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Şifre
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 hm-gradient text-white hover:opacity-90 border-0 rounded-lg font-semibold shadow-md mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Giriş yapılıyor...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Giriş Yap
                      </span>
                    )}
                  </Button>
                </form>
              )}

              {tab === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                      required
                      minLength={2}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      E-posta
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ornek@sirketiniz.com"
                      required
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Şifre
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="En az 6 karakter"
                        required
                        minLength={6}
                        className={`${inputCls} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Şifre Tekrar
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regPassword2}
                      onChange={(e) => setRegPassword2(e.target.value)}
                      placeholder="Şifrenizi tekrar girin"
                      required
                      className={`${inputCls} ${regPassword2 && regPassword !== regPassword2 ? "border-destructive focus:ring-destructive/40" : ""}`}
                    />
                    {regPassword2 && regPassword !== regPassword2 && (
                      <p className="text-xs text-destructive">
                        Şifreler eşleşmiyor
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 hm-gradient text-white hover:opacity-90 border-0 rounded-lg font-semibold shadow-md mt-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Kayıt olunuyor...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Kayıt Ol
                      </span>
                    )}
                  </Button>
                </form>
              )}

              <p className="text-center text-xs text-muted-foreground mt-6 pt-5 border-t border-border">
                Restoran ekleme yetkisi şirket personeline özeldir; herkes yorum
                yapıp puanlayabilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
