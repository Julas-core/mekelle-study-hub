import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: any;
  }
}

const AnalyticsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    // Lazy-inject GA script once after consent
    if (consent === 'accepted' && gaId && !(window as any).__gaLoaded) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(){(window as any).dataLayer.push(arguments);} (window as any).gtag = gtag as any;
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', gaId);
      (window as any).__gaLoaded = true;
    }

    // Track page views only if consent given and GA available
    if (consent === 'accepted' && (window as any).gtag && gaId) {
      (window as any).gtag('config', gaId, { page_path: location.pathname + location.search });
    } else {
      console.log(`Page view: ${location.pathname + location.search}`);
    }
  }, [location]);

  return <>{children}</>;
};

export default AnalyticsWrapper;