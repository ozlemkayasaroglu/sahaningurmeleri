import { Sparkles, X } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

interface StaffOnlyModalProps {
  open: boolean;
  onClose: () => void;
}

export function StaffOnlyModal({ open, onClose }: StaffOnlyModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm bg-white border border-border rounded-2xl shadow-2xl p-6 text-center">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 mx-auto mb-4 rounded-full hm-gradient flex items-center justify-center shadow-md">
          <Sparkles className="text-white" size={24} />
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-2">
          Bu adım şimdilik ekibimizde 🙂
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Yeni restoran ekleme yetkisi şu an sadece Hakan İş Makinaları ekibinde.
          Ama merak etme, beğendiğin restoranlara yıldız verip yorum yapmaya devam edebilirsin!
        </p>

        <Button
          onClick={onClose}
          className="w-full h-10 hm-gradient text-white hover:opacity-90 border-0 rounded-lg font-medium"
        >
          Anladım
        </Button>
      </div>
    </div>
  );
}
