import React from 'react';
import { Article } from '../types';
import { Clock, Eye, Share2, Sparkles } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  variant?: 'hero' | 'standard' | 'compact' | 'featured';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, variant = 'standard' }) => {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(article.publishedAt));

  const categoryColors: Record<string, string> = {
    Tecnologia: 'bg-blue-100 text-blue-800 border-blue-200',
    Economia: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'IA & Futuro': 'bg-purple-100 text-purple-800 border-purple-200',
    Ciência: 'bg-amber-100 text-amber-800 border-amber-200',
    Negócios: 'bg-slate-100 text-slate-800 border-slate-200',
    Mundo: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const badgeColor = categoryColors[article.category] || 'bg-stone-100 text-stone-800 border-stone-200';

  // 1. HERO VARIANT (Grand opening lead headline)
  if (variant === 'hero') {
    return (
      <article
        onClick={onClick}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-stone-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 min-h-[460px] border border-stone-800"
      >
        <div className="lg:col-span-7 relative h-72 lg:h-auto overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent lg:hidden" />
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-stone-950 shadow-md">
              Destaque Principal
            </span>
            {article.isAiGenerated && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-950/80 text-amber-300 backdrop-blur-md flex items-center gap-1 border border-amber-500/30">
                <Sparkles className="w-3 h-3" /> IA Autônoma
              </span>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 p-6 md:p-10 flex flex-col justify-between bg-gradient-to-b from-stone-900 to-stone-950">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${badgeColor}`}>
                {article.category}
              </span>
              <span className="text-stone-400 text-xs font-mono">• {article.readingTimeMinutes} min de leitura</span>
            </div>

            <h1 className="font-serif font-black text-2xl md:text-3xl lg:text-4xl leading-tight text-white group-hover:text-amber-400 transition-colors mb-4">
              {article.title}
            </h1>

            <p className="text-stone-300 text-sm md:text-base leading-relaxed line-clamp-3 mb-6 font-sans">
              {article.summary}
            </p>
          </div>

          <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
            <div className="flex items-center gap-2.5">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover border border-stone-700"
              />
              <div>
                <span className="block font-medium text-stone-200">{article.author.name}</span>
                <span className="text-[11px] text-stone-500">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="flex items-center gap-1 text-stone-400">
                <Eye className="w-3.5 h-3.5" />
                {article.views}
              </span>
              <span className="flex items-center gap-1 text-stone-400">
                <Share2 className="w-3.5 h-3.5" />
                {article.shares}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. COMPACT VARIANT (For sidebar lists or trending)
  if (variant === 'compact') {
    return (
      <article
        onClick={onClick}
        className="group cursor-pointer flex items-start gap-3.5 py-3 border-b border-stone-200/80 last:border-0 hover:bg-stone-100/50 p-2 rounded-lg transition-colors"
      >
        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative bg-stone-200">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
              {article.category}
            </span>
            <span className="text-stone-400 text-[10px]">• {formattedDate}</span>
          </div>

          <h4 className="font-serif font-bold text-xs md:text-sm text-stone-900 group-hover:text-amber-800 transition-colors leading-snug line-clamp-2">
            {article.title}
          </h4>

          <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 font-mono">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {article.views}
            </span>
            <span className="flex items-center gap-0.5">
              <Share2 className="w-3 h-3" /> {article.shares}
            </span>
          </div>
        </div>
      </article>
    );
  }

  // 3. STANDARD GRID VARIANT
  return (
    <article
      onClick={onClick}
      className="group cursor-pointer flex flex-col bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-amber-300/80 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={article.coverImage}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border shadow-sm ${badgeColor}`}>
            {article.category}
          </span>
          {article.isAiGenerated && (
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-900/80 text-amber-300 backdrop-blur-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> IA
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-stone-400 text-xs font-mono mb-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readingTimeMinutes} min
            </span>
          </div>

          <h3 className="font-serif font-bold text-lg md:text-xl text-stone-950 group-hover:text-amber-700 transition-colors leading-snug mb-2.5">
            {article.title}
          </h3>

          <p className="text-stone-600 text-xs md:text-sm leading-relaxed line-clamp-3 mb-4 font-sans">
            {article.summary}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              loading="lazy"
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="font-medium text-stone-700 truncate max-w-[120px]">{article.author.name}</span>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-[11px] text-stone-400">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" /> {article.views}
            </span>
            <span className="flex items-center gap-0.5">
              <Share2 className="w-3 h-3" /> {article.shares}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
