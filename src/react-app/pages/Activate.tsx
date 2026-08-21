import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { useAuth } from "@/react-app/context/AuthContext";

export default function ActivatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { fetchUser } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Geçersiz bağlantı.");
      return;
    }

    fetch("/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Aktivasyon başarısız");
        await fetchUser();
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Aktivasyon başarısız");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/hakanlogo.png" alt="Hakan Makina" className="h-16 w-auto mx-auto mb-3" />
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-lg p-7 text-center space-y-4">
          {status === "loading" && (
            <>
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Hesabın aktive ediliyor...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm text-foreground">
                Hesabın aktive edildi, giriş yapıldı. Artık uygulamayı kullanabilirsin.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="w-full h-11 hm-gradient text-white hover:opacity-90 border-0 rounded-lg font-semibold shadow-md"
              >
                Uygulamaya Git
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <p className="text-sm text-destructive">{error}</p>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full h-11 rounded-lg"
              >
                Giriş Ekranına Dön
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
