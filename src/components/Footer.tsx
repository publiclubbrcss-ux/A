import React from 'react';
import { Lock, Shield, Rss, ArrowUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectCategory }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-12 mt-20 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top footer row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800/80">
          {/* Col 1: Editorial brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-serif font-black text-lg">
                P
              </div>
              <span className="font-serif font-black text-2xl text-white tracking-tight">PORTAL PRISMA</span>
            </div>
            <p className="text-stone-400 text-sm max-w-md leading-relaxed mb-4">
              Jornalismo investigativo independente de alta performance. Cobertura factual em tempo real sobre tecnologia,
              economia global, transição energética e inteligência artificial com verificação rigorosa de fontes.
            </p>
            <div className="flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                100% Fatos Verificados
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 font-mono">
                <Shield className="w-4 h-4 text-sky-400" />
                Auditoria Editorial
              </span>
            </div>
          </div>

          {/* Col 2: Editorias / Seções */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-4 font-bold">
              Seções Editoriais
            </h4>
            <ul className="space-y-2 text-sm">
              {['Tecnologia', 'Economia', 'IA & Futuro', 'Ciência', 'Negócios', 'Mundo'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat);
                      scrollToTop();
                    }}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Transparência & Feeds */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-4 font-bold">
              Indexação & SEO
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Rss className="w-3.5 h-3.5 text-amber-400" />
                  Sitemap XML Dinâmico
                </a>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Robots.txt Otimizado
                </a>
              </li>
              <li className="text-xs text-stone-500 pt-2">
                Schema.org: NewsArticle, FAQPage, BreadcrumbList e OpenGraph ativos.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with Exclusive Admin Button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Portal Prisma Comunicação Digital. Todos os direitos reservados.
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="hover:text-stone-300 flex items-center gap-1 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Voltar ao Topo
            </button>

            {/* Exclusive Admin Access Button */}
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-800 hover:border-amber-500/40 transition-all font-mono text-xs cursor-pointer shadow-sm"
              title="Acesso restrito ao editor do sistema"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Área Administrativa</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
