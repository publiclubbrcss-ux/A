export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Markdown or rich HTML
  category: 'Tecnologia' | 'Economia' | 'IA & Futuro' | 'Ciência' | 'Negócios' | 'Mundo';
  coverImage: string;
  coverImageCaption?: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  status: 'published' | 'draft' | 'pending';
  views: number;
  shares: number;
  tags: string[];
  sourceName: string;
  sourceUrl: string;
  seoTitle: string;
  seoDescription: string;
  isAiGenerated?: boolean;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

export interface Banner {
  id: string;
  title: string;
  slot: 'header' | 'article_top' | 'article_middle' | 'article_bottom' | 'sidebar' | 'footer';
  htmlContent: string;
  active: boolean;
  clicks: number;
  impressions: number;
  updatedAt: string;
}

export interface TrafficSource {
  name: string;
  count: number;
  percentage: number;
  category: 'search' | 'ai' | 'social' | 'direct' | 'other';
  icon: string;
}

export interface GeoLocationStat {
  country: string;
  countryCode: string;
  flag: string;
  visitors: number;
  percentage: number;
  cities: Array<{ name: string; visitors: number }>;
}

export interface SiteStats {
  onlineUsers: number;
  todayViews: number;
  weeklyViews: number;
  monthlyViews: number;
  totalViews: number;
  totalArticles: number;
  topCountries: GeoLocationStat[];
  trafficSources: TrafficSource[];
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export interface PortalSettings {
  siteName: string;
  siteTagline: string;
  customCss: string;
  customHeaderHtml: string;
  customFooterHtml: string;
  aiAutoPublishEnabled: boolean;
  aiArticlesPerDay: number;
  lastAiRunAt: string | null;
}
