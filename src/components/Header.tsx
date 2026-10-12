import React, { useState } from 'react';
import { Search, Menu, X, Compass, TrendingUp, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (cat: string) => void;
  onSearch: (query: string) => void;
  onNavigateHome: () => void;
  onOpenAiGeneratorModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onSearch,
  onNavigateHome,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = ['Todas', 'Tecnologia', 'Economia', 'IA & Futuro', 'Ciência', 'Negócios', 'Mundo'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  // Formatted date: "Segunda-feira, 12 de Outubro de 2026"
  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const capitalizedDate = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-40 transition-shadow">
      {/* Top micro bar with Date & Editorial Badge */}
      <div className="bg-stone-100/80 border-b border-stone-200/70 text-[11px] text-stone-600 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono tracking-tight text-stone-500">{capitalizedDate}</span>
            <span className="hidden sm:inline text-stone-300">|</span>
            <span className="hidden sm:inline text-stone-600 font-medium">Edição Digital Independente • Volume IX</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Jornalismo Verificado & Fatos Reais
            </span>
          </div>
        </div>
      </div>

      {/* Main Branding Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
          aria-label="Menu de Navegação"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand / Logo */}
        <div
          onClick={onNavigateHome}
          className="cursor-pointer flex flex-col items-center md:items-start select-none group"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-amber-400 font-serif font-black text-xl shadow-sm group-hover:bg-amber-600 transition-colors">
              P
            </div>
            <span className="font-serif font-black text-2xl md:text-3xl tracking-tight text-stone-950 group-hover:text-amber-700 transition-colors">
              PORTAL PRISMA
            </span>
          </div>
          <span className="text-[10px] md:text-[11px] font-mono tracking-widest uppercase text-stone-500 mt-0.5">
            Alta Performance • Fatos • Economia • Tecnologia
          </span>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72 lg:w-96">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Pesquisar por tópicos, fatos ou IA..."
            className="w-full bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-800 text-xs rounded-full pl-10 pr-4 py-2.5 border border-stone-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all placeholder:text-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
        </form>
      </div>

      {/* Category Navigation Bar */}
      <nav className="border-t border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 md:gap-2 py-1">
            {categories.map((cat) => {
              const active = currentCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold tracking-tight whitespace-nowrap transition-all ${
                    active
                      ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-100/70 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-stone-500 pl-4 border-l border-stone-200">
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[11px] font-mono">
              <Sparkles className="w-3 h-3 text-amber-600" />
              SEO Rank #1
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white p-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="mb-4 relative">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Pesquisar artigos..."
              className="w-full bg-stone-100 text-stone-800 text-xs rounded-lg pl-9 pr-4 py-2.5 border border-stone-300 focus:outline-none"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </form>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 mb-1">Categorias</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  currentCategory === cat ? 'bg-stone-900 text-white font-bold' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
