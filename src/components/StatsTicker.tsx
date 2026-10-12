import React, { useEffect, useState } from 'react';
import { SiteStats } from '../types';
import { Activity, Globe, Eye, Zap, Flame } from 'lucide-react';

interface StatsTickerProps {
  stats: SiteStats | null;
  onRefresh?: () => void;
}

export const StatsTicker: React.FC<StatsTickerProps> = ({ stats }) => {
  const [tickerItems, setTickerItems] = useState<string[]>([]);

  useEffect(() => {
    if (!stats) return;

    const countriesString = stats.topCountries
      .slice(0, 4)
      .map((c) => `${c.flag} ${c.country} (${c.percentage}%)`)
      .join('  •  ');

    const items = [
      `🟢 ONLINE AGORA: ${stats.onlineUsers} leitores ativos no portal`,
      `📈 LEITORES HOJE: ${stats.todayViews.toLocaleString('pt-BR')} visualizações acumuladas`,
      `🌎 TOP PAÍSES: ${countriesString}`,
      `⚡ ARTIGOS NO AR: ${stats.totalArticles} reportagens investigativas`,
      `🔥 TRENDING: Inteligência Artificial, Transição Verde e Mercados Globais`,
    ];
    setTickerItems(items);
  }, [stats]);

  return (
    <div className="relative w-full bg-stone-950 text-stone-300 text-xs font-mono border-b border-stone-800/80 overflow-hidden select-none py-2 z-30 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Fixed label badge on left */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 pr-3 border-r border-stone-800 mr-3 text-amber-400 font-bold tracking-wider text-[11px] uppercase">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Métricas em Tempo Real</span>
        </div>

        {/* Continuous Marquee Ticker */}
        <div className="relative flex-1 overflow-hidden group">
          <div className="flex w-max items-center gap-8 animate-[marquee_35s_linear_infinite] group-hover:[animation-play-state:paused]">
            {/* Render 2 sets for smooth seamless looping */}
            {[0, 1].map((copyIndex) => (
              <div key={copyIndex} className="flex items-center gap-8 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-stone-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <strong className="text-emerald-400 font-semibold">Online Agora:</strong>
                  <span>{stats ? stats.onlineUsers : '54'} leitores</span>
                </span>

                <span className="text-stone-700">•</span>

                <span className="inline-flex items-center gap-1.5 text-stone-300">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-stone-200">Hoje:</strong>
                  <span>{stats ? stats.todayViews.toLocaleString('pt-BR') : '4.890'} views</span>
                </span>

                <span className="text-stone-700">•</span>

                <span className="inline-flex items-center gap-1.5 text-stone-300">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <strong className="text-stone-200">Top Países:</strong>
                  <span>
                    {stats?.topCountries
                      ? stats.topCountries
                          .slice(0, 3)
                          .map((c) => `${c.flag} ${c.country} (${c.percentage}%)`)
                          .join(' | ')
                      : '🇧🇷 Brasil (68%) | 🇺🇸 EUA (14%) | 🇵🇹 Portugal (9%)'}
                  </span>
                </span>

                <span className="text-stone-700">•</span>

                <span className="inline-flex items-center gap-1.5 text-stone-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <strong className="text-stone-200">Artigos Publicados:</strong>
                  <span>{stats ? stats.totalArticles : '18'} reportagens</span>
                </span>

                <span className="text-stone-700">•</span>

                <span className="inline-flex items-center gap-1.5 text-stone-300">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <strong className="text-stone-200">Radar:</strong>
                  <span>SEO Orgânico Massivo & Automação Inteligente</span>
                </span>

                <span className="text-stone-700">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right status indicator */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-stone-800 ml-3 shrink-0 text-[11px] text-stone-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Feed Ao Vivo</span>
        </div>
      </div>
    </div>
  );
};
