import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: any;
  }
}

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || '', {
        page_path: location.pathname + location.search,
      });
    } else {
      // For development or if GA is not available, log to console
      console.log(`Page view: ${location.pathname + location.search}`);
    }
  }, [location]);
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    // For development or if GA is not available, log to console
    console.log(`Event: ${action}`, { category, label, value });
  }
};

export const trackDownload = (materialTitle: string, fileType: string) => {
  trackEvent('download', 'materials', materialTitle, 1);
};

export const trackSearch = (query: string) => {
  trackEvent('search', 'materials', query, 1);
};

export const trackUpload = (materialTitle: string) => {
  trackEvent('upload', 'materials', materialTitle, 1);
};