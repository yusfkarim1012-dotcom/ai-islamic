import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Download, Smartphone, Monitor, Share, MoreVertical, Check } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/hooks/useLanguage";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Header */}
      <header className="border-b-2 border-primary/30 bg-gradient-to-r from-primary/10 via-card to-primary/10 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="لۆگۆ" className="h-10 w-10 rounded-full shadow-lg ring-2 ring-primary/30" />
            <h1 className="font-amiri text-xl font-bold text-gradient-islamic">{t.appName}</h1>
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              {t.goBack}
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-6 w-fit">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl"></div>
            <img src={logo} alt="لۆگۆ" className="relative h-24 w-24 rounded-2xl shadow-2xl ring-4 ring-primary/20" />
          </div>
          <h2 className="mb-2 font-amiri text-3xl font-bold text-gradient-islamic">{t.installTitle}</h2>
          <p className="text-muted-foreground">{t.installSubtitle}</p>
        </div>

        {/* Already Installed */}
        {isInstalled && (
          <Card className="mb-6 border-green-500/30 bg-green-500/10 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-green-600">{t.alreadyInstalled}</h3>
            <p className="text-sm text-muted-foreground">{t.alreadyInstalledDesc}</p>
          </Card>
        )}

        {/* Install Button for supported browsers */}
        {deferredPrompt && !isInstalled && (
          <Card className="mb-6 border-primary/30 bg-primary/5 p-6 text-center">
            <Download className="mx-auto mb-3 h-10 w-10 text-primary" />
            <h3 className="mb-2 text-lg font-bold">{t.quickInstall}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{t.quickInstallDesc}</p>
            <Button onClick={handleInstallClick} className="gap-2">
              <Download className="h-4 w-4" />
              {t.download}
            </Button>
          </Card>
        )}

        {/* Android Instructions */}
        {!isInstalled && (
          <Card className="mb-6 border-primary/20 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold">{t.forAndroid}</h3>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">١</span>
                <div className="flex items-center gap-2">
                  <span>{t.step1Android}</span>
                  <MoreVertical className="h-5 w-5 text-primary" />
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">٢</span>
                <span>{t.step2Android}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">٣</span>
                <span>{t.step3Android}</span>
              </li>
            </ol>
          </Card>
        )}

        {/* iOS Instructions */}
        {!isInstalled && (
          <Card className="mb-6 border-primary/20 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold">{t.forIOS}</h3>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">١</span>
                <div className="flex items-center gap-2">
                  <span>{t.step1IOS}</span>
                  <Share className="h-5 w-5 text-primary" />
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">٢</span>
                <span>{t.step2IOS}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">٣</span>
                <span>{t.step3IOS}</span>
              </li>
            </ol>
          </Card>
        )}

        {/* Desktop Instructions */}
        {!isInstalled && (
          <Card className="mb-6 border-primary/20 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold">{t.forDesktop}</h3>
            </div>
            <ol className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">١</span>
                <span>{t.step1Desktop}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">٢</span>
                <span>{t.step2Desktop}</span>
              </li>
            </ol>
          </Card>
        )}

        {/* Features */}
        <Card className="border-primary/20 p-6">
          <h3 className="mb-4 text-center text-lg font-bold">{t.installBenefits}</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500" />
              <span>{t.benefit1}</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500" />
              <span>{t.benefit2}</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500" />
              <span>{t.benefit3}</span>
            </li>
            <li className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-500" />
              <span>{t.benefit4}</span>
            </li>
          </ul>
        </Card>

        {/* Back to App */}
        <div className="mt-8 text-center">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              {t.backToApp}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Install;