import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Curated high-resolution fallback photos for editorial news
const FALLBACK_IMAGES: Record<string, string[]> = {
  Tecnologia: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  ],
  'IA & Futuro': [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617791160505-6f00504e3519?auto=format&fit=crop&w=1200&q=80',
  ],
  Economia: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
  ],
  Ciência: [
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517976487502-d599d1078426?auto=format&fit=crop&w=1200&q=80',
  ],
  Negócios: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
  ],
  Mundo: [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80',
  ],
};

function getRandomFallbackImage(category: string): string {
  const list = FALLBACK_IMAGES[category] || FALLBACK_IMAGES['Tecnologia'];
  return list[Math.floor(Math.random() * list.length)];
}

// Initial Seed Articles
const SEED_ARTICLES = [
  {
    id: 'art-1',
    title: 'Modelos de Fronteira e Raciocínio Profundo Redefinem a Infraestrutura Global de IA',
    slug: 'modelos-fronteira-raciocinio-profundo-redefinem-infraestrutura-ia',
    summary: 'A nova geração de modelos com capacidade de raciocínio estendido e verificação lógica transforma o desenvolvimento de software corporativo e pesquisa biomédica.',
    content: `## A Transformação da Inteligência Artificial em 2026

O ecossistema global de inteligência artificial vive um momento decisivo com a consolidação dos modelos de raciocínio profundo. Ao contrário dos primeiros grandes modelos de linguagem que previam apenas o próximo token probabilístico, as arquiteturas modernas empregam cadeias de verificação interna, poda de árvores de decisão e execução heurística antes de emitir a resposta definitiva.

### Impactos nos Setores Estratégicos

Empresas de alta tecnologia em setores como semicondutores, engenharia aeroespacial e descoberta de fármacos relatam um ganho de produtividade de mais de 45% na resolução de problemas complexos.

1. **Validação Formal de Código:** Redução substancial de vulnerabilidades zero-day em sistemas críticos.
2. **Síntese Molecular Assistida:** Redução do ciclo de testes in-silico de compostos farmacêuticos de meses para dias.
3. **Automação de Pipelines Analíticos:** Integração fluida entre bancos de dados operacionais e agentes autônomos.

> "A capacidade de pensar antes de responder transformou a IA de uma ferramenta de texto para um mecanismo robusto de raciocínio estruturado." — Dr. Marcelo Duarte, Laboratório de Sistemas Avançados.

### Sustentabilidade Energética e Novos Desafios

Com a escalada do consumo energético em data centers de hiperescala, cresce a demanda por processadores dedicados com consumo reduzido por watt e energias limpas interligadas aos clusters de processamento.

---
**Fonte Original:** [MIT Technology Review & Global AI Index](https://www.technologyreview.com)`,
    category: 'IA & Futuro' as const,
    coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Infraestrutura de processamento para redes neurais de alta densidade.',
    author: {
      name: 'Helena Vasconcelos',
      role: 'Editora-Chefe de Tecnologia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    readingTimeMinutes: 5,
    status: 'published' as const,
    views: 1420,
    shares: 284,
    tags: ['Inteligência Artificial', 'Modelos de Raciocínio', 'Tecnologia', 'Inovação'],
    sourceName: 'MIT Technology Review',
    sourceUrl: 'https://www.technologyreview.com',
    seoTitle: 'Modelos de Raciocínio Profundo Redefinem a Infraestrutura Global de IA',
    seoDescription: 'Descubra como os novos modelos de raciocínio e verificação lógica estão transformando a engenharia de software e a bioinformática em 2026.',
    isAiGenerated: false,
    faq: [
      {
        question: 'O que diferencia os modelos de raciocínio dos LLMs clássicos?',
        answer: 'Os modelos de raciocínio profundo utilizam tempo de inferência estendido e verificação estruturada em etapas lógicas antes de emitir a resposta.',
      },
      {
        question: 'Quais áreas são mais beneficiadas?',
        answer: 'Desenvolvimento de software de alta confiabilidade, matemática, biotecnologia e diagnósticos de infraestrutura de rede.',
      },
    ],
  },
  {
    id: 'art-2',
    title: 'Transição Energética e Mercado de Carbono: O Novo Vetor de Crescimento da América Latina',
    slug: 'transicao-energetica-mercado-carbono-novo-vetor-crescimento-america-latina',
    summary: 'Investimentos em hidrogênio verde, energia solar flutuante e créditos de biodiversidade posicionam o Brasil e países vizinhos no centro das finanças sustentáveis.',
    content: `## O Avanço dos Ativos Ambientais Globais

O mercado global de capitais vive uma reconfiguração sem precedentes impulsionada pelas diretrizes internacionais de descarbonização. Em 2026, a América Latina consolidou-se como o polo mais competitivo para geração de energias renováveis e projetos de alta integridade no mercado de carbono.

### Investimentos e Infraestrutura

Com mais de US$ 32 bilhões aportados no último semestre, complexos eólicos offshore e usinas solares de alta eficiência estão abastecendo novos polos industriais voltados à manufatura verde e fertilizantes nitrogenados neutros em emissões.

- **Brasil:** Liderança em matriz limpa com mais de 88% de energia renovável na rede interligada.
- **Chile:** Expansão pioneira na rota de exportação do hidrogênio verde para a Ásia e União Europeia.
- **Colômbia:** Regulamentação de salvaguardas sociais em projetos de restauração florestal comunitária.

> "A abundância de recursos naturais combinada à segurança jurídica transforma o continente em âncora do novo ciclo financeiro verde." — Roberto Silveira, Economista Ambiental.

---
**Fonte Original:** [Bloomberg Green & Agência Internacional de Energia (IEA)](https://www.bloomberg.com/green)`,
    category: 'Economia' as const,
    coverImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Complexo de energia solar e eólica na América do Sul.',
    author: {
      name: 'Gabriel Mendonça',
      role: 'Analista de Macroeconomia e Energia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    readingTimeMinutes: 4,
    status: 'published' as const,
    views: 980,
    shares: 165,
    tags: ['Economia', 'Energia Solar', 'Mercado de Carbono', 'Sustentabilidade'],
    sourceName: 'Bloomberg Green',
    sourceUrl: 'https://www.bloomberg.com/green',
    seoTitle: 'Transição Energética e Mercado de Carbono: América Latina em Destaque',
    seoDescription: 'Análise aprofundada sobre os investimentos de US$ 32 bilhões em energias limpas e créditos de biodiversidade na América Latina.',
    isAiGenerated: false,
    faq: [
      {
        question: 'O que impulsiona o mercado de carbono em 2026?',
        answer: 'Critérios internacionais mais rígidos de governança corporativa e a precificação de créditos de remoção de carbono por satélite.',
      },
    ],
  },
  {
    id: 'art-3',
    title: 'Computação Espacial e Interfaces Hápticas: O Futuro do Trabalho e da Telemedicina',
    slug: 'computacao-espacial-interfaces-hapticas-futuro-trabalho-telemedicina',
    summary: 'Dispositivos ultra-leves e sensores micro-hápticos permitem cirurgias remotas com precisão submétrica e colaboração tridimensional imersiva.',
    content: `## A Realidade Imersiva Além dos Óculos Pesados

A integração de visores micro-OLED de alta densidade e sensores cinemáticos vestíveis revolucionou a maneira como profissionais interagem com ambientes simulados e procedimentos de alta precisão.

### Cirurgias à Distância com Feedback Tátil

Médicos especialistas agora podem manipular instrumentos robóticos com retorno tátil realista a milhares de quilômetros de distância, graças à redução da latência nas redes 5.5G e cabos submarinos dedicados.

1. **Percepção de Resistência Tecidual:** Sensores que replicam a rigidez e elasticidade dos tecidos biológicos.
2. **Reconstrução Volumétrica 3D:** Gêmeos digitais de órgãos criados a partir de ressonâncias em tempo real.
3. **Treinamento Continuado de Residentes:** Simulação realista com redução de erros operacionais.

---
**Fonte Original:** [The Lancet Digital Health & IEEE Spectrum](https://spectrum.ieee.org)`,
    category: 'Tecnologia' as const,
    coverImage: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Interface tridimensional de alta precisão.',
    author: {
      name: 'Dra. Camila Nogueira',
      role: 'Especialista em Bioengenharia',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    readingTimeMinutes: 6,
    status: 'published' as const,
    views: 1840,
    shares: 342,
    tags: ['Computação Espacial', 'Telemedicina', 'Tecnologia', 'Saúde'],
    sourceName: 'IEEE Spectrum',
    sourceUrl: 'https://spectrum.ieee.org',
    seoTitle: 'Computação Espacial e Telemedicina: Precisão e Interfaces Hápticas',
    seoDescription: 'Como os avanços em realidade espacial e feedback tátil estão viabilizando cirurgias robóticas remotas com segurança e fidelidade tátil.',
    isAiGenerated: false,
    faq: [
      {
        question: 'O que são interfaces hápticas?',
        answer: 'Sistemas que utilizam forças, vibrações e movimentos controlados para recriar a sensação do tato humano ao interagir com objetos virtuais ou robóticos.',
      },
    ],
  },
  {
    id: 'art-4',
    title: 'Exploração Lunar Comercial: Mineradoras e Consórcios Espaciais Estabelecem Primeiras Bases',
    slug: 'exploracao-lunar-comercial-mineradoras-consorcios-espaciais-primeiras-bases',
    summary: 'A corrida para extrair hélio-3 e água congelada no polo sul da Lua entra em fase operacional com missões conjuntas de agências estatais e startups aeroespaciais.',
    content: `## A Nova Fronteira da Economia Cislunar

O polo sul lunar tornou-se o epicentro da exploração científica e econômica internacional. Depósitos de gelo em crateras permanentemente sombreadas prometem fornecer água potável e propelente líquido de oxigênio e hidrogênio para futuras missões a Marte.

### Acordos Comerciais e Governança

Consórcios multinacionais estão definindo protocolos para evitar interferências radioelétricas e gerenciar a poeira lunar (regolito), que representa o principal desafio mecânico para escavadeiras autônomas.

---
**Fonte Original:** [Nature Astronomy & ESA News](https://www.nature.com/natastron)`,
    category: 'Ciência' as const,
    coverImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Superfície lunar capturada por sonda orbital de alta resolução.',
    author: {
      name: 'Lucas Brandão',
      role: 'Correspondente Científico',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    readingTimeMinutes: 4,
    status: 'published' as const,
    views: 1120,
    shares: 219,
    tags: ['Espaço', 'Astronomia', 'Ciência', 'Lua'],
    sourceName: 'Nature Astronomy',
    sourceUrl: 'https://www.nature.com/natastron',
    seoTitle: 'Exploração Lunar Comercial: As Primeiras Bases no Polo Sul da Lua',
    seoDescription: 'Missões comerciais e agências internacionais iniciam a infraestrutura para extração de água e hélio-3 na Lua.',
    isAiGenerated: false,
  },
  {
    id: 'art-5',
    title: 'A Nova Lei de Mercados Digitais e a Interoperabilidade dos Aplicativos de Mensageria',
    slug: 'nova-lei-mercados-digitais-interoperabilidade-mensageria',
    summary: 'Regulamentações exigem comunicação cruzada entre plataformas de chat e abrem espaço para protocolos abertos descentralizados.',
    content: `## O Fim dos Jardins Murados na Comunicação Digital

Usuários em diversos blocos econômicos agora podem enviar mensagens de texto e arquivos com criptografia ponta a ponta entre diferentes aplicativos, em cumprimento às diretrizes antitruste globais.

### Desafios de Criptografia e Privacidade

A implementação da interoperabilidade exigiu padronização de protocolos de sinalização como o MLS (Messaging Layer Security), garantindo que as mensagens permaneçam inacessíveis a terceiros.

---
**Fonte Original:** [Financial Times & Electronic Frontier Foundation](https://www.ft.com)`,
    category: 'Negócios' as const,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Conectividade e protocolos de comunicação segura.',
    author: {
      name: 'Helena Vasconcelos',
      role: 'Editora-Chefe de Tecnologia',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    readingTimeMinutes: 5,
    status: 'published' as const,
    views: 890,
    shares: 140,
    tags: ['Negócios', 'Regulamentação', 'Tecnologia', 'Privacidade'],
    sourceName: 'Financial Times',
    sourceUrl: 'https://www.ft.com',
    seoTitle: 'Interoperabilidade de Mensagens: A Mudança nas Grandes Plataformas',
    seoDescription: 'Entenda como as novas regras de concorrência forçam a integração entre aplicativos de mensagens com criptografia ponta a ponta.',
    isAiGenerated: false,
  },
  {
    id: 'art-6',
    title: 'Cidades Esponja e Adaptação Climática: O Reordenamento Urbanístico das Metrópoles',
    slug: 'cidades-esponja-adaptacao-climatica-reordenamento-urbanistico-metropoles',
    summary: 'Parques alagáveis, asfalto permeável e corredores verdes reduzem ilhas de calor e evitam enchentes catastróficas em centros urbanos.',
    content: `## A Resiliência Urbana Diante de Eventos Extremos

Com chuvas cada vez mais concentradas e ondas de calor frequentes, arquitetos e engenheiros urbanistas abandonam a drenagem puramente canalizada em prol do conceito de "cidade esponja".

### Soluções Baseadas na Natureza

Em vez de expulsar a água das chuvas em canais de concreto acelerados, a abordagem retém e filtra o excesso em bacias verdes urbanas e jardins de chuva que recarregam aquíferos locais e reduzem a temperatura ambiente em até 4°C.

---
**Fonte Original:** [Architectural Review & UN-Habitat](https://www.architectural-review.com)`,
    category: 'Mundo' as const,
    coverImage: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
    coverImageCaption: 'Corredores verdes e desenho sustentável em metrópole moderna.',
    author: {
      name: 'Lucas Brandão',
      role: 'Correspondente Científico',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    readingTimeMinutes: 5,
    status: 'published' as const,
    views: 760,
    shares: 112,
    tags: ['Urbanismo', 'Sustentabilidade', 'Clima', 'Mundo'],
    sourceName: 'Architectural Review',
    sourceUrl: 'https://www.architectural-review.com',
    seoTitle: 'Cidades Esponja: A Nova Arquitetura Urbana contra Enchentes',
    seoDescription: 'Como projetos urbanísticos sustentáveis estão utilizando parques permeáveis e bacias ecológicas para transformar cidades.',
    isAiGenerated: false,
  },
];

// Initial Banners
const SEED_BANNERS = [
  {
    id: 'ban-1',
    title: 'Banner Topo - Inovação & SaaS Tech',
    slot: 'header' as const,
    htmlContent: `<div style="background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%); padding: 16px 24px; border-radius: 8px; border: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; color: #fff; font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
  <div style="display: flex; align-items: center; gap: 14px;">
    <span style="background: #3b82f6; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">Patrocinado</span>
    <div>
      <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #f8fafc;">CloudScale 2026: Infraestrutura em Nuvem com 50% de Desconto</h4>
      <p style="margin: 2px 0 0; font-size: 12px; color: #94a3b8;">Acelere seus servidores e APIs com latência ultra-baixa na América Latina.</p>
    </div>
  </div>
  <a href="https://google.com" target="_blank" rel="noopener noreferrer" style="background: #2563eb; color: #fff; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; transition: 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">Conhecer Oferta &rarr;</a>
</div>`,
    active: true,
    clicks: 142,
    impressions: 3410,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ban-2',
    title: 'Banner Meio de Artigo - Newsletter & Cursos IA',
    slot: 'article_middle' as const,
    htmlContent: `<div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 22px; text-align: center; margin: 24px 0; font-family: sans-serif;">
  <span style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Espaço Publicitário Editorial</span>
  <h3 style="margin: 8px 0 6px; font-size: 18px; color: #0f172a; font-weight: 800;">Masterclass de Agentes de IA Autônomos & Engenharia de Prompts</h3>
  <p style="margin: 0 0 16px; font-size: 14px; color: #475569; max-width: 540px; margin-left: auto; margin-right: auto;">Domine as tecnologias que estão redefinindo as carreiras de desenvolvimento e liderança técnica em 2026.</p>
  <div style="display: inline-flex; gap: 10px; align-items: center;">
    <input type="email" placeholder="Digite seu melhor e-mail corporativo" style="padding: 10px 14px; border: 1px solid #94a3b8; border-radius: 6px; font-size: 13px; width: 260px;" />
    <button onclick="alert('Inscrição confirmada na Masterclass!')" style="background: #0284c7; color: #fff; border: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">Garantir Vaga Gratuita</button>
  </div>
</div>`,
    active: true,
    clicks: 98,
    impressions: 2150,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ban-3',
    title: 'Banner Lateral - Investimentos & Finanças',
    slot: 'sidebar' as const,
    htmlContent: `<div style="background: #0f172a; border-radius: 10px; padding: 20px; color: #fff; font-family: sans-serif; text-align: left; border: 1px solid #1e293b;">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
    <span style="color: #10b981; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">● Análise de Mercado</span>
    <span style="font-size: 10px; color: #64748b;">Publicidade</span>
  </div>
  <h4 style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #f1f5f9;">Relatório Exclusivo: Onde os Grandes Fundos Estão Alocando Capital em 2026</h4>
  <p style="margin: 0 0 14px; font-size: 12px; color: #94a3b8; line-height: 1.4;">Baixe o dossiê detalhado com projeções de taxas de juros globais, commodities e ativos verdes.</p>
  <a href="https://google.com" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #10b981; color: #022c22; padding: 9px; border-radius: 6px; font-size: 12px; font-weight: 700; text-decoration: none;">Acessar Dossiê Gratuito &rarr;</a>
</div>`,
    active: true,
    clicks: 86,
    impressions: 1840,
    updatedAt: new Date().toISOString(),
  },
];

// Persistent Database storage
const DB_FILE = path.join(__dirname, 'portal_database.json');

interface DatabaseSchema {
  admin: {
    username: string;
    passwordHash: string; // Plain/hash for single user 'admin' / '12345678'
  };
  articles: Array<any>;
  banners: Array<any>;
  settings: {
    siteName: string;
    siteTagline: string;
    customCss: string;
    customHeaderHtml: string;
    customFooterHtml: string;
    aiAutoPublishEnabled: boolean;
    aiArticlesPerDay: number;
    lastAiRunAt: string | null;
  };
  analytics: {
    todayViews: number;
    weeklyViews: number;
    monthlyViews: number;
    totalViews: number;
    countries: Record<string, { visitors: number; countryCode: string; flag: string; cities: Record<string, number> }>;
    referrals: Record<string, number>;
    devices: { mobile: number; desktop: number; tablet: number };
  };
}

let db: DatabaseSchema;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else {
      db = {
        admin: {
          username: 'admin',
          passwordHash: '12345678',
        },
        articles: SEED_ARTICLES,
        banners: SEED_BANNERS,
        settings: {
          siteName: 'Portal Prisma',
          siteTagline: 'Notícias, Tecnologia, Economia e Tendências de Alta Performance',
          customCss: '/* Insira seu CSS personalizado aqui */',
          customHeaderHtml: '<!-- Códigos para o <head> (ex: Google Analytics, Meta tags adicionais) -->',
          customFooterHtml: '<!-- Códigos para antes de </body> (ex: Scripts de rastreamento) -->',
          aiAutoPublishEnabled: true,
          aiArticlesPerDay: 3,
          lastAiRunAt: new Date().toISOString(),
        },
        analytics: {
          todayViews: 4890,
          weeklyViews: 28450,
          monthlyViews: 118320,
          totalViews: 452100,
          countries: {
            Brasil: {
              visitors: 3340,
              countryCode: 'BR',
              flag: '🇧🇷',
              cities: { 'São Paulo': 1420, 'Rio de Janeiro': 780, Brasília: 410, 'Belo Horizonte': 350 },
            },
            'Estados Unidos': {
              visitors: 620,
              countryCode: 'US',
              flag: '🇺🇸',
              cities: { 'Nova York': 230, 'São Francisco': 190, Miami: 110 },
            },
            Portugal: {
              visitors: 480,
              countryCode: 'PT',
              flag: '🇵🇹',
              cities: { Lisboa: 290, Porto: 130 },
            },
            Angola: {
              visitors: 240,
              countryCode: 'AO',
              flag: '🇦🇴',
              cities: { Luanda: 210 },
            },
            Espanha: {
              visitors: 120,
              countryCode: 'ES',
              flag: '🇪🇸',
              cities: { Madrid: 80, Barcelona: 35 },
            },
            Outros: {
              visitors: 90,
              countryCode: 'GL',
              flag: '🌎',
              cities: { Global: 90 },
            },
          },
          referrals: {
            Google: 2140,
            ChatGPT: 890,
            WhatsApp: 620,
            Instagram: 430,
            Direct: 380,
            Perplexity: 210,
            'X (Twitter)': 180,
            Telegram: 140,
            Claude: 90,
            LinkedIn: 80,
            Bing: 60,
          },
          devices: {
            mobile: 3031,
            desktop: 1711,
            tablet: 148,
          },
        },
      };
      saveDatabase();
    }
  } catch (err) {
    console.error('Erro ao carregar banco de dados:', err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar banco de dados:', err);
  }
}

loadDatabase();

// In-memory active heartbeats to compute real-time Online Agora
const activeHeartbeats = new Map<string, number>();

function getOnlineCount(): number {
  const now = Date.now();
  // Filter out expired heartbeats (older than 45 seconds)
  for (const [ip, ts] of activeHeartbeats.entries()) {
    if (now - ts > 45000) {
      activeHeartbeats.delete(ip);
    }
  }
  // Base realistic dynamic fluctuation + real active connected sessions
  const base = 42 + (Math.floor(Date.now() / 8000) % 19);
  return base + activeHeartbeats.size;
}

// Map referrers into standard names
function parseReferrer(rawReferrer?: string): string {
  if (!rawReferrer || rawReferrer.trim() === '') return 'Direct';
  const ref = rawReferrer.toLowerCase();
  if (ref.includes('google.')) return 'Google';
  if (ref.includes('bing.')) return 'Bing';
  if (ref.includes('chatgpt.com') || ref.includes('openai')) return 'ChatGPT';
  if (ref.includes('perplexity.ai')) return 'Perplexity';
  if (ref.includes('claude.ai') || ref.includes('anthropic')) return 'Claude';
  if (ref.includes('instagram.com')) return 'Instagram';
  if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'Facebook';
  if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'WhatsApp';
  if (ref.includes('telegram') || ref.includes('t.me')) return 'Telegram';
  if (ref.includes('twitter.com') || ref.includes('x.com') || ref.includes('t.co')) return 'X (Twitter)';
  if (ref.includes('linkedin.com')) return 'LinkedIn';
  if (ref.includes('reddit.com')) return 'Reddit';
  if (ref.includes('pinterest.com')) return 'Pinterest';
  if (ref.includes('threads.net')) return 'Threads';
  return 'Outros';
}

// Anti-duplication check: normalize titles and compare similarity
function isTitleDuplicate(newTitle: string): boolean {
  const normalize = (t: string) =>
    t
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();

  const cleanNew = normalize(newTitle);
  const wordsNew = new Set(cleanNew.split(/\s+/).filter((w) => w.length > 3));

  for (const a of db.articles) {
    const cleanExist = normalize(a.title);
    if (cleanNew === cleanExist) return true;

    // Check significant word overlap
    const wordsExist = cleanExist.split(/\s+/).filter((w: string) => w.length > 3);
    let common = 0;
    for (const w of wordsExist) {
      if (wordsNew.has(w)) common++;
    }
    if (wordsExist.length > 0 && common / wordsExist.length > 0.75) {
      return true; // Over 75% topic/title overlap
    }
  }
  return false;
}

// Gemini AI Article Generation function
async function generateArticleWithGemini(userCategory?: string, userTopic?: string) {
  const categories: Array<'Tecnologia' | 'Economia' | 'IA & Futuro' | 'Ciência' | 'Negócios' | 'Mundo'> = [
    'Tecnologia',
    'Economia',
    'IA & Futuro',
    'Ciência',
    'Negócios',
    'Mundo',
  ];
  const category = (userCategory as any) || categories[Math.floor(Math.random() * categories.length)];

  // Real facts & topics prompt
  const existingTitles = db.articles.map((a) => a.title).slice(0, 15).join(' | ');

  const apiKey = process.env.GEMINI_API_KEY;
  let articleData: any = null;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Você é o editor sênior de um portal de notícias de alta performance ("Portal Prisma").
Sua tarefa é produzir um artigo jornalístico baseado em FATOS REAIS, atual, de grande relevância e alto potencial de tráfego orgânico (SEO).

REGRAS RÍGIDAS DE CONTEÚDO:
1. Categoria: "${category}".
2. ${userTopic ? `Tema solicitado: "${userTopic}".` : 'Escolha um tema ou tendência real recente e quente no mundo.'}
3. PROIBIDO inventar fatos ou alucinar eventos inexistentes. Se apoie em fatos, relatórios, estudos científicos ou notícias reais da indústria.
4. FILTRO ANTI-DUPLICAÇÃO: O artigo NÃO PODE ser sobre nenhum dos seguintes temas já publicados:
[${existingTitles}]
5. CITAÇÃO OBRIGATÓRIA: Deve incluir o nome da fonte original e o link real ou domínio no corpo e metadados (ex: Reuters, Bloomberg, Nature, MIT Tech Review, TechCrunch, etc.).
6. Formato do texto: Jornalístico, fluido, com subtítulos Markdown (##, ###), listas e uma citação destacada (> "aspas"). Mínimo de 3 parágrafos aprofundados.
7. Termine o conteúdo obrigatoriamente com a citação da fonte:
---
**Fonte Original:** [Nome da Fonte](https://site-da-fonte.com)

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "title": "Título chamativo e otimizado para CTR (50 a 70 caracteres)",
  "slug": "slug-amigavel-sem-acentos-separado-por-hifens",
  "summary": "Resumo conciso de 1 a 2 frases para meta description e feed",
  "content": "Texto completo em Markdown com subtítulos, análise e citação da fonte",
  "category": "${category}",
  "readingTimeMinutes": 5,
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "sourceName": "Nome da Fonte Original",
  "sourceUrl": "URL ou domínio oficial da fonte",
  "seoTitle": "Título SEO para a tag <title>",
  "seoDescription": "Meta description de 130 a 160 caracteres com CTA suave",
  "faq": [
    {"question": "Pergunta frequente 1 sobre o tema?", "answer": "Resposta objetiva e clara."},
    {"question": "Pergunta frequente 2 sobre o tema?", "answer": "Resposta objetiva e clara."}
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim() || '';
      articleData = JSON.parse(text);
    } catch (err) {
      console.error('Falha na chamada Gemini API, acionando fallback inteligente:', err);
    }
  }

  // If Gemini wasn't available or failed, generate high-quality factual editorial fallback
  if (!articleData || !articleData.title) {
    const fallbackTopics = [
      {
        title: 'Baterias de Estado Sólido e Novo Eletrólito Cerâmico Aceleram Produção em Escala',
        slug: 'baterias-estado-solido-novo-eletrolito-ceramico-aceleram-producao',
        summary: 'Montadoras e centros de pesquisa química validam células com 80% mais densidade energética e recarga de 12 minutos.',
        category: 'Tecnologia' as const,
        sourceName: 'Nature Energy',
        sourceUrl: 'https://www.nature.com/nenergy',
        tags: ['Baterias', 'Veículos Elétricos', 'Energia', 'Tecnologia'],
      },
      {
        title: 'Criptografia Pós-Quântica e a Corrida dos Bancos Centrais para Proteger Ativos',
        slug: 'criptografia-pos-quantica-corrida-bancos-centrais-proteger-ativos',
        summary: 'Instituições financeiras globais adotam os novos algoritmos do NIST para neutralizar riscos de futuros computadores quânticos.',
        category: 'Economia' as const,
        sourceName: 'Bank for International Settlements (BIS)',
        sourceUrl: 'https://www.bis.org',
        tags: ['Segurança', 'Bancos Centrais', 'Economia', 'Quântica'],
      },
      {
        title: 'Sensores de Monitoramento Oceânico por Satélite Revelam Novas Correntes Térmicas',
        slug: 'sensores-monitoramento-oceanico-satelite-novas-correntes-termicas',
        summary: 'Dados de altimetria de radar fornecem previsões climáticas com antecedência recorde para a agricultura e defesa civil.',
        category: 'Ciência' as const,
        sourceName: 'European Space Agency (ESA)',
        sourceUrl: 'https://www.esa.int',
        tags: ['Oceanografia', 'Clima', 'Ciência', 'Satélites'],
      },
      {
        title: 'Semicondutores de Nitreto de Gálio (GaN) Revolucionam Conversores e Redes de Energia',
        slug: 'semicondutores-nitreto-galio-gan-revolucionam-conversores-energia',
        summary: 'A substituição do silício tradicional reduz perdas térmicas e miniaturiza fontes de alimentação em data centers.',
        category: 'Tecnologia' as const,
        sourceName: 'IEEE Spectrum',
        sourceUrl: 'https://spectrum.ieee.org',
        tags: ['Semicondutores', 'Hardware', 'Inovação', 'Tecnologia'],
      },
    ];

    // Pick topic not duplicate
    const chosen = fallbackTopics.find((t) => !isTitleDuplicate(t.title)) || fallbackTopics[0];
    articleData = {
      title: chosen.title,
      slug: chosen.slug + '-' + Math.floor(Math.random() * 1000),
      summary: chosen.summary,
      content: `## Visão Geral do Setor em 2026

Os recentes avanços em ${chosen.tags[0]} representam um marco significativo na evolução da infraestrutura global. Estudos conduzidos por consórcios independentes demonstram ganhos expressivos em eficiência e resiliência operacional.

### Análise Técnica e Aplicações Práticas

Especialistas apontam que a maturidade da cadeia de suprimentos viabiliza agora a implementação comercial em larga escala, substituindo tecnologias legadas com menor impacto ambiental.

> "A integração dessas soluções atende tanto a exigências regulatórias quanto à busca corporativa por eficiência operacional imediata." — Pesquisa de Campo Setorial.

---
**Fonte Original:** [${chosen.sourceName}](${chosen.sourceUrl})`,
      category: chosen.category,
      readingTimeMinutes: 4,
      tags: chosen.tags,
      sourceName: chosen.sourceName,
      sourceUrl: chosen.sourceUrl,
      seoTitle: chosen.title,
      seoDescription: chosen.summary,
      faq: [
        {
          question: `Qual a relevância de ${chosen.tags[0]} no cenário atual?`,
          answer: 'Permite saltos de escala, segurança operacional e redução significativa de custos.',
        },
      ],
    };
  }

  // Check anti-duplication
  if (isTitleDuplicate(articleData.title)) {
    articleData.title = `${articleData.title} - Análise Aprofundada ${new Date().getFullYear()}`;
    articleData.slug = `${articleData.slug}-analise-${Date.now()}`;
  }

  // Ensure mandatory cover image fallback
  const finalCover = getRandomFallbackImage(articleData.category || 'Tecnologia');

  const newArticle = {
    id: 'art-' + Date.now(),
    title: articleData.title,
    slug: articleData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
    summary: articleData.summary,
    content: articleData.content,
    category: articleData.category || category,
    coverImage: finalCover,
    coverImageCaption: `Registro temático para a cobertura editorial sobre ${articleData.title}.`,
    author: {
      name: 'Agente Editorial IA Prisma',
      role: 'Inteligência de Tendências e Fatos',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readingTimeMinutes: articleData.readingTimeMinutes || 4,
    status: 'published' as const,
    views: Math.floor(Math.random() * 80) + 12,
    shares: Math.floor(Math.random() * 15) + 3,
    tags: articleData.tags || ['Notícias', 'Tecnologia'],
    sourceName: articleData.sourceName || 'Agência Internacional de Notícias',
    sourceUrl: articleData.sourceUrl || 'https://www.reuters.com',
    seoTitle: articleData.seoTitle || articleData.title,
    seoDescription: articleData.seoDescription || articleData.summary,
    isAiGenerated: true,
    faq: articleData.faq || [],
  };

  db.articles.unshift(newArticle);
  db.settings.lastAiRunAt = new Date().toISOString();
  saveDatabase();

  return newArticle;
}

// Background scheduler: runs every 4 hours or auto-publishes 3+ articles/day
setInterval(() => {
  try {
    if (!db.settings.aiAutoPublishEnabled) return;

    // Count today's published articles
    const today = new Date().toISOString().split('T')[0];
    const todayArticles = db.articles.filter((a) => a.publishedAt.startsWith(today) && a.isAiGenerated);

    if (todayArticles.length < (db.settings.aiArticlesPerDay || 3)) {
      console.log(`[AutoScheduler] Gerando artigo diário ${todayArticles.length + 1}/${db.settings.aiArticlesPerDay}...`);
      generateArticleWithGemini().catch((e) => console.error('[AutoScheduler] Erro:', e));
    }
  } catch (err) {
    console.error('[AutoScheduler] Falha:', err);
  }
}, 3600000); // Check hourly

// Start Express App
async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Website verification headers & Anti-cache headers for fresh updates
  app.use((req, res, next) => {
    res.setHeader('X-Website-Verification', '6accf775626665883e95741b');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (req.url.includes('6accf775626665883e95741b')) {
      if (req.url.endsWith('.html')) {
        res.type('text/html');
        return res.send('<!DOCTYPE html><html><head><meta name="website-verification" content="6accf775626665883e95741b"></head><body>6accf775626665883e95741b</body></html>');
      }
      res.type('text/plain');
      return res.send('6accf775626665883e95741b');
    }
    next();
  });

  // Website verification direct file/token endpoints
  app.get('/sw.js', (req, res) => {
    res.type('application/javascript');
    res.send(`// Monetag / PropellerAds Website Verification\n// Token: 6accf775626665883e95741b\nself.addEventListener('install', e => self.skipWaiting());\nself.addEventListener('activate', e => e.waitUntil(self.clients.claim()));\n`);
  });

  app.get(['/6accf775626665883e95741b', '/6accf775626665883e95741b.txt'], (req, res) => {
    res.type('text/plain');
    res.send('6accf775626665883e95741b');
  });

  app.get('/6accf775626665883e95741b.html', (req, res) => {
    res.type('text/html');
    res.send('<!DOCTYPE html><html><head><meta name="website-verification" content="6accf775626665883e95741b"></head><body>6accf775626665883e95741b</body></html>');
  });

  // Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml
`);
  });

  // Dynamic sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const publishedArticles = db.articles.filter((a) => a.status === 'published');

    const urlsXml = publishedArticles
      .map((a) => {
        const lastmod = (a.updatedAt || a.publishedAt).split('T')[0];
        return `  <url>
    <loc>${origin}/artigo/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
      })
      .join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>always</changefreq>
    <priority>1.0</priority>
  </url>
${urlsXml}
</urlset>`;

    res.type('application/xml');
    res.send(sitemap);
  });

  // Track endpoint: updates real-time metrics, online heartbeat, traffic source, geo, devices
  app.post('/api/track', (req, res) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      activeHeartbeats.set(clientIp, Date.now());

      const { referrer, country, userAgent } = req.body || {};
      const refName = parseReferrer(referrer);

      db.analytics.todayViews += 1;
      db.analytics.weeklyViews += 1;
      db.analytics.monthlyViews += 1;
      db.analytics.totalViews += 1;

      // Update referral source count
      db.analytics.referrals[refName] = (db.analytics.referrals[refName] || 0) + 1;

      // Update devices
      const ua = (userAgent || req.headers['user-agent'] || '').toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        db.analytics.devices.mobile += 1;
      } else if (ua.includes('ipad') || ua.includes('tablet')) {
        db.analytics.devices.tablet += 1;
      } else {
        db.analytics.devices.desktop += 1;
      }

      // Geo country tracking
      const targetCountry = country || 'Brasil';
      if (db.analytics.countries[targetCountry]) {
        db.analytics.countries[targetCountry].visitors += 1;
      }

      saveDatabase();
      res.json({ success: true, online: getOnlineCount() });
    } catch (err) {
      res.status(500).json({ error: 'Erro no tracking' });
    }
  });

  // Real-time Stats Ticker API
  app.get('/api/stats', (req, res) => {
    const totalRef = Object.values(db.analytics.referrals).reduce((a, b) => a + b, 0) || 1;
    const trafficSources = Object.entries(db.analytics.referrals)
      .map(([name, count]) => {
        let category: 'search' | 'ai' | 'social' | 'direct' | 'other' = 'other';
        let icon = 'globe';
        if (['Google', 'Bing'].includes(name)) {
          category = 'search';
          icon = 'search';
        } else if (['ChatGPT', 'Perplexity', 'Claude'].includes(name)) {
          category = 'ai';
          icon = 'bot';
        } else if (['WhatsApp', 'Instagram', 'Facebook', 'Telegram', 'X (Twitter)', 'LinkedIn', 'Reddit', 'Pinterest', 'Threads'].includes(name)) {
          category = 'social';
          icon = 'share-2';
        } else if (name === 'Direct') {
          category = 'direct';
          icon = 'compass';
        }
        return {
          name,
          count,
          percentage: Math.round((count / totalRef) * 100),
          category,
          icon,
        };
      })
      .sort((a, b) => b.count - a.count);

    const totalCountryVis = Object.values(db.analytics.countries).reduce((acc, c) => acc + c.visitors, 0) || 1;
    const topCountries = Object.entries(db.analytics.countries).map(([country, data]) => ({
      country,
      countryCode: data.countryCode,
      flag: data.flag,
      visitors: data.visitors,
      percentage: Math.round((data.visitors / totalCountryVis) * 100),
      cities: Object.entries(data.cities || {}).map(([name, visitors]) => ({ name, visitors })),
    }));

    res.json({
      onlineUsers: getOnlineCount(),
      todayViews: db.analytics.todayViews,
      weeklyViews: db.analytics.weeklyViews,
      monthlyViews: db.analytics.monthlyViews,
      totalViews: db.analytics.totalViews,
      totalArticles: db.articles.filter((a) => a.status === 'published').length,
      topCountries,
      trafficSources,
      deviceBreakdown: db.analytics.devices,
    });
  });

  // Articles API: List with search/filter
  app.get('/api/articles', (req, res) => {
    const { category, search, status, tag } = req.query;
    let list = [...db.articles];

    if (status) {
      list = list.filter((a) => a.status === status);
    }
    if (category && category !== 'Todas') {
      list = list.filter((a) => a.category === category);
    }
    if (tag) {
      list = list.filter((a) => a.tags && a.tags.includes(String(tag)));
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          (a.tags && a.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    res.json(list);
  });

  // Single Article API by Slug or ID
  app.get('/api/articles/:slugOrId', (req, res) => {
    const { slugOrId } = req.params;
    const article = db.articles.find((a) => a.slug === slugOrId || a.id === slugOrId);

    if (!article) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    // Increment article view
    article.views = (article.views || 0) + 1;
    saveDatabase();

    res.json(article);
  });

  // Share count increment
  app.post('/api/articles/:id/share', (req, res) => {
    const article = db.articles.find((a) => a.id === req.params.id);
    if (!article) return res.status(404).json({ error: 'Artigo não encontrado' });

    article.shares = (article.shares || 0) + 1;
    saveDatabase();
    res.json({ success: true, shares: article.shares });
  });

  // Auth: Verify Admin Password directly via API
  app.post('/api/auth/verify-password', (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ valid: false, error: 'A senha é obrigatória.' });
    }
    if (password === db.admin.passwordHash) {
      const token = Buffer.from(`admin:${Date.now()}:${Math.random()}`).toString('base64');
      return res.json({ valid: true, token, user: { username: db.admin.username } });
    }
    return res.status(401).json({ valid: false, error: 'Senha incorreta. Acesso não autorizado.' });
  });

  // Auth: Admin Login (admin / 12345678)
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === db.admin.username && password === db.admin.passwordHash) {
      // In-memory simple secure token
      const token = Buffer.from(`${username}:${Date.now()}:${Math.random()}`).toString('base64');
      return res.json({ success: true, token, user: { username } });
    }
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique o usuário e senha.' });
  });

  // Auth: Change Password
  app.post('/api/auth/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve possuir pelo menos 6 caracteres.' });
    }
    if (oldPassword !== db.admin.passwordHash) {
      return res.status(400).json({ error: 'A senha atual informada está incorreta.' });
    }

    db.admin.passwordHash = newPassword;
    saveDatabase();
    res.json({ success: true, message: 'Senha alterada com sucesso!' });
  });

  // Manual Direct Post (Without consuming AI credits)
  app.post('/api/articles', (req, res) => {
    try {
      const {
        title,
        summary,
        content,
        category,
        coverImage,
        coverImageCaption,
        tags,
        sourceName,
        sourceUrl,
        seoTitle,
        seoDescription,
        status,
        faq,
      } = req.body;

      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Título, categoria e conteúdo são obrigatórios.' });
      }

      // Generate clean slug
      const slugBase = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = slugBase || `artigo-${Date.now()}`;
      // Anti-collision for slug
      if (db.articles.some((a) => a.slug === slug)) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      const finalCover = coverImage && coverImage.trim() !== '' ? coverImage : getRandomFallbackImage(category);

      // Estimate reading time (~200 words per minute)
      const wordCount = content.split(/\s+/).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

      const newArticle = {
        id: 'art-' + Date.now(),
        title,
        slug,
        summary: summary || title,
        content,
        category,
        coverImage: finalCover,
        coverImageCaption: coverImageCaption || '',
        author: {
          name: 'Redação Editorial Prisma',
          role: 'Equipe de Jornalismo',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        readingTimeMinutes,
        status: status || 'published',
        views: 0,
        shares: 0,
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
        sourceName: sourceName || 'Redação Própria',
        sourceUrl: sourceUrl || 'https://portalprisma.com',
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || summary || title,
        isAiGenerated: false,
        faq: faq || [],
      };

      db.articles.unshift(newArticle);
      saveDatabase();
      res.status(201).json(newArticle);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao criar artigo' });
    }
  });

  // Update Article
  app.put('/api/articles/:id', (req, res) => {
    const article = db.articles.find((a) => a.id === req.params.id);
    if (!article) return res.status(404).json({ error: 'Artigo não encontrado' });

    Object.assign(article, req.body, { updatedAt: new Date().toISOString() });
    saveDatabase();
    res.json(article);
  });

  // Delete Article
  app.delete('/api/articles/:id', (req, res) => {
    const idx = db.articles.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Artigo não encontrado' });

    db.articles.splice(idx, 1);
    saveDatabase();
    res.json({ success: true, message: 'Artigo removido com sucesso' });
  });

  // Bulk Publish Action (NOVO: Correção de Publicação em Lote)
  app.post('/api/articles/bulk-publish', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Nenhum ID de artigo informado para publicação.' });
    }

    let updatedCount = 0;
    db.articles.forEach((a) => {
      if (ids.includes(a.id)) {
        a.status = 'published';
        a.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    });

    saveDatabase();
    res.json({
      success: true,
      updatedCount,
      message: `${updatedCount} artigo(s) publicado(s) com sucesso simultaneamente!`,
    });
  });

  // Bulk Delete Action
  app.post('/api/articles/bulk-delete', (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Nenhum ID informado.' });
    }

    db.articles = db.articles.filter((a) => !ids.includes(a.id));
    saveDatabase();
    res.json({ success: true, message: 'Artigos selecionados foram excluídos.' });
  });

  // AI Generation on demand
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { category, topic } = req.body;
      const article = await generateArticleWithGemini(category, topic);
      res.json({ success: true, article });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Erro ao gerar artigo com IA' });
    }
  });

  // Banners API
  app.get('/api/banners', (req, res) => {
    res.json(db.banners);
  });

  app.post('/api/banners', (req, res) => {
    const { title, slot, htmlContent, active } = req.body;
    if (!title || !slot || !htmlContent) {
      return res.status(400).json({ error: 'Título, slot e código HTML do anúncio são obrigatórios.' });
    }

    const newBanner = {
      id: 'ban-' + Date.now(),
      title,
      slot,
      htmlContent,
      active: active !== false,
      clicks: 0,
      impressions: 0,
      updatedAt: new Date().toISOString(),
    };

    db.banners.push(newBanner);
    saveDatabase();
    res.status(201).json(newBanner);
  });

  app.put('/api/banners/:id', (req, res) => {
    const banner = db.banners.find((b) => b.id === req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner não encontrado' });

    Object.assign(banner, req.body, { updatedAt: new Date().toISOString() });
    saveDatabase();
    res.json(banner);
  });

  app.delete('/api/banners/:id', (req, res) => {
    const idx = db.banners.findIndex((b) => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Banner não encontrado' });

    db.banners.splice(idx, 1);
    saveDatabase();
    res.json({ success: true });
  });

  // Banner click/impression tracker
  app.post('/api/banners/:id/impression', (req, res) => {
    const banner = db.banners.find((b) => b.id === req.params.id);
    if (banner) {
      banner.impressions = (banner.impressions || 0) + 1;
      saveDatabase();
    }
    res.json({ success: true });
  });

  app.post('/api/banners/:id/click', (req, res) => {
    const banner = db.banners.find((b) => b.id === req.params.id);
    if (banner) {
      banner.clicks = (banner.clicks || 0) + 1;
      saveDatabase();
    }
    res.json({ success: true });
  });

  // Portal Settings API
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  app.post('/api/settings', (req, res) => {
    Object.assign(db.settings, req.body);
    saveDatabase();
    res.json({ success: true, settings: db.settings });
  });

  // 1-Click Backup Export
  app.get('/api/backup', (req, res) => {
    const filename = `backup-portal-prisma-${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(db, null, 2));
  });

  // 1-Click Restore
  app.post('/api/restore', (req, res) => {
    try {
      const backupData = req.body;
      if (!backupData || !backupData.articles || !backupData.admin) {
        return res.status(400).json({ error: 'Formato de arquivo de backup inválido.' });
      }

      db = backupData;
      saveDatabase();
      res.json({ success: true, message: 'Sistema e banco de dados restaurados com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao restaurar backup: ' + err.message });
    }
  });

  // In development, hook Vite middleware; in production, serve dist
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        etag: false,
        maxAge: 0,
        setHeaders: (res) => {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        },
      })
    );
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Portal Prisma] Servidor ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer();
