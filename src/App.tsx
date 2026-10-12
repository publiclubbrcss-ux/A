/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Article, Banner, PortalSettings, SiteStats } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { StatsTicker } from './components/StatsTicker';
import { Footer } from './components/Footer';
import { SEOHead } from './components/SEOHead';
import { HomeView } from './views/HomeView';
import { ArticleView } from './views/ArticleView';
import { AdminView } from './views/AdminView';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [settings, setSettings] = useState<PortalSettings | null>(null);

  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load portal data
  const loadPortalData = async () => {
    try {
      const [articlesData, bannersData, statsData, settingsData] = await Promise.all([
        api.getArticles(),
        api.getBanners(),
        api.getStats(),
        api.getSettings(),
      ]);

      setArticles(articlesData);
      setBanners(bannersData);
      setStats(statsData);
      setSettings(settingsData);

      // Check current URL path for clean article slug: e.g. /artigo/:slug
      const pathname = window.location.pathname;
      if (pathname.startsWith('/artigo/')) {
        const slug = pathname.replace('/artigo/', '').replace(/\/$/, '');
        const found = articlesData.find((a) => a.slug === slug);
        if (found) {
          setCurrentArticle(found);
        }
      }

      // Inject custom CSS if configured
      if (settingsData.customCss) {
        let styleEl = document.getElementById('custom-portal-css');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'custom-portal-css';
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = settingsData.customCss;
      }
    } catch (err) {
      console.error('Erro ao carregar dados do portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
    api.trackVisit();

    // Periodic ticker refresh every 18 seconds
    const interval = setInterval(async () => {
      try {
        const updatedStats = await api.getStats();
        setStats(updatedStats);
      } catch {
        // Silent background update
      }
    }, 18000);

    // Browser navigation back/forward support
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith('/artigo/')) {
        const slug = pathname.replace('/artigo/', '').replace(/\/$/, '');
        const found = articles.find((a) => a.slug === slug);
        if (found) {
          setCurrentArticle(found);
        }
      } else {
        setCurrentArticle(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Navigate to single article with clean URL
  const handleSelectArticle = (article: Article) => {
    setCurrentArticle(article);
    const cleanUrl = `/artigo/${article.slug}`;
    window.history.pushState({}, '', cleanUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to Home
  const handleNavigateHome = () => {
    setCurrentArticle(null);
    setSelectedCategory('Todas');
    setSearchQuery('');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select Category
  const handleSelectCategory = (cat: string) => {
    setCurrentArticle(null);
    setSelectedCategory(cat);
    setSearchQuery('');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search
  const handleSearch = (query: string) => {
    setCurrentArticle(null);
    setSelectedCategory('Todas');
    setSearchQuery(query);
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear filters
  const handleClearFilter = () => {
    setSelectedCategory('Todas');
    setSearchQuery('');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-950">
      <SEOHead article={currentArticle || undefined} />

      {/* Main Header */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onSearch={handleSearch}
        onNavigateHome={handleNavigateHome}
      />

      {/* 1. BARRA DE ESTATÍSTICAS EM TEMPO REAL (TICKER CONTÍNUO) */}
      <StatsTicker stats={stats} />

      {/* Main Views */}
      <div className="flex-1">
        {currentArticle ? (
          <ArticleView
            article={currentArticle}
            allArticles={articles}
            banners={banners}
            onBack={handleNavigateHome}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
          />
        ) : (
          <HomeView
            articles={articles}
            banners={banners}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectArticle={handleSelectArticle}
            onSelectCategory={handleSelectCategory}
            onClearFilter={handleClearFilter}
          />
        )}
      </div>

      {/* Footer with Exclusive "Área Administrativa" Button */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Closed Admin Panel Modal */}
      {isAdminOpen && (
        <AdminView
          onClose={() => setIsAdminOpen(false)}
          onRefreshPortal={loadPortalData}
        />
      )}
    </div>
  );
}
