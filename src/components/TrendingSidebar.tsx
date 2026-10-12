import React from 'react';
import { Article, Banner } from '../types';
import { BannerSlot } from './BannerSlot';
import { TrendingUp, Flame, Mail, CheckCircle2 } from 'lucide-react';

interface TrendingSidebarProps {
  articles: Article[];
  banners: Banner[];
  onSelectArticle: (article: Article) => void;
  onSelectTag?: (tag: string) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  articles,
  banners,
  onSelectArticle,
  onSelectTag,
}) => {
  const [subscribed, setSubscribed] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const sortedByViews = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags || []))).slice(0, 10);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <aside className="w-full space-y-8">
      {/* 1. Ranking dos Mais Lidos */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-stone-200">
          <TrendingUp className="w-4 h-4 text-amber-600" />
          <h3 className="font-serif font-black text-base text-stone-900 tracking-tight">
            Mais Lidos da Semana
          </h3>
        </div>

        <div className="space-y-4">
          {sortedByViews.map((article, index) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article)}
              className="group cursor-pointer flex items-start gap-3 pb-3 border-b border-stone-100 last:border-0"
            >
              <span className="font-serif font-black text-2xl text-stone-300 group-hover:text-amber-600 transition-colors shrink-0 w-6">
                0{index + 1}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  {article.category}
                </span>
                <h4 className="font-serif font-bold text-xs md:text-sm text-stone-900 group-hover:text-amber-800 transition-colors leading-snug line-clamp-2 mt-0.5">
                  {article.title}
                </h4>
                <span className="text-[10px] text-stone-400 font-mono mt-1 block">
                  {article.views} leitores • {article.shares} envios
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Banner Slot Sidebar */}
      <BannerSlot slot="sidebar" banners={banners} />

      {/* 3. Conversão de Tráfego / Newsletter VIP */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white p-6 rounded-2xl shadow-md border border-stone-800">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono mb-3">
          <Flame className="w-3.5 h-3.5" />
          <span>Briefing Matinal VIP</span>
        </div>
        <h4 className="font-serif font-black text-lg text-white mb-2 leading-snug">
          Receba Análises Estratégicas e Fatos Críticos
        </h4>
        <p className="text-stone-300 text-xs leading-relaxed mb-4">
          Sem ruído ou algoritmos tendenciosos. Apenas sínteses factuais de alta relevância todos os dias às 7h.
        </p>

        {subscribed ? (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Inscrição confirmada! Você receberá nossa próxima edição.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail corporativo"
                className="w-full bg-stone-800/80 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Assinar Gratuitamente
            </button>
            <span className="block text-[10px] text-stone-500 text-center font-mono">
              Respeitamos sua privacidade. Cancele quando quiser.
            </span>
          </form>
        )}
      </div>

      {/* 4. Tópicos & Tags em Alta */}
      {allTags.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <h4 className="font-serif font-bold text-sm text-stone-900 mb-3 tracking-tight">
            Tópicos em Alta (SEO Tags)
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag && onSelectTag(tag)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-medium transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
