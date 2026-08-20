import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useNavigate, useSearchParams } from "react-router";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Bağlantı geçersiz. Lütfen e-postadaki bağlantıyı tekrar kullanın.");
      return;
    }
    if (password !== password2) {
      setError("Şifreler eşleşmiyor");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Şifre sıfırlanamadı");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/hakanlogo.png" alt="Hakan Makina" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground">Şifre Sıfırlama</h1>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-lg p-7">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-foreground">
                Şifren başarıyla güncellendi. Artık yeni şifrenle giriş yapabilirsin.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-11 hm-gradient text-white hover:opacity-90 border-0 rounded-lg font-semibold shadow-md"
              >
                Giriş Yap
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-destructive/8 border border-destructive/25 text-destructive text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Yeni Şifre</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Yeni Şifre Tekrar</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  required
                  className={inputCls}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 hm-gradient text-white hover:opacity-90 border-0 rounded-lg font-semibold shadow-md mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </span>
                ) : (
                  "Şifreyi Güncelle"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
