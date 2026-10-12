import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Purge any stale service worker caches on client
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
