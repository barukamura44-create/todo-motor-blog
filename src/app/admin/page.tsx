'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId: number;
  status: 'draft' | 'published';
  tags?: string | null;
  sourceUrl?: string | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  accentColor?: string | null;
}

interface Lead {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  segment: 'anunciante' | 'lojista' | 'comprador' | 'outro';
  categoryInterest?: string | null;
  message?: string | null;
  source?: string | null;
  createdAt?: Date | string;
}

interface ScrapingSource {
  id: number;
  name: string;
  url: string;
  categoryId: number;
  type: 'rss' | 'html';
  keywords?: string | null;
  isActive: boolean;
  lastScrapedAt?: Date | string | null;
}

interface ScrapedItem {
  id: number;
  sourceId: number;
  originalUrl: string;
  originalTitle?: string | null;
  rawContent?: string | null;
  status: 'pending' | 'processing' | 'published' | 'rejected';
  createdAt?: Date | string;
}

// ─── Initial Demo Data ────────────────────────────────────────────────────────

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Veículos', slug: 'veiculos', icon: '🚗', accentColor: '#F5C800' },
  { id: 2, name: 'Barcos', slug: 'barcos', icon: '⛵', accentColor: '#0066CC' },
  { id: 3, name: 'Aeronaves', slug: 'aeronaves', icon: '✈️', accentColor: '#6B48FF' },
  { id: 4, name: 'Agrícola', slug: 'agricola', icon: '🌾', accentColor: '#22C55E' },
  { id: 5, name: 'Terraplenagem', slug: 'terraplenagem', icon: '🏗️', accentColor: '#F97316' },
  { id: 6, name: 'Transporte Pesado', slug: 'transportes-pesados', icon: '🚛', accentColor: '#EF4444' },
  { id: 7, name: 'Lançamentos', slug: 'lancamentos', icon: '🚀', accentColor: '#EC4899' },
  { id: 8, name: 'Eventos', slug: 'eventos', icon: '📅', accentColor: '#8B5CF6' },
  { id: 9, name: 'Jet Ski', slug: 'jetski', icon: '🌊', accentColor: '#06B6D4' },
  { id: 10, name: 'Drones', slug: 'drones', icon: '🛸', accentColor: '#10B981' },
  { id: 11, name: 'Helicópteros', slug: 'helicopteros', icon: '🚁', accentColor: '#6366F1' },
];

const INITIAL_POSTS: Post[] = [
  { id: 1, title: 'New Holland lança nova colheitadeira T6 com câmbio automático revolucionário', slug: 'new-holland-t6-cambio', excerpt: 'Fabricante apresenta tecnologia exclusiva que aumenta produtividade em até 22% em condições adversas.', content: 'Conteúdo completo da matéria...', categoryId: 4, coverImage: '/category-agricola.jpg', status: 'published', publishedAt: new Date() },
  { id: 2, title: 'Mercado de lanchas cresce 34% no Brasil com destaque para embarcações regionais', slug: 'lanchas-crescimento', excerpt: 'Setor náutico bate recorde de vendas no primeiro semestre, impulsionado pela região Sul e Nordeste.', content: 'Conteúdo da matéria sobre lanchas...', categoryId: 2, coverImage: '/category-barcos.jpg', status: 'published', publishedAt: new Date() },
  { id: 3, title: 'ANAC regulamenta uso de drones para pulverização em lavouras de grande porte', slug: 'anac-drones-lavouras', excerpt: 'Nova normativa abre mercado bilionário para operadores de VANT no agronegócio brasileiro.', content: 'Conteúdo regulamentação ANAC...', categoryId: 10, coverImage: '/category-drones.jpg', status: 'draft', createdAt: new Date() },
];

const INITIAL_LEADS: Lead[] = [
  { id: 1, name: 'Carlos Eduardo Silva', phone: '(11) 98765-4321', email: 'carlos@agromaquinas.com.br', segment: 'anunciante', categoryInterest: 'agricola', message: 'Tenho 3 tratores New Holland para anunciar na plataforma.', source: 'header-cta', createdAt: new Date() },
  { id: 2, name: 'Mariana Oliveira', phone: '(47) 99123-8877', email: 'mariana@nauticalider.com', segment: 'lojista', categoryInterest: 'nautica', message: 'Gostaria de saber opções de banner e publicidade no blog.', source: 'lead-banner-posts', createdAt: new Date() },
];

const INITIAL_SOURCES: ScrapingSource[] = [
  { id: 1, name: 'Canal Rural', url: 'https://www.canalrural.com.br/feed/', categoryId: 4, type: 'rss', keywords: 'trator, colheitadeira, máquina', isActive: true, lastScrapedAt: new Date() },
  { id: 2, name: 'ANFAVEA - Notícias', url: 'https://anfavea.com.br/feed', categoryId: 7, type: 'rss', keywords: 'veículo, carro, lançamento', isActive: true, lastScrapedAt: new Date() },
  { id: 3, name: 'Náutica Online', url: 'https://nauticaonline.uol.com.br/feed/', categoryId: 2, type: 'rss', keywords: 'lancha, barco, iate', isActive: true, lastScrapedAt: new Date() },
];

