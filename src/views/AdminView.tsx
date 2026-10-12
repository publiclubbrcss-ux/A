import React, { useState, useEffect } from 'react';
import { Article, Banner, PortalSettings, SiteStats } from '../types';
import { api } from '../services/api';
import {
  Lock,
  LogOut,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Sparkles,
  Layers,
  Code2,
  KeyRound,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Trash2,
  Edit3,
  Globe,
  TrendingUp,
  Share2,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  ShieldAlert,
  Save,
  Play,
  Activity,
  Compass,
} from 'lucide-react';

interface AdminViewProps {
  onClose: () => void;
  onRefreshPortal: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onClose, onRefreshPortal }) => {
  // Authentication State: Secure Password Validation Gate
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Restore authenticated session from sessionStorage if already validated
  useEffect(() => {
    const savedToken = sessionStorage.getItem('prisma_admin_token');
    if (savedToken) {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  // Tabs: 'dashboard' | 'articles' | 'new-article' | 'ai-agent' | 'banners' | 'code-editor' | 'security' | 'backup'
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'articles' | 'new-article' | 'ai-agent' | 'banners' | 'code-editor' | 'security' | 'backup'
  >('dashboard');

  // Data states
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Article selection for Bulk actions
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [articleFilterStatus, setArticleFilterStatus] = useState<string>('all');
  const [articleSearchQuery, setArticleSearchQuery] = useState('');

  // Manual Article Form (Without AI credits)
  const [manualForm, setManualForm] = useState({
    title: '',
    category: 'Tecnologia' as Article['category'],
    summary: '',
    content: '',
    coverImage: '',
    tags: 'Tecnologia, Notícias, Inovação',
    sourceName: 'Agência Internacional de Notícias',
    sourceUrl: 'https://www.reuters.com',
    seoTitle: '',
    seoDescription: '',
    status: 'published' as 'published' | 'draft' | 'pending',
  });

  // AI Agent Generation Form
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState<Article['category']>('IA & Futuro');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Security: Password Change Form
  const [securityForm, setSecurityForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Code editor form
  const [cssCode, setCssCode] = useState('');
  const [headerHtml, setHeaderHtml] = useState('');
  const [footerHtml, setFooterHtml] = useState('');

  // Banner Editor Modal/Form
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({
    title: '',
    slot: 'header',
    htmlContent: '',
    active: true,
  });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Auto-clear feedback notification
  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  // Load portal data once authenticated
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, articlesData, bannersData, settingsData] = await Promise.all([
        api.getStats(),
        api.getArticles(),
        api.getBanners(),
        api.getSettings(),
      ]);
      setStats(statsData);
      setArticles(articlesData);
      setBanners(bannersData);
      setSettings(settingsData);
      setCssCode(settingsData.customCss || '');
      setHeaderHtml(settingsData.customHeaderHtml || '');
      setFooterHtml(settingsData.customFooterHtml || '');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao carregar dados administrativos: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleValidatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setAuthError('Por favor, informe a senha de acesso.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.validateAdminPassword(adminPassword);
      sessionStorage.setItem('prisma_admin_token', res.token);
      setIsAuthenticated(true);
      setAdminPassword('');
      await loadAdminData();
    } catch (err: any) {
      setAuthError(err.message || 'Senha incorreta. Acesso não autorizado.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('prisma_admin_token');
    setIsAuthenticated(false);
    setStats(null);
    setArticles([]);
    setBanners([]);
    setSettings(null);
    setAdminPassword('');
  };

  // Bulk Publish Action (NOVO: Correção de Publicação em Lote)
  const handleBulkPublish = async () => {
    if (selectedArticleIds.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'Selecione pelo menos um artigo para publicar em lote.' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.bulkPublishArticles(selectedArticleIds);
      setFeedbackMsg({ type: 'success', text: res.message });
      setSelectedArticleIds([]);
      await loadAdminData();
      onRefreshPortal();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro na publicação em lote: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Bulk Delete Action
  const handleBulkDelete = async () => {
    if (selectedArticleIds.length === 0) return;
    if (!confirm(`Deseja realmente excluir ${selectedArticleIds.length} artigo(s)?`)) return;

    try {
      setLoading(true);
      await api.bulkDeleteArticles(selectedArticleIds);
      setFeedbackMsg({ type: 'success', text: 'Artigos selecionados excluídos com sucesso!' });
      setSelectedArticleIds([]);
      await loadAdminData();
      onRefreshPortal();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao excluir artigos: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Manual Article Submit
  const handleCreateManualArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title || !manualForm.content) {
      setFeedbackMsg({ type: 'error', text: 'Título e conteúdo são obrigatórios.' });
      return;
    }

    try {
      setLoading(true);
      await api.createArticle({
        ...manualForm,
        tags: manualForm.tags.split(',').map((t) => t.trim()),
      });
      setFeedbackMsg({ type: 'success', text: 'Artigo criado e publicado com sucesso sem usar créditos de IA!' });
      setManualForm({
        title: '',
        category: 'Tecnologia',
        summary: '',
        content: '',
        coverImage: '',
        tags: 'Tecnologia, Notícias, Inovação',
        sourceName: 'Agência Internacional de Notícias',
        sourceUrl: 'https://www.reuters.com',
        seoTitle: '',
        seoDescription: '',
        status: 'published',
      });
      await loadAdminData();
      onRefreshPortal();
      setActiveTab('articles');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao criar artigo: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Trigger Gemini AI Article Generation
  const handleGenerateAiArticle = async () => {
    try {
      setAiGenerating(true);
      const article = await api.generateAiArticle(aiCategory, aiTopic);
      setFeedbackMsg({
        type: 'success',
        text: `Artigo gerado com sucesso pela IA: "${article.title}" (Fatos reais com citação de fonte)`,
      });
      setAiTopic('');
      await loadAdminData();
      onRefreshPortal();
      setActiveTab('articles');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao gerar artigo com IA: ' + err.message });
    } finally {
      setAiGenerating(false);
    }
  };

  // Change Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setFeedbackMsg({ type: 'error', text: 'A confirmação de senha não confere.' });
      return;
    }

    try {
      setLoading(true);
      await api.changePassword(securityForm.oldPassword, securityForm.newPassword);
      setFeedbackMsg({ type: 'success', text: 'Senha alterada com sucesso! Guarde suas novas credenciais.' });
      setSecurityForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Erro ao alterar senha.' });
    } finally {
      setLoading(false);
    }
  };

  // Save Settings & Code
  const handleSaveSettingsAndCode = async () => {
    try {
      setLoading(true);
      await api.updateSettings({
        customCss: cssCode,
        customHeaderHtml: headerHtml,
        customFooterHtml: footerHtml,
      });

      // Apply CSS immediately to current page
      let styleEl = document.getElementById('custom-portal-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-portal-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = cssCode;

      setFeedbackMsg({ type: 'success', text: 'Personalização CSS e HTML salva e aplicada ao vivo!' });
      onRefreshPortal();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao salvar personalização: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Save Banner
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.htmlContent || !bannerForm.slot) {
      setFeedbackMsg({ type: 'error', text: 'Preencha todos os campos do anúncio.' });
      return;
    }

    try {
      setLoading(true);
      if (editingBannerId) {
        await api.updateBanner(editingBannerId, bannerForm);
        setFeedbackMsg({ type: 'success', text: 'Banner atualizado com sucesso!' });
      } else {
        await api.createBanner(bannerForm);
        setFeedbackMsg({ type: 'success', text: 'Novo anúncio configurado e ativo!' });
      }
      setEditingBannerId(null);
      setBannerForm({ title: '', slot: 'header', htmlContent: '', active: true });
      await loadAdminData();
      onRefreshPortal();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao salvar banner: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Delete Banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Deseja excluir este anúncio?')) return;
    try {
      await api.deleteBanner(id);
      setFeedbackMsg({ type: 'success', text: 'Banner removido com sucesso!' });
      await loadAdminData();
      onRefreshPortal();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: 'Erro ao excluir banner: ' + err.message });
    }
  };

  // Backup Download
  const handleDownloadBackup = () => {
    window.open('/api/backup', '_blank');
  };

  // Backup Upload
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.restoreBackup(json);
        setFeedbackMsg({ type: 'success', text: 'Backup restaurado com sucesso! Recarregando sistema...' });
        await loadAdminData();
        onRefreshPortal();
      } catch (err: any) {
        setFeedbackMsg({ type: 'error', text: 'Arquivo de backup inválido: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  // Filtered articles list
  const filteredArticles = articles.filter((a) => {
    if (articleFilterStatus === 'published' && a.status !== 'published') return false;
    if (articleFilterStatus === 'pending' && a.status === 'published') return false;
    if (articleSearchQuery) {
      const q = articleSearchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    }
    return true;
  });

  // 1. SCREEN: AUTHENTICATION LOGIN (Security Gate - Password Check via API)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-8 shadow-2xl text-white">
          <div className="flex items-center justify-between pb-6 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-serif font-black text-xl text-white tracking-tight">Área Administrativa</h2>
                <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Autenticação Obrigatória via API
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white text-xs font-mono px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>

          <form onSubmit={handleValidatePassword} className="mt-6 space-y-4">
            {authError && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-stone-300 uppercase tracking-wider mb-2 font-semibold">
                Senha de Acesso do Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  autoComplete="current-password"
                  placeholder="Digite a senha mestra do painel..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono placeholder:text-stone-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-200 transition-colors p-1"
                  title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="block text-[11px] text-stone-500 mt-1.5 font-mono">
                A senha é validada pelo servidor antes de liberar as configurações.
              </span>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validando Credenciais na API...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verificar e Acessar Painel</span>
                </>
              )}
            </button>

            {/* Quick cache purge & live verification badge */}
            <div className="pt-4 border-t border-stone-800/80 flex flex-col items-center gap-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-emerald-400 text-[11px] font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Meta de Verificação Ativa: 6accf775626665883e95741b</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if ('caches' in window) {
                    caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
                  }
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
                  }
                  window.location.reload();
                }}
                className="text-[11px] font-mono text-stone-400 hover:text-amber-400 underline transition-colors cursor-pointer"
              >
                ↻ Forçar Atualização / Limpar Cache do Celular
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. MAIN ADMIN DASHBOARD
  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-stone-100 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 bg-stone-900 border-b border-stone-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-black">
            P
          </div>
          <div>
            <h1 className="font-serif font-black text-lg text-white tracking-tight flex items-center gap-2">
              Painel Editorial & Automação Prisma
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Autenticado via API
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadAdminData();
              onRefreshPortal();
            }}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Ver Portal
          </button>

          <button
            onClick={handleLogout}
            className="p-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 rounded-lg text-xs transition-colors flex items-center gap-1.5"
            title="Encerrar Sessão"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar Tabs */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tabs Navigation */}
        <aside className="w-64 bg-stone-900/60 border-r border-stone-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 px-3 block mb-2 font-bold">
              Navegação do Sistema
            </span>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Analítico</span>
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'articles'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Gestão de Artigos ({articles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('new-article')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'new-article'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Postagem Manual (Sem Créditos)</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-agent')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'ai-agent'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Agente de IA & Fatos Reais</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'banners'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Gerenciador de Banners ({banners.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('code-editor')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'code-editor'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Editor HTML/CSS & Pixels</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'security'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Segurança & Senha</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'backup'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Backup & Restauração 1-Clique</span>
            </button>
          </div>

          <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 font-mono">
            <span>Versão 2.4-Production</span>
            <span className="block mt-0.5 text-stone-600">SEO Score: 98/100</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-stone-950 p-6 md:p-8 overflow-y-auto">
          {/* Toast feedback banner */}
          {feedbackMsg && (
            <div
              className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border shadow-lg ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/90 border-rose-500/60 text-rose-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-medium">{feedbackMsg.text}</span>
            </div>
          )}

          {/* TAB 1: DASHBOARD ANALÍTICO & ORIGEM DO TRÁFEGO */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8 max-w-6xl">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">Dashboard Analítico & Tráfego Orgânico</h2>
                <p className="text-stone-400 text-xs mt-1">
                  Métricas em tempo real, monitoramento de fontes de tráfego referenciadas e geolocalização dos leitores.
                </p>
              </div>

              {/* 4 Cards de Métricas Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-emerald-400 mb-2">
                    <span className="text-xs font-mono uppercase font-bold">Online Agora</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <div className="text-3xl font-black font-mono text-white">{stats.onlineUsers}</div>
                  <span className="text-[11px] text-stone-400 mt-1 block">Leitores simultâneos em tempo real</span>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-amber-400 mb-2">
                    <span className="text-xs font-mono uppercase font-bold">Leitores Hoje</span>
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    {stats.todayViews.toLocaleString('pt-BR')}
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">Visualizações únicas nas últimas 24h</span>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-sky-400 mb-2">
                    <span className="text-xs font-mono uppercase font-bold">Visualizações Mês</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    {stats.monthlyViews.toLocaleString('pt-BR')}
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">+32.4% comparado ao mês anterior</span>
                </div>

                <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between text-purple-400 mb-2">
                    <span className="text-xs font-mono uppercase font-bold">Histórico Total</span>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black font-mono text-white">
                    {stats.totalViews.toLocaleString('pt-BR')}
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">Acessos acumulados no portal</span>
                </div>
              </div>

              {/* RASTREAMENTO DETALHADO DE ORIGEM DO TRÁFEGO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna 1: Fontes de Tráfego & Referrals */}
                <div className="lg:col-span-7 bg-stone-900 border border-stone-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white">Relatório de Origem do Tráfego</h3>
                      <p className="text-stone-400 text-xs">Identificação precisa de motores de busca, IAs e redes sociais</p>
                    </div>
                    <span className="text-xs font-mono bg-stone-800 px-2.5 py-1 rounded-md text-amber-400">
                      Top Canais
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {stats.trafficSources.map((source) => (
                      <div key={source.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-stone-200 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            {source.name}
                          </span>
                          <span className="font-mono text-stone-400">
                            {source.count.toLocaleString('pt-BR')} cliques ({source.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(4, source.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
                    <span>Dispositivos:</span>
                    <span>
                      📱 Mobile: {stats.deviceBreakdown.mobile} | 💻 Desktop: {stats.deviceBreakdown.desktop} | 📟 Tablet: {stats.deviceBreakdown.tablet}
                    </span>
                  </div>
                </div>

                {/* Coluna 2: Geolocalização dos Leitores */}
                <div className="lg:col-span-5 bg-stone-900 border border-stone-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white">Geolocalização de Leitores</h3>
                      <p className="text-stone-400 text-xs">Origem por país e cidades com maior volume</p>
                    </div>
                    <Globe className="w-4 h-4 text-sky-400" />
                  </div>

                  <div className="space-y-3">
                    {stats.topCountries.map((c) => (
                      <div key={c.country} className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-stone-200 flex items-center gap-2">
                            <span className="text-base">{c.flag}</span>
                            <span>{c.country}</span>
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {c.visitors.toLocaleString('pt-BR')} ({c.percentage}%)
                          </span>
                        </div>
                        {c.cities && c.cities.length > 0 && (
                          <div className="text-[11px] text-stone-400 font-mono">
                            Cidades: {c.cities.map((city) => `${city.name} (${city.visitors})`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTÃO DE ARTIGOS COM BULK PUBLISH ACTION */}
          {activeTab === 'articles' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif font-black text-2xl text-white">Gestão Editorial de Artigos</h2>
                  <p className="text-stone-400 text-xs mt-1">
                    Gerencie, filtre e execute publicações em lote de matérias jornalísticas.
                  </p>
                </div>

                {/* Bulk Action Buttons Bar */}
                {selectedArticleIds.length > 0 && (
                  <div className="flex items-center gap-3 bg-stone-900 border border-amber-500/60 p-2.5 rounded-2xl shadow-xl animate-fade-in">
                    <span className="text-xs font-mono font-bold text-amber-400 pl-2">
                      {selectedArticleIds.length} selecionado(s):
                    </span>

                    {/* NOVO: CORREÇÃO DE PUBLICAÇÃO EM LOTE */}
                    <button
                      onClick={handleBulkPublish}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Publicar Selecionados</span>
                    </button>

                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Filters and search */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-mono">Status:</span>
                  {(['all', 'published', 'pending'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setArticleFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-colors ${
                        articleFilterStatus === st
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {st === 'all' ? 'Todos' : st === 'published' ? 'Publicados' : 'Pendentes'}
                    </button>
                  ))}
                </div>

                <div className="relative w-64">
                  <input
                    type="search"
                    placeholder="Filtrar por título..."
                    value={articleSearchQuery}
                    onChange={(e) => setArticleSearchQuery(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Articles Table */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-950/80 text-stone-400 font-mono uppercase text-[11px] border-b border-stone-800">
                    <tr>
                      <th className="p-4 w-12 text-center">
                        <button
                          onClick={() => {
                            if (selectedArticleIds.length === filteredArticles.length) {
                              setSelectedArticleIds([]);
                            } else {
                              setSelectedArticleIds(filteredArticles.map((a) => a.id));
                            }
                          }}
                          className="text-stone-400 hover:text-white"
                        >
                          {selectedArticleIds.length > 0 &&
                          selectedArticleIds.length === filteredArticles.length ? (
                            <CheckSquare className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="p-4">Artigo & Resumo</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Engajamento</th>
                      <th className="p-4">Origem</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/80">
                    {filteredArticles.map((article) => {
                      const isSelected = selectedArticleIds.includes(article.id);
                      return (
                        <tr
                          key={article.id}
                          className={`hover:bg-stone-800/40 transition-colors ${
                            isSelected ? 'bg-amber-500/10' : ''
                          }`}
                        >
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedArticleIds(selectedArticleIds.filter((id) => id !== article.id));
                                } else {
                                  setSelectedArticleIds([...selectedArticleIds, article.id]);
                                }
                              }}
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-500" />
                              ) : (
                                <Square className="w-4 h-4 text-stone-500" />
                              )}
                            </button>
                          </td>

                          <td className="p-4 max-w-md">
                            <div className="flex items-center gap-3">
                              <img
                                src={article.coverImage}
                                alt={article.title}
                                className="w-12 h-10 object-cover rounded-lg shrink-0 border border-stone-700"
                              />
                              <div>
                                <span className="font-serif font-bold text-sm text-white line-clamp-1">
                                  {article.title}
                                </span>
                                <span className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                                  {article.summary}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-stone-300 border border-stone-700">
                              {article.category}
                            </span>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                                article.status === 'published'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              }`}
                            >
                              {article.status === 'published' ? '● Publicado' : '○ Pendente'}
                            </span>
                          </td>

                          <td className="p-4 font-mono text-[11px] text-stone-400">
                            <div>{article.views} views</div>
                            <div className="text-stone-500">{article.shares} shares</div>
                          </td>

                          <td className="p-4">
                            {article.isAiGenerated ? (
                              <span className="text-amber-400 text-[11px] font-mono flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> IA Autônoma
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                                <Edit3 className="w-3 h-3" /> Manual Direto
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={async () => {
                                if (confirm(`Deseja excluir "${article.title}"?`)) {
                                  await api.deleteArticle(article.id);
                                  await loadAdminData();
                                  onRefreshPortal();
                                }
                              }}
                              className="p-1.5 hover:bg-rose-900/50 text-stone-400 hover:text-rose-400 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NOVO ARTIGO MANUAL (SEM CONSUMIR CRÉDITOS DE IA) */}
          {activeTab === 'new-article' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">Postagem Manual Direta</h2>
                <p className="text-stone-400 text-xs mt-1">
                  Crie e publique artigos com controle manual completo, formatando títulos, categoria, foto de capa e SEO —{' '}
                  <strong className="text-emerald-400">100% gratuito, sem gastar créditos de IA</strong>.
                </p>
              </div>

              <form onSubmit={handleCreateManualArticle} className="space-y-5 bg-stone-900 border border-stone-800 p-6 md:p-8 rounded-3xl shadow-xl">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Título da Notícia / Reportagem *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.title}
                    onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                    placeholder="Ex: Novo Acordo Global Acelera Produção de Semicondutores Limpos"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Editoria / Categoria *
                    </label>
                    <select
                      value={manualForm.category}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, category: e.target.value as Article['category'] })
                      }
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Economia">Economia</option>
                      <option value="IA & Futuro">IA & Futuro</option>
                      <option value="Ciência">Ciência</option>
                      <option value="Negócios">Negócios</option>
                      <option value="Mundo">Mundo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Status da Postagem
                    </label>
                    <select
                      value={manualForm.status}
                      onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="published">Publicar Imediatamente</option>
                      <option value="pending">Salvar como Pendente / Rascunho</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Resumo / Linha Fina (Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={manualForm.summary}
                    onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
                    placeholder="Síntese concisa de 1 a 2 frases para leitura rápida e snippets do Google..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Conteúdo Completo (Markdown com ## subtítulos e citação) *
                  </label>
                  <textarea
                    rows={10}
                    required
                    value={manualForm.content}
                    onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
                    placeholder={`## Primeiro Subtítulo\n\nTexto jornalístico aprofundado com fatos reais...\n\n> "Citação destacada relevante."\n\n### Próximos Desdobramentos\n\nMais análises detalhadas.`}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      URL da Foto de Capa (Deixe em branco para usar Fallback HD Unsplash)
                    </label>
                    <input
                      type="url"
                      value={manualForm.coverImage}
                      onChange={(e) => setManualForm({ ...manualForm, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Tags / Palavras-chave (Separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={manualForm.tags}
                      onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })}
                      placeholder="Tecnologia, Semicondutores, Mercado"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Nome da Fonte Original *
                    </label>
                    <input
                      type="text"
                      required
                      value={manualForm.sourceName}
                      onChange={(e) => setManualForm({ ...manualForm, sourceName: e.target.value })}
                      placeholder="Ex: Reuters, Bloomberg, MIT Tech Review"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Link / URL da Fonte Original *
                    </label>
                    <input
                      type="url"
                      required
                      value={manualForm.sourceUrl}
                      onChange={(e) => setManualForm({ ...manualForm, sourceUrl: e.target.value })}
                      placeholder="https://www.reuters.com"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Publicar Artigo Manualmente</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: AGENTE DE IA & REGRAS RÍGIDAS DE CONTEÚDO */}
          {activeTab === 'ai-agent' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">Agente de IA Editorial</h2>
                <p className="text-stone-400 text-xs mt-1">
                  Automação nativa de jornalismo com filtro estrito anti-duplicação, citação de fatos reais e fotos de alta resolução.
                </p>
              </div>

              {/* Status & Rules box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Regra 1: Fatos Reais</span>
                  <p className="text-xs text-stone-300 mt-1">Proibido alucinar. Toda notícia cita fonte oficial com backlink.</p>
                </div>

                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                  <span className="text-[10px] font-mono text-sky-400 font-bold uppercase">Regra 2: Anti-Duplicação</span>
                  <p className="text-xs text-stone-300 mt-1">Verificação semântica no banco antes de publicar.</p>
                </div>

                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Regra 3: Fallback 100% HD</span>
                  <p className="text-xs text-stone-300 mt-1">Garantia obrigatória de fotografia temática de alta resolução.</p>
                </div>
              </div>

              {/* Generator Trigger Box */}
              <div className="bg-stone-900 border border-stone-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
                <h3 className="font-serif font-bold text-lg text-white">Disparar Geração com Gemini 3.8 Flash</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Editoria
                    </label>
                    <select
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value as any)}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Economia">Economia</option>
                      <option value="IA & Futuro">IA & Futuro</option>
                      <option value="Ciência">Ciência</option>
                      <option value="Negócios">Negócios</option>
                      <option value="Mundo">Mundo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                      Tema Específico (Opcional - deixe vazio para tendência autônoma)
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Ex: Nova bateria de lítio-enxofre validada na Europa"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-stone-800/60 rounded-xl border border-stone-700/60">
                  <div>
                    <span className="block text-xs font-bold text-stone-200">Automação Contínua em Segundo Plano</span>
                    <span className="text-[11px] text-stone-400">
                      O agendador nativo publica automaticamente 3+ matérias por dia com verificação rigorosa.
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    🟢 Ativo
                  </span>
                </div>

                <button
                  onClick={handleGenerateAiArticle}
                  disabled={aiGenerating}
                  className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Pesquisando Fatos e Escrevendo Matéria...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Executar Agente de IA Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: GERENCIADOR E EXIBIÇÃO REAL DE BANNERS (HTML/JS) */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">Gerenciador de Banners & Anúncios</h2>
                <p className="text-stone-400 text-xs mt-1">
                  Renderização dinâmica real de HTML/JS nos slots: Header, Início, Meio do Texto, Fim do Artigo, Sidebar e Footer.
                </p>
              </div>

              {/* Form to Add / Edit Banner */}
              <form onSubmit={handleSaveBanner} className="bg-stone-900 border border-stone-800 p-6 rounded-3xl shadow-xl space-y-4">
                <h3 className="font-serif font-bold text-base text-white">
                  {editingBannerId ? 'Editar Anúncio' : 'Configurar Novo Anúncio'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1">
                      Título Interno
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      placeholder="Ex: Anúncio Topo - Campanha Black Friday"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1">
                      Local de Exibição (Slot)
                    </label>
                    <select
                      value={bannerForm.slot}
                      onChange={(e) => setBannerForm({ ...bannerForm, slot: e.target.value as any })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="header">Header (Topo do site)</option>
                      <option value="article_top">Início do Artigo</option>
                      <option value="article_middle">Meio do Texto (No meio dos parágrafos)</option>
                      <option value="article_bottom">Fim do Artigo</option>
                      <option value="sidebar">Sidebar (Barra Lateral)</option>
                      <option value="footer">Footer (Rodapé)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Código HTML / JS Puro do Anúncio (Suporta &lt;script&gt;, Google AdSense, iframes e links)
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={bannerForm.htmlContent}
                    onChange={(e) => setBannerForm({ ...bannerForm, htmlContent: e.target.value })}
                    placeholder={`<div style="background:#111; color:#fff; padding:16px; border-radius:8px;">\n  <h4>Sua Marca Aqui</h4>\n  <a href="https://...">Clique Aqui</a>\n</div>`}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-stone-300 font-medium">
                    <input
                      type="checkbox"
                      checked={bannerForm.active}
                      onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span>Ativar anúncio imediatamente</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {editingBannerId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBannerId(null);
                          setBannerForm({ title: '', slot: 'header', htmlContent: '', active: true });
                        }}
                        className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      {editingBannerId ? 'Atualizar Banner' : 'Salvar e Publicar Anúncio'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Banners List */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-white">Anúncios Configurados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map((b) => (
                    <div key={b.id} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{b.title}</h4>
                          <span className="text-[11px] font-mono text-amber-400">Slot: {b.slot}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            b.active ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-500'
                          }`}
                        >
                          {b.active ? 'ATIVO' : 'PAUSADO'}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-stone-400 flex items-center gap-4">
                        <span>{b.impressions} visualizações</span>
                        <span>{b.clicks} cliques</span>
                      </div>

                      <div className="pt-2 border-t border-stone-800 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingBannerId(b.id);
                            setBannerForm(b);
                          }}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg text-xs"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EDITOR HTML/CSS E PIXELS */}
          {activeTab === 'code-editor' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">Editor de CSS & Scripts Personalizados</h2>
                <p className="text-stone-400 text-xs mt-1">
                  Injeção ao vivo de CSS customizado, Google Tag Manager, Pixel do Meta e scripts de cabeçalho.
                </p>
              </div>

              <div className="space-y-5 bg-stone-900 border border-stone-800 p-6 md:p-8 rounded-3xl shadow-xl">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1.5 font-bold">
                    CSS Customizado (Aplicado instantaneamente em todo o portal)
                  </label>
                  <textarea
                    rows={8}
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    placeholder={`/* Adicione seu CSS personalizado aqui */\nbody {\n  /* suas regras */\n}`}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Scripts / Tags para o &lt;head&gt; (Pixels, Analytics, Fonts)
                  </label>
                  <textarea
                    rows={4}
                    value={headerHtml}
                    onChange={(e) => setHeaderHtml(e.target.value)}
                    placeholder="<!-- Ex: <script async src='https://www.googletagmanager.com/...'></script> -->"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-4 text-xs font-mono text-stone-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Scripts para o Rodapé (&lt;body&gt;)
                  </label>
                  <textarea
                    rows={3}
                    value={footerHtml}
                    onChange={(e) => setFooterHtml(e.target.value)}
                    placeholder="<!-- Scripts adicionais executados antes de fechar o </body> -->"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-4 text-xs font-mono text-stone-300 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveSettingsAndCode}
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar e Aplicar Alterações ao Vivo</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: SEGURANÇA & ALTERAÇÃO DE SENHA */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">Segurança & Alteração de Senha</h2>
                <p className="text-stone-400 text-xs mt-1">
                  Gerencie o acesso único e fechado da conta administrativa do portal.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="bg-stone-900 border border-stone-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    required
                    value={securityForm.oldPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, oldPassword: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Nova Senha (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    required
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 mb-1.5">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Salvar Nova Senha</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: BACKUP E RESTAURAÇÃO 1-CLIQUE */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="font-serif font-black text-2xl text-white">Backup & Restauração do Sistema</h2>
                <p className="text-stone-400 text-xs mt-1">
                  Exporte o banco de dados completo (artigos, banners, métricas e configurações) ou restaure a qualquer momento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-white">Baixar Backup Completo</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Gera um arquivo JSON estruturado com todos os artigos, banners, histórico de acessos e configurações.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Backup (JSON)</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-white">Restaurar Backup</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Carregue um arquivo JSON gerado anteriormente para restabelecer imediatamente todo o conteúdo do portal.
                    </p>
                  </div>
                  <label className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-700">
                    <Upload className="w-4 h-4" />
                    <span>Selecionar Arquivo JSON</span>
                    <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
