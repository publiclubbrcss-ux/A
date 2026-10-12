import React, { useEffect } from 'react';
import { Article } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  article?: Article;
  canonicalUrl?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ title, description, article, canonicalUrl }) => {
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portalprisma.com';
    const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : origin);

    const siteTitle = article?.seoTitle || title || 'Portal Prisma | Notícias, Tecnologia, Economia e Tendências';
    const siteDesc =
      article?.seoDescription ||
      description ||
      'Portal editorial independente com análises aprofundadas, tecnologia, economia, mercado global e tendências em tempo real.';
    const ogImage =
      article?.coverImage ||
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';

    // 1. Update Title
    document.title = siteTitle;

    // 2. Helper to set meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', siteDesc);
    setMeta('website-verification', '6accf775626665883e95741b');
    setMeta('og:title', siteTitle, true);
    setMeta('og:description', siteDesc, true);
    setMeta('og:url', currentUrl, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:type', article ? 'article' : 'website', true);
    setMeta('og:site_name', 'Portal Prisma', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', siteTitle);
    setMeta('twitter:description', siteDesc);
    setMeta('twitter:image', ogImage);

    // 3. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // 4. Update Schema.org JSON-LD
    let scriptTag = document.getElementById('schema-ld-json') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-ld-json';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    let schemaData: any;

    if (article) {
      // High performance NewsArticle Schema
      schemaData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'NewsArticle',
            '@id': `${currentUrl}#article`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${origin}/#website`,
              name: 'Portal Prisma',
              url: origin,
            },
            headline: article.title,
            description: article.summary,
            inLanguage: 'pt-BR',
            mainEntityOfPage: currentUrl,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt || article.publishedAt,
            image: [article.coverImage],
            author: {
              '@type': 'Person',
              name: article.author.name,
              jobTitle: article.author.role,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Portal Prisma',
              url: origin,
              logo: {
                '@type': 'ImageObject',
                url: `${origin}/logo.png`,
              },
            },
            articleSection: article.category,
            keywords: article.tags.join(', '),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Início',
                item: origin,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: article.category,
                item: `${origin}/?categoria=${encodeURIComponent(article.category)}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: currentUrl,
              },
            ],
          },
        ],
      };

      // Add FAQPage if article includes FAQ
      if (article.faq && article.faq.length > 0) {
        schemaData['@graph'].push({
          '@type': 'FAQPage',
          mainEntity: article.faq.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        });
      }
    } else {
      // General WebSite schema
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Portal Prisma',
        url: origin,
        description: siteDesc,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${origin}/?busca={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
    }

    scriptTag.textContent = JSON.stringify(schemaData);
  }, [title, description, article, canonicalUrl]);

  return null;
};