const INITIAL_SCRAPED_ITEMS: ScrapedItem[] = [
  { id: 1, sourceId: 1, originalUrl: 'https://canalrural.com.br/noticias/nova-tecnologia-tratores-2026', originalTitle: 'Nova tecnologia promete reduzir consumo de diesel em tratores em 18%', rawContent: 'Fabricante de tratores anuncia novo motor híbrido para a linha 2026...', status: 'pending', createdAt: new Date() },
  { id: 2, sourceId: 2, originalUrl: 'https://anfavea.com.br/noticias/vendas-veiculos-pesados-agosto', originalTitle: 'Vendas de veículos pesados crescem 12% no último trimestre', rawContent: 'Relatório da ANFAVEA destaca recuperação do setor de transportes...', status: 'pending', createdAt: new Date() },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'ai' | 'scraper' | 'leads' | 'agent'>('posts');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [sources, setSources] = useState<ScrapingSource[]>(INITIAL_SOURCES);
  const [scrapedItems, setScrapedItems] = useState<ScrapedItem[]>(INITIAL_SCRAPED_ITEMS);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    categoryId: 1,
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'draft' as 'draft' | 'published',
    tags: '',
  });

  // AI Generator state
  const [aiMode, setAiMode] = useState<'url' | 'text'>('url');
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ title: string; excerpt: string; content: string } | null>(null);

  // New RSS Source state
  const [newSource, setNewSource] = useState({ name: '', url: '', categoryId: 4, keywords: '' });
  const [scraperRunning, setScraperRunning] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Agent state
  interface AgentArticle {
    originalUrl: string; originalTitle: string; categorySlug: string; categoryName: string;
    sourceName: string; agentScore: number; rewrittenTitle: string; rewrittenContent: string;
    excerpt: string; reelsScript: string; instagramCaption: string; twitterText: string;
    suggestedImageUrl: string; hashtags: string[];
  }
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentQueue, setAgentQueue] = useState<AgentArticle[]>([]);
  const [agentLastRun, setAgentLastRun] = useState<string | null>(null);
  const [agentErrors, setAgentErrors] = useState<string[]>([]);
  const [expandedReels, setExpandedReels] = useState<string | null>(null);

  function showNotification(text: string, type: 'success' | 'info' = 'success') {
    setNotifyMsg({ text, type });
    setTimeout(() => setNotifyMsg(null), 4000);
  }

  // ─── Post Actions ───────────────────────────────────────────────────────────

  function handleOpenCreate() {
    setEditingPostId(null);
    setPostForm({
      title: '',
      slug: '',
      categoryId: 1,
      excerpt: '',
      content: '',
      coverImage: '/category-veiculos.jpg',
      status: 'draft',
      tags: '',
    });
    setIsFormOpen(true);
  }

  function handleOpenEdit(post: Post) {
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      slug: post.slug,
      categoryId: post.categoryId,
      excerpt: post.excerpt || '',
      content: post.content,
      coverImage: post.coverImage || '',
      status: post.status,
      tags: post.tags || '',
    });
    setIsFormOpen(true);
  }

  function handleSavePost(e: React.FormEvent) {
    e.preventDefault();
    const slug = postForm.slug || postForm.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    if (editingPostId) {
      setPosts(prev => prev.map(p => p.id === editingPostId ? {
        ...p,
        ...postForm,
        slug,
        publishedAt: postForm.status === 'published' ? new Date() : p.publishedAt,
        updatedAt: new Date(),
      } : p));
      showNotification('Notícia atualizada com sucesso!');
    } else {
      const newPost: Post = {
        id: Date.now(),
        ...postForm,
        slug,
        publishedAt: postForm.status === 'published' ? new Date() : null,
        createdAt: new Date(),
      };
      setPosts(prev => [newPost, ...prev]);
      showNotification('Notícia criada com sucesso!');
    }
    setIsFormOpen(false);
  }

  function handleDeletePost(id: number) {
    if (confirm('Tem certeza que deseja excluir esta notícia?')) {
      setPosts(prev => prev.filter(p => p.id !== id));
      showNotification('Notícia excluída.', 'info');
    }
  }

  // ─── AI Generation ─────────────────────────────────────────────────────────

  function handleGenerateAi() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setAiResult({
        title: aiMode === 'url' ? 'Mercado de Equipamentos Pesados Registra Alta no Brasil' : 'Avanço Tecnológico no Setor de Transportes e Máquinas',
        excerpt: 'Confira as principais inovações técnicas, tendências de vendas e análises do setor motor.',
        content: `A indústria de transportes pesados e equipamentos agrícolas registrou um crescimento expressivo no mercado brasileiro.\n\n## Principais Destaques\n- Aumento na produtividade operacional\n- Redução de custos com combustíveis eficientes\n- Novas linhas de financiamento pelo Plano Safra\n\nFabricantes nacionais e importadores comemoram os números positivos registrados neste trimestre.`,
      });
      showNotification('Conteúdo reescrito via IA com sucesso!');
    }, 1500);
  }

  function handleImportAiToForm() {
    if (!aiResult) return;
    setPostForm({
      title: aiResult.title,
      slug: aiResult.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      categoryId: 4,
      excerpt: aiResult.excerpt,
      content: aiResult.content,
      coverImage: '/category-agricola.jpg',
      status: 'draft',
      tags: 'IA, Mercado, Inovação',
    });
    setEditingPostId(null);
    setIsFormOpen(true);
    setActiveTab('posts');
  }

  // ─── Scraper Actions ───────────────────────────────────────────────────────

  function handleTriggerScraper() {
    setScraperRunning(true);
    showNotification('Job de scraping iniciado em background...', 'info');
    setTimeout(() => {
      setScraperRunning(false);
      const newItem: ScrapedItem = {
        id: Date.now(),
        sourceId: 1,
        originalUrl: 'https://canalrural.com.br/noticias/nova-colheitadeira-2026',
        originalTitle: 'Nova colheitadeira autônoma é apresentada para o mercado nacional',
        rawContent: 'Equipamento promete operar 24h sem intervenção humana no plantio...',
        status: 'pending',
        createdAt: new Date(),
      };
      setScrapedItems(prev => [newItem, ...prev]);
      showNotification('Scraping concluído! 1 novo item adicionado à fila de revisão.');
    }, 2500);
  }

  function handleReviewScrapedItem(id: number, action: 'approve' | 'reject') {
    if (action === 'approve') {
      const item = scrapedItems.find(i => i.id === id);
      if (item) {
        // Create draft post from item
        const newPost: Post = {
          id: Date.now(),
          title: item.originalTitle || 'Notícia Coletada via Scraping',
          slug: (item.originalTitle || 'noticia-scraped').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
          content: item.rawContent || '',
          excerpt: (item.rawContent || '').slice(0, 150) + '...',
          categoryId: 4,
          coverImage: '/category-agricola.jpg',
          status: 'draft',
          sourceUrl: item.originalUrl,
          createdAt: new Date(),
        };
        setPosts(prev => [newPost, ...prev]);
      }
    }
    setScrapedItems(prev => prev.filter(i => i.id !== id));
    showNotification(action === 'approve' ? 'Item aprovado e convertido em rascunho!' : 'Item rejeitado.', action === 'approve' ? 'success' : 'info');
  }

  function handleAddSource(e: React.FormEvent) {
    e.preventDefault();
    if (!newSource.name || !newSource.url) return;
    const source: ScrapingSource = {
      id: Date.now(),
      name: newSource.name,
      url: newSource.url,
      categoryId: newSource.categoryId,
      type: 'rss',
      keywords: newSource.keywords,
      isActive: true,
    };
    setSources(prev => [...prev, source]);
    setNewSource({ name: '', url: '', categoryId: 4, keywords: '' });
    showNotification('Nova fonte RSS cadastrada com sucesso!');
  }

  // ─── Export Leads ─────────────────────────────────────────────────────────

  function handleExportLeads() {
    const header = 'ID,Nome,Telefone,Email,Segmento,Categoria,Mensagem,Origem,Data\n';
    const rows = leads.map(l =>
      [l.id, `"${l.name}"`, l.phone || '', l.email || '', l.segment, l.categoryInterest || '', `"${l.message || ''}"`, l.source || '', l.createdAt ? new Date(l.createdAt).toISOString() : ''].join(',')
    );
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-todomotor-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('Planilha de leads exportada com sucesso!');
  }

  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const filteredPosts = posts.filter(p => filterStatus === 'all' || p.status === filterStatus);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--offwhite)', color: 'var(--black)' }}>
      {/* Admin Header */}
      <header style={{ background: 'var(--black)', borderBottom: '3px solid var(--yellow)', padding: '0 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div className="logo-mark" style={{ width: 32, height: 32, fontSize: 16 }}>TM</div>
              <span className="logo-name" style={{ fontSize: 18 }}>TODO <span>MOTOR</span></span>
            </Link>
            <span style={{ color: 'var(--yellow)', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'rgba(245,200,0,0.15)', padding: '4px 10px', borderRadius: 2 }}>
              PAINEL ADMIN
            </span>
          </div>
          <Link href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            ← Ver Site Público
          </Link>
        </div>
      </header>

      {/* Notification toast */}
      {notifyMsg && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 1000,
          background: notifyMsg.type === 'success' ? '#22C55E' : 'var(--black)',
          color: '#fff', padding: '12px 20px', borderRadius: 4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600,
          borderLeft: '4px solid var(--yellow)',
        }}>
          {notifyMsg.text}
        </div>
      )}

      {/* Admin Body */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid var(--lightgray)', marginBottom: 28 }}>
          <button
            onClick={() => setActiveTab('posts')}
            className="btn-tab"
            style={{
              padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase',
              color: activeTab === 'posts' ? 'var(--black)' : 'var(--gray)',
              borderBottom: activeTab === 'posts' ? '3px solid var(--yellow)' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            📰 Postagens ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className="btn-tab"
            style={{
              padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase',
              color: activeTab === 'ai' ? 'var(--black)' : 'var(--gray)',
              borderBottom: activeTab === 'ai' ? '3px solid var(--yellow)' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            🪄 Gerador IA
          </button>
          <button
            onClick={() => setActiveTab('scraper')}
            className="btn-tab"
            style={{
              padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase',
              color: activeTab === 'scraper' ? 'var(--black)' : 'var(--gray)',
              borderBottom: activeTab === 'scraper' ? '3px solid var(--yellow)' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            🤖 Scraping ({scrapedItems.length} pendentes)
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className="btn-tab"
            style={{
              padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase',
              color: activeTab === 'leads' ? 'var(--black)' : 'var(--gray)',
              borderBottom: activeTab === 'leads' ? '3px solid var(--yellow)' : '3px solid transparent',
              marginBottom: -2,
            }}
          >
            🎯 Leads Anunciantes ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className="btn-tab"
            style={{
              padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-barlow-condensed)', fontSize: 16, fontWeight: 700, textTransform: 'uppercase',
              color: activeTab === 'agent' ? 'var(--black)' : 'var(--gray)',
              borderBottom: activeTab === 'agent' ? '3px solid var(--yellow)' : '3px solid transparent',
              marginBottom: -2,
              position: 'relative',
            }}
          >
            🤖 Agente Editor {agentQueue.length > 0 && <span style={{ background: 'var(--yellow)', color: 'var(--black)', borderRadius: 10, fontSize: 11, padding: '1px 6px', marginLeft: 4, fontWeight: 800 }}>{agentQueue.length}</span>}
          </button>
        </div>

        {/* ─── TAB 1: POSTAGENS ────────────────────────────────────────────── */}
        {activeTab === 'posts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={() => setFilterStatus('all')} style={{ padding: '6px 12px', border: '1px solid var(--lightgray)', borderRadius: 2, background: filterStatus === 'all' ? 'var(--black)' : '#fff', color: filterStatus === 'all' ? 'var(--yellow)' : '#555', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  Todas ({posts.length})
                </button>
                <button onClick={() => setFilterStatus('published')} style={{ padding: '6px 12px', border: '1px solid var(--lightgray)', borderRadius: 2, background: filterStatus === 'published' ? 'var(--black)' : '#fff', color: filterStatus === 'published' ? 'var(--yellow)' : '#555', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  Publicadas ({posts.filter(p => p.status === 'published').length})
                </button>
                <button onClick={() => setFilterStatus('draft')} style={{ padding: '6px 12px', border: '1px solid var(--lightgray)', borderRadius: 2, background: filterStatus === 'draft' ? 'var(--black)' : '#fff', color: filterStatus === 'draft' ? 'var(--yellow)' : '#555', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  Rascunhos ({posts.filter(p => p.status === 'draft').length})
                </button>
              </div>
              <button className="btn-yellow" onClick={handleOpenCreate}>
                + Nova Notícia
              </button>
            </div>

            {/* Posts Table */}
            <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--black)', color: 'var(--yellow)', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Notícia</th>
                    <th style={{ padding: '12px 16px' }}>Categoria</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Data</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map(post => {
                    const cat = categoryMap.get(post.categoryId);
                    return (
                      <tr key={post.id} style={{ borderBottom: '1px solid var(--lightgray)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {post.coverImage && (
                              <img src={post.coverImage} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 2 }} />
                            )}
                            <div>
                              <div>{post.title}</div>
                              <div style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>/{post.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 2, background: cat?.accentColor || '#eee', color: cat?.accentColor === '#F5C800' ? '#000' : '#fff', fontWeight: 700 }}>
                            {cat?.icon} {cat?.name || 'Notícia'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: post.status === 'published' ? '#DCFCE7' : '#FEF3C7', color: post.status === 'published' ? '#166534' : '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
                            {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#666' }}>
                          {new Date(post.publishedAt || post.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button onClick={() => handleOpenEdit(post)} style={{ background: 'none', border: 'none', color: '#0066CC', cursor: 'pointer', fontWeight: 600, marginRight: 12 }}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => handleDeletePost(post.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontWeight: 600 }}>
                            🗑️ Excluir
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

        {/* ─── TAB 2: GERADOR IA ───────────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, padding: 24 }}>
            <h2 className="section-title" style={{ marginTop: 0 }}>🪄 Gerador de Notícias via Inteligência Artificial</h2>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
              Insira o link de uma matéria do setor ou cole um texto bruto. A IA reescreverá com o tom apaixonado e técnico do Todo Motor.
            </p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <button onClick={() => setAiMode('url')} style={{ padding: '8px 16px', border: '2px solid var(--black)', background: aiMode === 'url' ? 'var(--black)' : '#fff', color: aiMode === 'url' ? 'var(--yellow)' : 'var(--black)', cursor: 'pointer', fontWeight: 700 }}>
                🔗 Gerar por URL
              </button>
              <button onClick={() => setAiMode('text')} style={{ padding: '8px 16px', border: '2px solid var(--black)', background: aiMode === 'text' ? 'var(--black)' : '#fff', color: aiMode === 'text' ? 'var(--yellow)' : 'var(--black)', cursor: 'pointer', fontWeight: 700 }}>
                📝 Gerar por Texto Bruto
              </button>
            </div>

            {aiMode === 'url' ? (
              <input
                type="url"
                placeholder="https://exemplo.com.br/noticia-maquinas-agricolas"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                style={{ width: '100%', padding: 12, border: '2px solid var(--lightgray)', borderRadius: 4, fontSize: 14, marginBottom: 16 }}
              />
            ) : (
              <textarea
                rows={5}
                placeholder="Cole o texto bruto do press release ou informe técnico..."
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                style={{ width: '100%', padding: 12, border: '2px solid var(--lightgray)', borderRadius: 4, fontSize: 14, marginBottom: 16 }}
              />
            )}

            <button className="btn-yellow" onClick={handleGenerateAi} disabled={aiLoading || !aiInput.trim()}>
              {aiLoading ? '🔄 Processando com IA...' : '✨ Reescrever Matéria com IA'}
            </button>

            {/* AI Preview */}
            {aiResult && (
              <div style={{ marginTop: 28, padding: 20, background: 'var(--offwhite)', border: '2px solid var(--yellow)', borderRadius: 4 }}>
                <h3 style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 22, textTransform: 'uppercase', margin: '0 0 12px' }}>
                  {aiResult.title}
                </h3>
                <p style={{ fontWeight: 600, color: '#444', marginBottom: 12 }}>{aiResult.excerpt}</p>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, color: '#333', background: '#fff', padding: 16, borderRadius: 4, border: '1px solid var(--lightgray)' }}>
                  {aiResult.content}
                </div>
                <button className="btn-yellow" onClick={handleImportAiToForm} style={{ marginTop: 16 }}>
                  📥 Importar Conteúdo para Novo Rascunho →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: SCRAPING ─────────────────────────────────────────────── */}
        {activeTab === 'scraper' && (
          <div style={{ display: 'grid', gap: 24 }}>
            {/* Scraper Status */}
            <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 16, display: 'block' }}>Robô de Captura Automática de Notícias</strong>
                <span style={{ fontSize: 13, color: '#666' }}>{sources.length} fontes RSS ativas monitorando o setor motor.</span>
              </div>
              <button className="btn-yellow" onClick={handleTriggerScraper} disabled={scraperRunning}>
                {scraperRunning ? '🔄 Coletando Notícias...' : '⚡ Disparar Scraping Manual Agora'}
              </button>
            </div>

            {/* Pending Scraped Queue */}
            <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, padding: 20 }}>
              <h3 className="section-title" style={{ marginTop: 0 }}>📋 Fila de Revisão de Notícias Capturadas</h3>
              {scrapedItems.length === 0 ? (
                <p style={{ color: '#888', fontSize: 14 }}>Nenhum item pendente de revisão no momento.</p>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {scrapedItems.map(item => (
                    <div key={item.id} style={{ border: '1px solid var(--lightgray)', padding: 16, borderRadius: 4, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>{item.originalTitle}</strong>
                        <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>{item.rawContent}</p>
                        <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#0066CC' }}>
                          🔗 {item.originalUrl}
                        </a>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => handleReviewScrapedItem(item.id, 'approve')} className="btn-yellow" style={{ padding: '6px 12px', fontSize: 12 }}>
                          ✅ Aprovar
                        </button>
                        <button onClick={() => handleReviewScrapedItem(item.id, 'reject')} style={{ padding: '6px 12px', fontSize: 12, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 700 }}>
                          ❌ Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Source Form */}
            <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, padding: 20 }}>
              <h3 className="section-title" style={{ marginTop: 0 }}>➕ Cadastrar Nova Fonte RSS</h3>
              <form onSubmit={handleAddSource} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>Nome da Fonte</label>
                  <input type="text" placeholder="Ex: Globo Rural" value={newSource.name} onChange={e => setNewSource(s => ({ ...s, name: e.target.value }))} required style={{ width: '100%', padding: 8, border: '1px solid var(--lightgray)', borderRadius: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>URL do Feed RSS</label>
                  <input type="url" placeholder="https://site.com/feed" value={newSource.url} onChange={e => setNewSource(s => ({ ...s, url: e.target.value }))} required style={{ width: '100%', padding: 8, border: '1px solid var(--lightgray)', borderRadius: 2 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666' }}>Categoria</label>
                  <select value={newSource.categoryId} onChange={e => setNewSource(s => ({ ...s, categoryId: Number(e.target.value) }))} style={{ width: '100%', padding: 8, border: '1px solid var(--lightgray)', borderRadius: 2 }}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-yellow" style={{ padding: '9px 16px' }}>Adicionar Fonte</button>
              </form>
            </div>
          </div>
        )}

        {/* ─── TAB 4: LEADS ────────────────────────────────────────────────── */}
        {activeTab === 'leads' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>🎯 Leads de Anunciantes Capturados</h2>
                <span style={{ fontSize: 13, color: '#666' }}>Potenciais anunciantes que preencheram o formulário no blog.</span>
              </div>
              <button className="btn-yellow" onClick={handleExportLeads}>
                📊 Exportar Planilha CSV
              </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: 'var(--black)', color: 'var(--yellow)', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1, textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px' }}>Nome</th>
                    <th style={{ padding: '12px 16px' }}>Contato</th>
                    <th style={{ padding: '12px 16px' }}>Segmento</th>
                    <th style={{ padding: '12px 16px' }}>Categoria</th>
                    <th style={{ padding: '12px 16px' }}>Mensagem</th>
                    <th style={{ padding: '12px 16px' }}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} style={{ borderBottom: '1px solid var(--lightgray)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{lead.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>
                        <div>📱 {lead.phone || '—'}</div>
                        <div style={{ color: '#666' }}>✉️ {lead.email || '—'}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 2, background: 'var(--black)', color: 'var(--yellow)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {lead.segment}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{lead.categoryInterest || 'Geral'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#444', maxWidth: 250 }}>{lead.message || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>
                        {new Date(lead.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 5: AGENTE EDITOR ─────────────────────────────────────── */}
        {activeTab === 'agent' && (
          <div style={{ display: 'grid', gap: 24 }}>

            {/* Agent Control Panel */}
            <div style={{ background: 'var(--black)', border: '3px solid var(--yellow)', borderRadius: 4, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ color: 'var(--yellow)', fontFamily: 'var(--font-barlow-condensed)', fontSize: 26, textTransform: 'uppercase', margin: '0 0 4px' }}>🤖 Agente Editor Autônomo</h2>
                  <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>Powered by Gemma 4 · Ciclo automático a cada 5 dias · 1 artigo por categoria</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {agentLastRun && <span style={{ fontSize: 12, color: '#888' }}>Último ciclo: {new Date(agentLastRun).toLocaleString('pt-BR')}</span>}
                  <button
                    className="btn-yellow"
                    disabled={agentRunning}
                    onClick={async () => {
                      setAgentRunning(true);
                      setAgentErrors([]);
                      showNotification('🤖 Agente iniciado! Buscando notícias e gerando roteiros...', 'info');
                      try {
                        const res = await fetch('/api/agent/run', { method: 'POST' });
                        const data = await res.json();
                        if (data.success) {
                          setAgentLastRun(new Date().toISOString());
                          showNotification(`✅ Ciclo completo! ${data.articlesQueued} artigos na fila de revisão.`);
                          // Refresh queue
                          const statusRes = await fetch('/api/agent/status');
                          const statusData = await statusRes.json();
                          if (statusData.success) setAgentQueue(statusData.queue || []);
                        } else {
                          setAgentErrors([data.error || 'Erro desconhecido']);
                          showNotification('❌ Erro no agente. Verifique os detalhes.', 'info');
                        }
                      } catch (e) {
                        setAgentErrors([String(e)]);
                        showNotification('❌ Falha de conexão com o agente.', 'info');
                      } finally {
                        setAgentRunning(false);
                      }
                    }}
                  >
                    {agentRunning ? '🔄 Agente rodando...' : '▶️ Rodar Agente Agora'}
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
                {[
                  { label: 'Na Fila', value: agentQueue.length, color: '#F5C800' },
                  { label: 'Categorias', value: '11', color: '#22C55E' },
                  { label: 'Ciclo', value: '5 dias', color: '#06B6D4' },
                  { label: 'Modelo', value: 'Gemma 4', color: '#8B5CF6' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-barlow-condensed)' }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {agentErrors.length > 0 && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.15)', borderRadius: 4, border: '1px solid #EF4444' }}>
                  <strong style={{ color: '#EF4444', fontSize: 12 }}>⚠️ Erros no último ciclo:</strong>
                  {agentErrors.map((e, i) => <div key={i} style={{ fontSize: 12, color: '#fca5a5', marginTop: 4 }}>{e}</div>)}
                </div>
              )}
            </div>

            {/* Agent Queue */}
            <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, padding: 20 }}>
              <h3 className="section-title" style={{ marginTop: 0 }}>📋 Fila de Revisão do Agente ({agentQueue.length})</h3>

              {agentQueue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Nenhum artigo na fila</div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>Clique em "Rodar Agente Agora" para o Gemma 4 buscar e reescrever notícias automaticamente.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {agentQueue.map((article, idx) => (
                    <div key={article.originalUrl} style={{ border: '2px solid var(--lightgray)', borderRadius: 4, overflow: 'hidden' }}>

                      {/* Article header */}
                      <div style={{ display: 'grid', gridTemplateColumns: article.suggestedImageUrl ? '120px 1fr' : '1fr', gap: 0 }}>
                        {article.suggestedImageUrl && (
                          <img src={article.suggestedImageUrl} alt="" style={{ width: 120, height: 90, objectFit: 'cover' }} />
                        )}
                        <div style={{ padding: 16 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', background: 'var(--black)', color: 'var(--yellow)', borderRadius: 2, textTransform: 'uppercase' }}>{article.categoryName}</span>
                            <span style={{ fontSize: 10, color: '#888' }}>Fonte: {article.sourceName}</span>
                            <span style={{ fontSize: 10, background: article.agentScore >= 8 ? '#DCFCE7' : article.agentScore >= 6 ? '#FEF3C7' : '#FEE2E2', color: article.agentScore >= 8 ? '#166534' : article.agentScore >= 6 ? '#92400E' : '#991B1B', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>⭐ Score: {article.agentScore}/10</span>
                          </div>
                          <h4 style={{ margin: '0 0 6px', fontSize: 16, lineHeight: 1.3 }}>{article.rewrittenTitle}</h4>
                          <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.5 }}>{article.excerpt}</p>
                          <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#0066CC', display: 'block', marginTop: 6 }}>🔗 Fonte original</a>
                        </div>
                      </div>

                      {/* Reels preview toggle */}
                      <div style={{ borderTop: '1px solid var(--lightgray)', background: '#f9f9f9' }}>
                        <button
                          onClick={() => setExpandedReels(expandedReels === article.originalUrl ? null : article.originalUrl)}
                          style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <span>🎬 Ver Roteiro de Reels + Conteúdo Social</span>
                          <span>{expandedReels === article.originalUrl ? '▲' : '▼'}</span>
                        </button>

                        {expandedReels === article.originalUrl && (
                          <div style={{ padding: '0 16px 16px', display: 'grid', gap: 12 }}>
                            {/* Reels Script */}
                            <div>
                              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>📹 Roteiro Completo (Markdown)</label>
                              <pre style={{ background: '#1a1a2e', color: '#e2e8f0', padding: 14, borderRadius: 4, fontSize: 12, lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>{article.reelsScript || 'Roteiro não gerado'}</pre>
                              <button onClick={() => navigator.clipboard.writeText(article.reelsScript)} style={{ marginTop: 6, fontSize: 11, padding: '4px 10px', background: '#1a1a2e', color: '#e2e8f0', border: 'none', borderRadius: 2, cursor: 'pointer' }}>📋 Copiar Roteiro</button>
                            </div>

                            {/* Instagram */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>📸 Legenda Instagram</label>
                                <textarea readOnly rows={5} value={article.instagramCaption} style={{ width: '100%', padding: 8, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 12, resize: 'vertical', background: '#fafafa' }} />
                                <button onClick={() => navigator.clipboard.writeText(article.instagramCaption)} style={{ marginTop: 4, fontSize: 11, padding: '4px 10px', background: '#E1306C', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>📋 Copiar IG</button>
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>🐦 Twitter / X</label>
                                <textarea readOnly rows={3} value={article.twitterText} style={{ width: '100%', padding: 8, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 12, resize: 'vertical', background: '#fafafa' }} />
                                <button onClick={() => navigator.clipboard.writeText(article.twitterText)} style={{ marginTop: 4, fontSize: 11, padding: '4px 10px', background: '#000', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>📋 Copiar X/Twitter</button>
                                <div style={{ marginTop: 8 }}>
                                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>🔖 Hashtags</label>
                                  <div style={{ fontSize: 12, color: '#0066CC', lineHeight: 1.8 }}>{(article.hashtags || []).join(' ')}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ borderTop: '1px solid var(--lightgray)', padding: '12px 16px', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#fff' }}>
                        <button
                          style={{ padding: '8px 16px', fontSize: 13, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 700 }}
                          onClick={() => {
                            setAgentQueue(q => q.filter(a => a.originalUrl !== article.originalUrl));
                            showNotification('Artigo rejeitado e removido da fila.', 'info');
                          }}
                        >
                          ❌ Rejeitar
                        </button>
                        <button
                          style={{ padding: '8px 16px', fontSize: 13, background: '#6B7280', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 700 }}
                          onClick={() => {
                            setPostForm({
                              title: article.rewrittenTitle,
                              slug: article.rewrittenTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60),
                              categoryId: INITIAL_CATEGORIES.find(c => c.slug === article.categorySlug)?.id || 1,
                              excerpt: article.excerpt,
                              content: article.rewrittenContent,
                              coverImage: article.suggestedImageUrl || '',
                              status: 'draft',
                              tags: (article.hashtags || []).slice(0, 5).join(', '),
                            });
                            setEditingPostId(null);
                            setIsFormOpen(true);
                            setActiveTab('posts');
                            showNotification('Artigo importado como rascunho!', 'info');
                          }}
                        >
                          ✏️ Editar antes de publicar
                        </button>
                        <button
                          className="btn-yellow"
                          style={{ padding: '8px 20px', fontSize: 13 }}
                          onClick={() => {
                            const newPost: Post = {
                              id: Date.now(),
                              title: article.rewrittenTitle,
                              slug: article.rewrittenTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60),
                              content: article.rewrittenContent,
                              excerpt: article.excerpt,
                              categoryId: INITIAL_CATEGORIES.find(c => c.slug === article.categorySlug)?.id || 1,
                              coverImage: article.suggestedImageUrl || '',
                              status: 'published',
                              sourceUrl: article.originalUrl,
                              tags: (article.hashtags || []).join(', '),
                              publishedAt: new Date(),
                              createdAt: new Date(),
                            };
                            setPosts(prev => [newPost, ...prev]);
                            setAgentQueue(q => q.filter(a => a.originalUrl !== article.originalUrl));
                            showNotification(`✅ "${article.rewrittenTitle.substring(0, 40)}..." publicado!`);
                          }}
                        >
                          ✅ Aprovar e Publicar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How it works */}
            <div style={{ background: '#fff', border: '1px solid var(--lightgray)', borderRadius: 4, padding: 20 }}>
              <h3 className="section-title" style={{ marginTop: 0 }}>💡 Como o Agente Funciona</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { step: '1', icon: '📡', title: 'Busca RSS', desc: 'Monitora 20+ fontes por categoria: Canal Rural, Motor1, ANAC, Náutica Online, Airway e mais.' },
                  { step: '2', icon: '🧠', title: 'Gemma 4 Rankeia', desc: 'Pontua relevância (0-10) de cada notícia considerando atualidade e interesse do público.' },
                  { step: '3', icon: '✍️', title: 'Reescreve', desc: 'Gemma 4 reescreve com tom técnico e apaixonado, otimizado para SEO.' },
                  { step: '4', icon: '🎬', title: 'Gera Reels', desc: 'Roteiro de vídeo 60s + legenda Instagram + texto Twitter prontos para postar.' },
                  { step: '5', icon: '🖼️', title: 'Imagem IA', desc: 'Google Imagen gera imagem representativa e premium para cada post.' },
                  { step: '6', icon: '✅', title: 'Você Aprova', desc: 'Revise, edite ou publique com 1 clique. Controle total do conteúdo.' },
                ].map(item => (
                  <div key={item.step} style={{ padding: 16, background: 'var(--offwhite)', borderRadius: 4, borderLeft: '3px solid var(--yellow)' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{item.step}. {item.title}</div>
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── CREATE / EDIT POST MODAL ────────────────────────────────────── */}
        {isFormOpen && (
          <div className="lead-modal-overlay" onClick={() => setIsFormOpen(false)}>
            <div className="lead-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 720 }}>
              <button className="lead-modal-close" onClick={() => setIsFormOpen(false)}>✕</button>
              <div className="lead-modal-header">
                <span className="lead-modal-badge">📰 PAINEL EDITORIAL</span>
                <h2 style={{ color: '#fff', margin: 0 }}>{editingPostId ? 'Editar Notícia' : 'Criar Nova Notícia'}</h2>
              </div>
              <form onSubmit={handleSavePost} style={{ padding: 24, display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>Título da Notícia *</label>
                  <input type="text" required value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', padding: 10, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 14 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>Categoria *</label>
                    <select value={postForm.categoryId} onChange={e => setPostForm(f => ({ ...f, categoryId: Number(e.target.value) }))} style={{ width: '100%', padding: 10, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 14 }}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>Status</label>
                    <select value={postForm.status} onChange={e => setPostForm(f => ({ ...f, status: e.target.value as 'draft' | 'published' }))} style={{ width: '100%', padding: 10, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 14 }}>
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>Imagem de Capa (URL)</label>
                  <input type="text" value={postForm.coverImage} onChange={e => setPostForm(f => ({ ...f, coverImage: e.target.value }))} placeholder="/category-veiculos.jpg ou URL de imagem externa" style={{ width: '100%', padding: 10, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 14 }} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>Resumo / Excerpt</label>
                  <textarea rows={2} value={postForm.excerpt} onChange={e => setPostForm(f => ({ ...f, excerpt: e.target.value }))} style={{ width: '100%', padding: 10, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 14 }} />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: 4 }}>Conteúdo Completo (Suporta Markdown) *</label>
                  <textarea rows={8} required value={postForm.content} onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))} style={{ width: '100%', padding: 10, border: '1px solid var(--lightgray)', borderRadius: 4, fontSize: 14, fontFamily: 'monospace' }} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '10px 20px', border: '1px solid var(--lightgray)', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-yellow">
                    💾 Salvar Notícia
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
