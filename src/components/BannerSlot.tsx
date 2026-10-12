import React, { useEffect, useRef } from 'react';
import { Banner } from '../types';
import { api } from '../services/api';

interface BannerSlotProps {
  slot: 'header' | 'article_top' | 'article_middle' | 'article_bottom' | 'sidebar' | 'footer';
  banners: Banner[];
  className?: string;
}

export const BannerSlot: React.FC<BannerSlotProps> = ({ slot, banners, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeBanner = banners.find((b) => b.slot === slot && b.active);

  useEffect(() => {
    if (!activeBanner || !containerRef.current) return;

    // Track impression
    api.trackBannerImpression(activeBanner.id);

    const container = containerRef.current;
    // Set raw HTML
    container.innerHTML = activeBanner.htmlContent;

    // Execute any script tags dynamically by recreating them
    const scripts = container.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    // Handle clicks inside banner container
    const handleClick = () => {
      api.trackBannerClick(activeBanner.id);
    };
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [activeBanner]);

  if (!activeBanner) return null;

  return (
    <div className={`w-full my-4 overflow-hidden rounded-lg transition-all ${className}`}>
      <div className="flex items-center justify-between px-1 mb-1 text-[10px] text-stone-400 font-mono uppercase tracking-wider">
        <span>Publicidade</span>
        <span>Patrocinado</span>
      </div>
      <div ref={containerRef} className="w-full relative" />
    </div>
  );
};
