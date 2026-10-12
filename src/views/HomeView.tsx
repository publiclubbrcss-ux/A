import React from 'react';
import { Article, Banner } from '../types';
import { ArticleCard } from '../components/ArticleCard';
import { TrendingSidebar } from '../components/TrendingSidebar';
import { BannerSlot } from '../components/BannerSlot';
import { Flame, Sparkles, Filter } from 'lucide-react';

interface HomeViewProps {
  articles: Article[];
  banners: Banner[];
  selectedCategory: string;
  searchQuery: string;
  onSelectArticle: (article: Article) => void;
  onSelectCategory: (cat: string) => void;
  onClearFilter: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  banners,
  selectedCategory,
  searchQuery,
  onSelectArticle,
  onSelectCategory,
  onClearFilter,
}) => {
  const publishedArticles = articles.filter((a) => a.status === 'published');

  const heroArticle = publishedArticles[0];
  const secondaryArticles = publishedArticles.slice(1, 3);
  const remainingArticles = publishedArticles.slice(3);

  const isFiltering = selectedCategory !== 'Todas' || searchQuery.trim() !== '';

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* 1. Header Banner Slot */}
      <BannerSlot slot="header" banners={banners} />

      {/* Filter notice if search or category is active */}
      {isFiltering && (
        <div className="flex items-center justify-between p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl">
          <div className="flex items-center gap-2 text-xs md:text-sm text-amber-900">
            <Filter className="w-4 h-4 text-amber-700" />
            <span>
              Filtrando por:{' '}
              <strong>
                {searchQuery ? `Busca "${searchQuery}"` : `Categoria: ${selectedCategory}`}
              </strong>{' '}
              ({publishedArticles.length} resultados encontrados)
            </span>
          </div>
          <button
            onClick={onClearFilter}
            className="text-xs font-bold text-amber-900 hover:text-amber-700 underline"
          >
            Limpar Filtro
          </button>
        </div>
      )}

      {/* 2. Hero Section (when not actively searching) */}
      {!isFiltering && heroArticle && (
        <section aria-label="Notícia Principal">
          <ArticleCard article={heroArticle} onClick={() => onSelectArticle(heroArticle)} variant="hero" />
        </section>
      )}

      {/* 3. Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Editorial Articles Grid */}
        <section className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-600 rounded-sm"></span>
              <h2 className="font-serif font-black text-xl md:text-2xl text-stone-900 tracking-tight">
                {selectedCategory === 'Todas' ? 'Últimas Reportagens & Análises' : selectedCategory}
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-500">Atualizado a cada 15 min</span>
          </div>

          {publishedArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
              <p className="text-stone-500 text-sm">Nenhum artigo encontrado para o filtro selecionado.</p>
              <button
                onClick={onClearFilter}
                className="mt-3 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Ver Todas as Publicações
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(isFiltering ? publishedArticles : remainingArticles.length > 0 ? remainingArticles : publishedArticles.slice(1)).map(
                (article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={() => onSelectArticle(article)}
                    variant="standard"
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* Right Column: Trending Sidebar */}
        <aside className="lg:col-span-4">
          <TrendingSidebar
            articles={publishedArticles}
            banners={banners}
            onSelectArticle={onSelectArticle}
            onSelectTag={(tag) => onSelectCategory(tag)}
          />
        </aside>
      </div>

      {/* 4. Footer Banner Slot */}
      <BannerSlot slot="footer" banners={banners} />
    </main>
  );
};
