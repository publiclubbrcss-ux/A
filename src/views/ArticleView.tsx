import React, { useState, useEffect } from 'react';
import { Article, Banner } from '../types';
import { SocialShareBar } from '../components/SocialShareBar';
import { BannerSlot } from '../components/BannerSlot';
import { SEOHead } from '../components/SEOHead';
import { ArticleCard } from '../components/ArticleCard';
import {
  Calendar,
  Clock,
  Eye,
  User,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  allArticles: Article[];
  banners: Banner[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectCategory: (cat: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  allArticles,
  banners,
  onBack,
  onSelectArticle,
  onSelectCategory,
}) => {
  const [sharesCount, setSharesCount] = useState(article.shares || 0);

  useEffect(() => {
    setSharesCount(article.shares || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(article.publishedAt));

  // Smart Related articles algorithm:
  // 1. Matches common tags (+3 score)
  // 2. Matches same category (+2 score)
  // 3. Fallback to most viewed / recent published articles
  const relatedArticles = React.useMemo(() => {
    const published = allArticles.filter((a) => a.id !== article.id && a.status === 'published');
    const scored = published.map((item) => {
      let score = 0;
      if (item.category === article.category) score += 2;
      const commonTags = (item.tags || []).filter((t) => (article.tags || []).includes(t));
      score += commonTags.length * 3;
      return { item, score };
    });

    // Sort by score descending, then by views/date
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.item.views - a.item.views;
    });

    return scored.slice(0, 4).map((s) => s.item);
  }, [article, allArticles]);

  // Contextual in-article recommendation (first related article)
  const inlineRecommendation = relatedArticles[0];

  // Split markdown content into sections so we can insert the middle banner organically
  const paragraphs = article.content.split('\n\n');
  const midPoint = Math.floor(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, midPoint);
  const secondHalf = paragraphs.slice(midPoint);

  const renderMarkdownBlock = (text: string, keyPrefix: string) => {
    // Basic Markdown parser for paragraphs, headings, blockquotes, bullet points
    if (text.startsWith('## ')) {
      return (
        <h2 key={keyPrefix} className="font-serif font-black text-2xl md:text-3xl text-stone-950 mt-8 mb-4 tracking-tight">
          {text.replace('## ', '')}
        </h2>
      );
    }
    if (text.startsWith('### ')) {
      return (
        <h3 key={keyPrefix} className="font-serif font-bold text-xl md:text-2xl text-stone-900 mt-6 mb-3 tracking-tight">
          {text.replace('### ', '')}
        </h3>
      );
    }
    if (text.startsWith('> ')) {
      return (
        <blockquote
          key={keyPrefix}
          className="border-l-4 border-amber-600 bg-amber-50/60 p-4 md:p-6 my-6 rounded-r-xl italic font-serif text-stone-800 text-lg md:text-xl leading-relaxed"
        >
          {text.replace('> ', '')}
        </blockquote>
      );
    }
    if (text.startsWith('- ') || text.startsWith('1. ')) {
      const items = text.split('\n');
      return (
        <ul key={keyPrefix} className="list-disc pl-6 space-y-2 my-4 text-stone-700 leading-relaxed">
          {items.map((it, idx) => (
            <li key={idx} className="pl-1">
              {it.replace(/^[-*]|\d+\.\s*/, '')}
            </li>
          ))}
        </ul>
      );
    }
    if (text.startsWith('---')) {
      return <hr key={keyPrefix} className="my-8 border-stone-200" />;
    }

    return (
      <p key={keyPrefix} className="text-stone-800 font-serif text-lg md:text-xl leading-relaxed my-4 selection:bg-amber-100">
        {text}
      </p>
    );
  };

  return (
    <>
      <SEOHead article={article} />

      {/* Floating share bar on desktop */}
      <div className="fixed left-6 top-32 z-30">
        <SocialShareBar
          article={article}
          variant="floating"
          onShareIncrement={(newCount) => setSharesCount(newCount)}
        />
      </div>

      {/* Mobile fixed bottom share bar */}
      <SocialShareBar
        article={article}
        variant="mobile-bottom"
        onShareIncrement={(newCount) => setSharesCount(newCount)}
      />

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between mb-6 text-xs text-stone-500 font-mono">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 font-bold hover:-translate-x-1 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Portal</span>
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5">
            <span className="hover:text-stone-900 cursor-pointer" onClick={onBack}>
              Início
            </span>
            <span>/</span>
            <span
              className="text-amber-700 font-semibold cursor-pointer"
              onClick={() => onSelectCategory(article.category)}
            >
              {article.category}
            </span>
          </nav>
        </div>

        {/* Category & AI Indicator */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-stone-900 text-white">
            {article.category}
          </span>
          {article.isAiGenerated && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Cobertura por IA Verificada
            </span>
          )}
          <span className="text-stone-400 text-xs font-mono">• Fatos Reais Auditados</span>
        </div>

        {/* Article Headline */}
        <h1 className="font-serif font-black text-3xl md:text-5xl lg:text-5xl text-stone-950 leading-[1.15] tracking-tight mb-6">
          {article.title}
        </h1>

        {/* Lead Excerpt */}
        <p className="text-stone-600 font-sans text-lg md:text-xl leading-relaxed mb-6">
          {article.summary}
        </p>

        {/* Author Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-stone-200 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 rounded-full object-cover border border-stone-300"
            />
            <div>
              <span className="block font-bold text-stone-900 text-sm">{article.author.name}</span>
              <span className="text-stone-500">{article.author.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" /> {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" /> {article.readingTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-amber-600" /> {article.views} views
            </span>
          </div>
        </div>

        {/* Social Share Bar: Inline Top Block */}
        <SocialShareBar
          article={article}
          variant="inline-top"
          onShareIncrement={(newCount) => setSharesCount(newCount)}
        />

        {/* Top Banner Slot */}
        <BannerSlot slot="article_top" banners={banners} />

        {/* Featured Cover Image with Fallback and Caption */}
        <figure className="my-8 rounded-2xl overflow-hidden bg-stone-100 shadow-lg border border-stone-200">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="w-full aspect-[16/9] object-cover"
          />
          {article.coverImageCaption && (
            <figcaption className="p-3 text-xs text-stone-500 font-mono text-center bg-stone-50 border-t border-stone-100">
              {article.coverImageCaption}
            </figcaption>
          )}
        </figure>

        {/* Article Body First Half */}
        <div className="prose prose-stone prose-lg max-w-none">
          {firstHalf.map((paragraph, index) => renderMarkdownBlock(paragraph, `p1-${index}`))}
        </div>

        {/* Middle Banner Slot (Inserted organically) */}
        <BannerSlot slot="article_middle" banners={banners} className="my-10" />

        {/* Article Body Second Half */}
        <div className="prose prose-stone prose-lg max-w-none">
          {secondHalf.map((paragraph, index) => renderMarkdownBlock(paragraph, `p2-${index}`))}
        </div>

        {/* Rigid Rule: Mandatory Citation of Original Source with Backlink */}
        <div className="my-8 p-5 bg-stone-100/80 border-l-4 border-emerald-600 rounded-r-xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verificação e Citação de Fonte Original (Fatos Reais)</span>
          </div>
          <p className="text-stone-700 text-sm leading-relaxed">
            Esta reportagem foi construída a partir de dados e comunicados oficiais verificados.
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
            <span>Fonte Original:</span>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 underline"
            >
              <span>{article.sourceName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* FAQ Section (Google Rich Snippets / Schema.org FAQPage) */}
        {article.faq && article.faq.length > 0 && (
          <section className="my-10 bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-black text-xl text-stone-900">
                Perguntas Frequentes (FAQ Estruturado)
              </h3>
            </div>
            <div className="space-y-4">
              {article.faq.map((item, idx) => (
                <div key={idx} className="pb-3 border-b border-stone-100 last:border-0">
                  <h4 className="font-sans font-bold text-base text-stone-900 mb-1">
                    {item.question}
                  </h4>
                  <p className="text-stone-600 text-sm leading-relaxed font-serif">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contextual In-Article Recommendation (Leia Também) */}
        {inlineRecommendation && (
          <div className="my-8 p-5 bg-stone-900 text-white rounded-2xl border border-stone-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="px-2.5 py-1 rounded bg-amber-500 text-stone-950 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 mt-0.5">
                Leia Também
              </span>
              <div>
                <a
                  href={`/artigo/${inlineRecommendation.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectArticle(inlineRecommendation);
                  }}
                  className="font-serif font-bold text-sm md:text-base text-stone-100 hover:text-amber-400 transition-colors line-clamp-1"
                >
                  {inlineRecommendation.title}
                </a>
                <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">
                  {inlineRecommendation.category} • {inlineRecommendation.readingTimeMinutes} min de leitura
                </span>
              </div>
            </div>
            <a
              href={`/artigo/${inlineRecommendation.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectArticle(inlineRecommendation);
              }}
              className="shrink-0 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
            >
              <span>Acessar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Bottom Banner Slot */}
        <BannerSlot slot="article_bottom" banners={banners} />

        {/* Social Share Bar: Inline Bottom Block (Prominent Card) */}
        <SocialShareBar
          article={article}
          variant="inline-bottom"
          onShareIncrement={(newCount) => setSharesCount(newCount)}
        />

        {/* MÓDULO DE CONTEÚDO RELACIONADO & LINKS INTERNOS PARA SEO */}
        {relatedArticles.length > 0 && (
          <section
            aria-labelledby="related-articles-heading"
            className="mt-16 pt-10 border-t-2 border-stone-900"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>Conteúdo Relacionado & Recomendado</span>
                </div>
                <h3
                  id="related-articles-heading"
                  className="font-serif font-black text-2xl md:text-3xl text-stone-950 tracking-tight"
                >
                  Reportagens e Análises Relacionadas
                </h3>
                <p className="text-stone-500 text-xs mt-1">
                  Selecionadas com base em similaridade de palavras-chave, editoria ({article.category}) e relevância temática.
                </p>
              </div>

              <button
                onClick={() => onSelectCategory(article.category)}
                className="text-xs font-mono font-bold text-amber-700 hover:text-amber-900 underline whitespace-nowrap self-start sm:self-auto"
              >
                Ver tudo em {article.category} &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => (
                <div key={rel.id} className="h-full">
                  <a
                    href={`/artigo/${rel.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle(rel);
                    }}
                    className="block h-full text-inherit no-underline"
                  >
                    <ArticleCard
                      article={rel}
                      onClick={() => onSelectArticle(rel)}
                      variant="standard"
                    />
                  </a>
                </div>
              ))}
            </div>

            {/* Related tags for internal linking depth */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 p-4 bg-stone-100/70 rounded-xl border border-stone-200/80 flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-stone-500 mr-1">
                  Tópicos Relacionados:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => onSelectCategory(article.category)}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 text-stone-800 hover:text-amber-900 rounded-lg text-xs font-medium border border-stone-200 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}
      </article>
    </>
  );
};
