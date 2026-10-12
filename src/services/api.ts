import { Article, Banner, PortalSettings, SiteStats } from '../types';

export const api = {
  async getStats(): Promise<SiteStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Falha ao obter estatísticas');
    return res.json();
  },

  async trackVisit(): Promise<void> {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referrer: document.referrer || '',
          userAgent: navigator.userAgent,
        }),
      });
    } catch {
      // Ignore background tracking failure
    }
  },

  async getArticles(params?: { category?: string; search?: string; status?: string; tag?: string }): Promise<Article[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.tag) query.append('tag', params.tag);

    const res = await fetch(`/api/articles?${query.toString()}`);
    if (!res.ok) throw new Error('Falha ao obter artigos');
    return res.json();
  },

  async getArticle(slugOrId: string): Promise<Article> {
    const res = await fetch(`/api/articles/${encodeURIComponent(slugOrId)}`);
    if (!res.ok) throw new Error('Artigo não encontrado');
    return res.json();
  },

  async incrementShare(articleId: string): Promise<number> {
    const res = await fetch(`/api/articles/${articleId}/share`, { method: 'POST' });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.shares || 0;
  },

  async validateAdminPassword(password: string): Promise<{ token: string; user: { username: string } }> {
    const res = await fetch('/api/auth/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Senha incorreta. Acesso não autorizado.' }));
      throw new Error(err.error || 'Senha incorreta. Acesso não autorizado.');
    }
    return res.json();
  },

  async login(username: string, password: string): Promise<{ token: string; user: { username: string } }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Credenciais inválidas' }));
      throw new Error(err.error || 'Credenciais inválidas');
    }
    return res.json();
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha ao alterar senha' }));
      throw new Error(err.error || 'Falha ao alterar senha');
    }
  },

  async createArticle(data: Partial<Article>): Promise<Article> {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha ao criar artigo' }));
      throw new Error(err.error || 'Falha ao criar artigo');
    }
    return res.json();
  },

  async updateArticle(id: string, data: Partial<Article>): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar artigo');
    return res.json();
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir artigo');
  },

  async bulkPublishArticles(ids: string[]): Promise<{ updatedCount: number; message: string }> {
    const res = await fetch('/api/articles/bulk-publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Falha na publicação em lote');
    return res.json();
  },

  async bulkDeleteArticles(ids: string[]): Promise<void> {
    const res = await fetch('/api/articles/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('Falha na exclusão em lote');
  },

  async generateAiArticle(category?: string, topic?: string): Promise<Article> {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, topic }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha na geração com IA' }));
      throw new Error(err.error || 'Falha na geração com IA');
    }
    const data = await res.json();
    return data.article;
  },

  async getBanners(): Promise<Banner[]> {
    const res = await fetch('/api/banners');
    if (!res.ok) return [];
    return res.json();
  },

  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao criar banner');
    return res.json();
  },

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const res = await fetch(`/api/banners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar banner');
    return res.json();
  },

  async deleteBanner(id: string): Promise<void> {
    const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Falha ao excluir banner');
  },

  async trackBannerImpression(id: string): Promise<void> {
    fetch(`/api/banners/${id}/impression`, { method: 'POST' }).catch(() => {});
  },

  async trackBannerClick(id: string): Promise<void> {
    fetch(`/api/banners/${id}/click`, { method: 'POST' }).catch(() => {});
  },

  async getSettings(): Promise<PortalSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Falha ao obter configurações');
    return res.json();
  },

  async updateSettings(data: Partial<PortalSettings>): Promise<PortalSettings> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar configurações');
    const resData = await res.json();
    return resData.settings;
  },

  async restoreBackup(backupData: any): Promise<void> {
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backupData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Falha na restauração' }));
      throw new Error(err.error || 'Falha ao restaurar');
    }
  },
};
