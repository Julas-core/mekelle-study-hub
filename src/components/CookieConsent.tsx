import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie-consent";

type Consent = "accepted" | "declined" | null;

export default function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    const saved = (localStorage.getItem(CONSENT_KEY) as Consent) || null;
    setConsent(saved);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
  };
  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setConsent("declined");
  };

  if (consent) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="container mx-auto px-4 pb-4">
        <div className="rounded-lg border bg-card shadow-md p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            We use cookies for essential site functionality and to analyze usage if you allow analytics. See our <a href="/privacy" className="text-primary underline">Privacy Policy</a>.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={decline}>Decline</Button>
            <Button onClick={accept}>Allow analytics</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
