import React, { useState } from 'react';
import { Article } from '../types';
import { api } from '../services/api';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Linkedin,
  Facebook,
  Twitter,
  Pin,
  Flame,
  Globe,
} from 'lucide-react';

interface SocialShareProps {
  article: Article;
  variant: 'floating' | 'mobile-bottom' | 'inline-top' | 'inline-bottom';
  onShareIncrement?: (newCount: number) => void;
}

export const SocialShareBar: React.FC<SocialShareProps> = ({ article, variant, onShareIncrement }) => {
  const [copied, setCopied] = useState(false);
  const [currentShares, setCurrentShares] = useState(article.shares || 0);

  const articleUrl = typeof window !== 'undefined' ? `${window.location.origin}/artigo/${article.slug}` : `https://portalprisma.com/artigo/${article.slug}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(article.title);
  const encodedSummary = encodeURIComponent(article.summary || article.title);

  const handleShareClick = async (platformName: string, shareUrl?: string) => {
    try {
      const updatedShares = await api.incrementShare(article.id);
      setCurrentShares(updatedShares);
      if (onShareIncrement) onShareIncrement(updatedShares);
    } catch {
      setCurrentShares((prev) => prev + 1);
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=640,height=520');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      handleShareClick('copy');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = articleUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      borderHover: 'hover:border-emerald-500',
      textColor: 'text-emerald-600',
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      borderHover: 'hover:border-sky-400',
      textColor: 'text-sky-500',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      color: 'bg-stone-900 hover:bg-black text-white',
      borderHover: 'hover:border-stone-800',
      textColor: 'text-stone-900',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800 text-white',
      borderHover: 'hover:border-blue-600',
      textColor: 'text-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      borderHover: 'hover:border-blue-500',
      textColor: 'text-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Pinterest',
      icon: Pin,
      color: 'bg-rose-600 hover:bg-rose-700 text-white',
      borderHover: 'hover:border-rose-500',
      textColor: 'text-rose-600',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    },
    {
      name: 'Threads',
      icon: Globe,
      color: 'bg-neutral-900 hover:bg-black text-white',
      borderHover: 'hover:border-neutral-700',
      textColor: 'text-neutral-900',
      url: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Reddit',
      icon: Flame,
      color: 'bg-orange-600 hover:bg-orange-700 text-white',
      borderHover: 'hover:border-orange-500',
      textColor: 'text-orange-600',
      url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  // 1. DESKTOP FLOATING SIDEBAR
  if (variant === 'floating') {
    return (
      <aside
        aria-label="Compartilhar este artigo"
        className="hidden lg:flex flex-col items-center gap-2 sticky top-28 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-stone-200/80 z-20"
      >
        <div className="flex flex-col items-center pb-2 border-b border-stone-100 text-center">
          <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Shares</span>
          <span className="text-sm font-black text-stone-800 font-mono">{currentShares}</span>
        </div>

        <button
          onClick={handleCopyLink}
          title={copied ? 'Link copiado!' : 'Copiar Link'}
          className={`relative p-2.5 rounded-xl transition-all ${
            copied ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-stone-900 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
              Copiado!
            </span>
          )}
        </button>

        {platforms.slice(0, 6).map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.name}
              onClick={() => handleShareClick(p.name, p.url)}
              title={`Compartilhar no ${p.name}`}
              className={`p-2.5 rounded-xl transition-transform hover:scale-110 active:scale-95 ${p.color}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </aside>
    );
  }

  // 2. MOBILE FIXED BOTTOM DOCK
  if (variant === 'mobile-bottom') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 px-4 py-2.5 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-1.5 shrink-0 text-stone-200 text-xs font-mono">
          <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">{currentShares}</span>
          <span className="text-stone-500 text-[10px]">shares</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors ${
              copied ? 'bg-emerald-500 text-white' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          {platforms.slice(0, 5).map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.name}
                onClick={() => handleShareClick(p.name, p.url)}
                className={`p-2 rounded-lg shrink-0 ${p.color}`}
                title={p.name}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. INLINE TOP BLOCK
  if (variant === 'inline-top') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-stone-200 my-6 bg-stone-50/60 px-4 rounded-xl">
        <div className="flex items-center gap-2 text-stone-600 text-xs font-medium">
          <Share2 className="w-4 h-4 text-stone-500" />
          <span className="font-bold text-stone-900">{currentShares}</span>
          <span>compartilhamentos</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.name}
                onClick={() => handleShareClick(p.name, p.url)}
                title={`Compartilhar no ${p.name}`}
                className={`p-2 rounded-lg text-white transition-all transform hover:-translate-y-0.5 ${p.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 4. INLINE BOTTOM BLOCK (Prominent call to action)
  return (
    <div className="my-10 p-6 md:p-8 bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-2xl shadow-xl border border-stone-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-medium mb-3">
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartilhamento Viral & Redes</span>
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-white">Gostou desta reportagem investigativa?</h3>
          <p className="text-stone-300 text-sm mt-1 max-w-xl">
            Ajude a disseminar informações factuais verificadas e jornalismo de dados com sua rede profissional e amigos.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end bg-stone-800/50 p-4 rounded-xl border border-stone-700/50">
          <span className="text-xs uppercase text-stone-400 font-mono tracking-wider">Total de Envios</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black text-amber-400 font-mono">{currentShares}</span>
            <span className="text-stone-400 text-xs">disseminações</span>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <span className="block text-xs font-mono text-stone-400 uppercase tracking-wider mb-3">
          Selecione a plataforma de sua preferência:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <button
            onClick={handleCopyLink}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-stone-400" />}
            <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.name}
                onClick={() => handleShareClick(p.name, p.url)}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-transform hover:-translate-y-0.5 ${p.color}`}
              >
                <Icon className="w-4 h-4" />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
