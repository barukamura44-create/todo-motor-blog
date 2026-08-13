'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  accentColor?: string | null;
  description?: string | null;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId: number;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
}

interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  segment: 'anunciante' | 'lojista' | 'comprador' | 'outro';
  categoryInterest: string;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d?: Date | string | null) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const CATEGORY_FALLBACK_ICON: Record<string, string> = {
  veiculos: '🚗', barcos: '⛵', aeronaves: '✈️', agricola: '🌾',
  terraplenagem: '🏗️', 'transportes-pesados': '🚛', lancamentos: '🚀',
  eventos: '📅', jetski: '🌊', drones: '🛸', helicopteros: '🚁',
};

const CATEGORY_ACCENT: Record<string, string> = {
  veiculos: '#F5C800', barcos: '#0066CC', aeronaves: '#6B48FF',
  agricola: '#22C55E', terraplenagem: '#F97316', 'transportes-pesados': '#EF4444',
  lancamentos: '#EC4899', eventos: '#8B5CF6', jetski: '#06B6D4',
  drones: '#10B981', helicopteros: '#6366F1',
};

// ─── Demo data for visual preview (replaced by real data in production) ───────

const DEMO_CATEGORIES: Category[] = [
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

const DEMO_POSTS: Post[] = [
  { id: 1, title: 'New Holland lança nova colheitadeira T6 com câmbio automático revolucionário', slug: 'new-holland-t6-cambio', excerpt: 'Fabricante apresenta tecnologia exclusiva que aumenta produtividade em até 22% em condições adversas.', categoryId: 4, coverImage: '/category-agricola.jpg', publishedAt: new Date() },
  { id: 2, title: 'Mercado de lanchas cresce 34% no Brasil com destaque para embarcações regionais', slug: 'lanchas-crescimento', excerpt: 'Setor náutico bate recorde de vendas no primeiro semestre, impulsionado pela região Sul e Nordeste.', categoryId: 2, coverImage: '/category-barcos.jpg', publishedAt: new Date() },
  { id: 3, title: 'ANAC regulamenta uso de drones para pulverização em lavouras de grande porte', slug: 'anac-drones-lavouras', excerpt: 'Nova normativa abre mercado bilionário para operadores de VANT no agronegócio brasileiro.', categoryId: 10, coverImage: '/category-drones.jpg', publishedAt: new Date() },
  { id: 4, title: 'Scania lança caminhão elétrico para frotas pesadas com autonomia de 380 km', slug: 'scania-eletrico-frotas', excerpt: 'Modelo P25 chega ao Brasil com capacidade de 25 toneladas e carregamento em 2 horas.', categoryId: 6, coverImage: '/category-transportes-pesados.jpg', publishedAt: new Date() },
  { id: 5, title: 'Agrishow 2026: as 10 máquinas agrícolas mais esperadas da feira', slug: 'agrishow-maquinas', excerpt: 'Da conectividade ao hidrogênio, confira o que os grandes fabricantes vão apresentar em Ribeirão Preto.', categoryId: 8, coverImage: '/category-eventos.jpg', publishedAt: new Date() },
  { id: 6, title: 'Yamaha apresenta novo WaveRunner VX com motor 1.8L e tecnologia de estabilização', slug: 'yamaha-waverunner-vx', excerpt: 'Motonáutica japonesa eleva padrão da categoria com lançamento previsto para o verão 2026.', categoryId: 9, coverImage: '/category-jetski.jpg', publishedAt: new Date() },
];

// ─── Lead Modal ───────────────────────────────────────────────────────────────

function LeadModal({ isOpen, onClose, source = '' }: { isOpen: boolean; onClose: () => void; source?: string }) {
  const [form, setForm] = useState<LeadFormData>({
    name: '', phone: '', email: '', segment: 'anunciante', categoryInterest: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="lead-modal-overlay" onClick={onClose}>
      <div className="lead-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
        <button className="lead-modal-close" onClick={onClose} aria-label="Fechar">✕</button>

        {status === 'success' ? (
          <div className="lead-modal-success">
            <div className="lead-success-icon">✅</div>
            <h3>Recebemos seu contato!</h3>
            <p>Nossa equipe comercial entrará em contato em até 24 horas. Obrigado pelo interesse!</p>
            <button className="btn-yellow" onClick={onClose}>Fechar</button>
          </div>
        ) : (
          <>
            <div className="lead-modal-header" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '140px' }}>
                <img src="/todo-motor-banner.jpg" alt="Todo Motor - Anuncie Conosco" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,13,0.95), rgba(13,13,13,0.4))' }} />
                <div style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px' }}>
                  <span className="lead-modal-badge">🚗 ANUNCIE NO TODO MOTOR</span>
                  <h2 id="lead-modal-title" style={{ margin: 0 }}>Alcance milhares de compradores qualificados</h2>
                </div>
              </div>
              <div style={{ padding: '12px 24px 16px', background: 'var(--black)' }}>
                <p style={{ margin: 0, color: '#aaa', fontSize: 13 }}>Fale com nosso time comercial e receba uma proposta personalizada.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="lead-modal-form">
              <div className="lead-form-row">
                <div className="lead-form-field">
                  <label htmlFor="lead-name">Nome *</label>
                  <input id="lead-name" type="text" placeholder="Seu nome completo" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="lead-form-field">
                  <label htmlFor="lead-phone">Telefone / WhatsApp</label>
                  <input id="lead-phone" type="tel" placeholder="(11) 99999-9999" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="lead-form-row">
                <div className="lead-form-field">
                  <label htmlFor="lead-email">E-mail *</label>
                  <input id="lead-email" type="email" placeholder="seu@email.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="lead-form-field">
                  <label htmlFor="lead-segment">Sou um(a)...</label>
                  <select id="lead-segment" value={form.segment}
                    onChange={e => setForm(f => ({ ...f, segment: e.target.value as LeadFormData['segment'] }))}>
                    <option value="anunciante">Anunciante (quero vender)</option>
                    <option value="lojista">Lojista / Concessionária</option>
                    <option value="comprador">Comprador (quero avisos)</option>
                    <option value="outro">Outro interesse</option>
                  </select>
                </div>
              </div>
              <div className="lead-form-field">
                <label htmlFor="lead-category">Categoria de interesse</label>
                <select id="lead-category" value={form.categoryInterest}
                  onChange={e => setForm(f => ({ ...f, categoryInterest: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {DEMO_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="lead-form-field">
                <label htmlFor="lead-message">Mensagem (opcional)</label>
                <textarea id="lead-message" rows={3} placeholder="Descreva o que você tem para anunciar ou o que está procurando..."
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              {status === 'error' && (
                <p className="lead-form-error">Ocorreu um erro. Tente novamente ou nos chame no WhatsApp.</p>
              )}
              <div className="lead-form-actions">
                <button type="submit" className="btn-yellow" disabled={status === 'loading'} id="lead-submit-btn">
                  {status === 'loading' ? 'Enviando...' : '📲 Quero ser Anunciante'}
                </button>
                <a href="https://wa.me/5500000000000?text=Ol%C3%A1%2C+quero+anunciar+no+Todo+Motor"
                  target="_blank" rel="noopener noreferrer" className="btn-whatsapp" id="lead-whatsapp-btn">
                  💬 WhatsApp Direto
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────

function Ticker({ posts }: { posts: Post[] }) {
  const items = posts.length > 0
    ? posts.map(p => p.title).join(' ⚡ ')
    : 'Bem-vindo ao Todo Motor Blog ⚡ Notícias sobre veículos, máquinas, barcos e aeronaves ⚡ Anuncie sua frota conosco';

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-inner">{items} &nbsp;&nbsp;&nbsp; {items}</div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ onLeadClick }: { onLeadClick: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header>
      <div className="header-inner">
        {/* Left nav */}
        <nav className="nav-left">
          <Link href="/" className="nav-link">Início</Link>
          <Link href="#noticias" className="nav-link">Notícias</Link>
          <Link href="#categorias" className="nav-link">Categorias</Link>
          <Link href="/admin" className="nav-link" style={{ color: 'var(--yellow)' }}>⚙️ Painel Admin</Link>
        </nav>

        {/* Centered logo */}
        <Link href="/" className="header-logo-container" aria-label="Todo Motor - Início">
          <div className="logo">
            <div className="logo-mark">TM</div>
            <span className="logo-name">TODO <span>MOTOR</span></span>
          </div>
        </Link>

        {/* Right actions */}
        <div className="header-right">
          <button className="header-cta" onClick={onLeadClick} id="header-cta-btn">
            📢 Anuncie Aqui
          </button>
          <button
            className={`hamburger${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className={`mobile-nav${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <Link href="/" onClick={() => setMenuOpen(false)}>Início</Link>
        <Link href="#noticias" onClick={() => setMenuOpen(false)}>Notícias</Link>
        <Link href="#categorias" onClick={() => setMenuOpen(false)}>Categorias</Link>
        <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ color: 'var(--yellow)' }}>⚙️ Painel Admin</Link>
        <button className="mobile-nav-cta" onClick={() => { setMenuOpen(false); onLeadClick(); }}>
          📢 Anuncie Aqui
        </button>
      </nav>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({ featuredPost, onLeadClick }: { featuredPost?: Post; onLeadClick: () => void }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <span className="hero-tag">📰 Blog Oficial</span>
          <h1 className="hero-title">
            {featuredPost ? (
              <Link href={`/blog/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {featuredPost.title}
              </Link>
            ) : (
              <>O UNIVERSO <em>MOTOR</em><br />EM UM SÓ LUGAR</>
            )}
          </h1>
          <p className="hero-lead">
            {featuredPost?.excerpt || 'Notícias sobre veículos, máquinas agrícolas, barcos, aeronaves, terraplenagem e muito mais. Conteúdo especializado para quem vive o mundo motor.'}
          </p>
          <div className="hero-actions">
            {featuredPost ? (
              <Link href={`/blog/${featuredPost.slug}`} className="btn-yellow" id="hero-read-btn">
                Ler Matéria Completa →
              </Link>
            ) : (
              <button className="btn-yellow" onClick={onLeadClick} id="hero-cta-btn">
                📢 Anuncie na Plataforma
              </button>
            )}
            <button className="btn-outline" onClick={onLeadClick} id="hero-app-btn">
              📢 Anuncie Agora na Plataforma
            </button>
          </div>
          {featuredPost && (
            <div className="hero-meta">
              <span>Publicado em {formatDate(featuredPost.publishedAt)}</span>
            </div>
          )}
        </div>
        <div className="hero-img" aria-hidden="true" style={{ position: 'relative', overflow: 'hidden', border: '2px solid var(--yellow)' }}>
          <img src="/todo-motor-banner.jpg" alt="Todo Motor Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div className="hero-img-overlay" style={{ background: 'linear-gradient(to top, rgba(13,13,13,0.92) 0%, rgba(13,13,13,0.2) 60%, transparent 100%)' }}>
            <div className="hero-stats">
              <div className="hero-stat"><span className="hero-stat-num">11</span><span>Categorias</span></div>
              <div className="hero-stat"><span className="hero-stat-num">∞</span><span>Notícias</span></div>
              <div className="hero-stat"><span className="hero-stat-num">100%</span><span>Especializado</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Category Navigation ──────────────────────────────────────────────────────

function CategoryNav({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: number | null;
  onSelect: (id: number | null) => void;
}) {
  return (
    <nav className="cat-nav" aria-label="Filtrar por categoria">
      <div className="cat-nav-inner">
        <button
          className={`cat-btn${selected === null ? ' active' : ''}`}
          onClick={() => onSelect(null)}
          id="cat-btn-all"
        >
          🗞️ Todas
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`cat-btn${selected === c.id ? ' active' : ''}`}
            onClick={() => onSelect(c.id)}
            id={`cat-btn-${c.slug}`}
            style={selected === c.id ? { color: c.accentColor || '#F5C800', borderBottomColor: c.accentColor || '#F5C800' } : {}}
          >
            {c.icon || CATEGORY_FALLBACK_ICON[c.slug] || '📰'} {c.name}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, category }: { post: Post; category?: Category }) {
  const accent = category?.accentColor || CATEGORY_ACCENT[category?.slug || ''] || '#F5C800';
  const icon = category?.icon || CATEGORY_FALLBACK_ICON[category?.slug || ''] || '📰';

  return (
    <Link href={`/blog/${post.slug}`} className="post-card" id={`post-card-${post.id}`}>
      <div className="post-card-img" style={{ background: `${accent}22` }}>
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 48 }}>{icon}</span>
        )}
      </div>
      <div className="post-card-body">
        <span className="post-cat" style={{ background: accent, color: accent === '#F5C800' ? '#0D0D0D' : '#fff' }}>
          {category?.name || 'Notícia'}
        </span>
        <h2 className="post-title">{post.title}</h2>
        {post.excerpt && <p className="post-lead">{post.excerpt}</p>}
        <div className="post-meta">{formatDate(post.publishedAt || post.createdAt)}</div>
      </div>
    </Link>
  );
}

// ─── Lead Banner (between posts) ─────────────────────────────────────────────

function LeadBanner({ onLeadClick }: { onLeadClick: () => void }) {
  return (
    <div className="lead-banner" id="lead-banner-posts" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src="/todo-motor-banner.jpg" alt="Anuncie no Todo Motor" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.85) 60%, rgba(245,200,0,0.9) 100%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', width: '100%' }}>
        <div className="lead-banner-content">
          <img src="/todo-motor-banner.jpg" alt="Logo Banner" style={{ width: '100px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--yellow)', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#fff', fontSize: '18px' }}>Tem veículos, máquinas ou embarcações para anunciar?</strong>
            <p style={{ color: '#ccc', fontSize: '13px', margin: 0 }}>Mais de 100 mil compradores qualificados acessam a plataforma Todo Motor todo mês.</p>
          </div>
        </div>
        <button className="btn-yellow" onClick={onLeadClick} id="lead-banner-btn" style={{ flexShrink: 0, boxShadow: '0 4px 12px rgba(245,200,0,0.4)' }}>
          📢 Quero Anunciar →
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ categories, recentPosts, onLeadClick }: {
  categories: Category[];
  recentPosts: Post[];
  onLeadClick: () => void;
}) {
  return (
    <aside className="sidebar">
      {/* Categories list */}
      <div className="sidebar-block">
        <div className="sidebar-header" id="sidebar-cats">📂 Categorias</div>
        <div className="cat-list">
          {categories.map(c => (
            <Link href={`/categoria/${c.slug}`} key={c.id} className="cat-list-item" id={`sidebar-cat-${c.slug}`}>
              <span>{c.icon || CATEGORY_FALLBACK_ICON[c.slug]} {c.name}</span>
              <span className="cat-count" style={{ background: c.accentColor || '#F5C800', color: c.accentColor === '#F5C800' ? '#000' : '#fff' }}>
                →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div className="sidebar-block">
          <div className="sidebar-header">⚡ Últimas Notícias</div>
          {recentPosts.slice(0, 5).map(post => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="sidebar-item" id={`sidebar-post-${post.id}`}>
              <div className="sidebar-item-title">{post.title}</div>
              <div className="sidebar-item-meta">{formatDate(post.publishedAt || post.createdAt)}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Platform Ad CTA */}
      <div className="app-cta">
        <div className="app-cta-emoji">🚗</div>
        <div className="app-cta-title">Plataforma Todo Motor</div>
        <p className="app-cta-text">Anuncie seus veículos, máquinas agrícolas, barcos e aeronaves para todo o Brasil.</p>
        <button className="app-cta-btn" onClick={onLeadClick} id="sidebar-app-btn">
          Anuncie Agora
        </button>
      </div>

      {/* Lead CTA */}
      <div className="sidebar-lead" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ position: 'relative', height: '120px' }}>
          <img src="/todo-motor-banner.jpg" alt="Anuncie Conosco" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,13,0.9), transparent)' }} />
          <div style={{ position: 'absolute', bottom: '10px', left: '16px', right: '16px' }}>
            <div className="sidebar-lead-title" style={{ color: '#fff', margin: 0, fontSize: '16px' }}>📢 Anuncie Conosco</div>
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '12px', lineHeight: '1.4' }}>Alcance milhares de compradores qualificados em todo o Brasil.</p>
          <button className="btn-yellow" style={{ width: '100%' }} onClick={onLeadClick} id="sidebar-lead-btn">
            Falar com Comercial
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Category Grid ────────────────────────────────────────────────────────────

function CategoryGrid({ categories, onSelect }: { categories: Category[]; onSelect: (id: number) => void }) {
  return (
    <section id="categorias" className="cat-grid-section">
      <h2 className="section-title">Explore por Segmento</h2>
      <div className="cat-grid">
        {categories.map(c => (
          <button
            key={c.id}
            className="cat-grid-card-rich"
            onClick={() => onSelect(c.id)}
            id={`cat-grid-${c.slug}`}
            style={{ '--accent': c.accentColor || '#F5C800' } as React.CSSProperties}
          >
            <div className="cat-grid-bg">
              <img src={`/category-${c.slug}.jpg`} alt={c.name} onError={(e) => { (e.target as HTMLImageElement).src = '/category-veiculos.jpg'; }} />
              <div className="cat-grid-overlay" />
            </div>
            <div className="cat-grid-content">
              <span className="cat-grid-badge" style={{ background: c.accentColor || '#F5C800', color: c.accentColor === '#F5C800' ? '#000' : '#fff' }}>
                {c.icon || CATEGORY_FALLBACK_ICON[c.slug]}
              </span>
              <span className="cat-grid-title">{c.name}</span>
              {c.description && <span className="cat-grid-subtitle">{c.description}</span>}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ onLeadClick }: { onLeadClick: () => void }) {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 12 }}>
              <div className="logo-mark">TM</div>
              <span className="logo-name">TODO <span>MOTOR</span></span>
            </div>
            <p className="footer-brand-text">
              O maior marketplace de veículos, máquinas agrícolas, barcos e aeronaves do Brasil.
              Compre, venda e negocie com segurança.
            </p>
          </div>
          <div>
            <div className="footer-col-title">Categorias</div>
            {['Veículos', 'Barcos', 'Aeronaves', 'Agrícola'].map(n => (
              <a key={n} href="#" className="footer-link">{n}</a>
            ))}
          </div>
          <div>
            <div className="footer-col-title">Mais</div>
            {['Terraplenagem', 'Transporte Pesado', 'Drones', 'Eventos'].map(n => (
              <a key={n} href="#" className="footer-link">{n}</a>
            ))}
          </div>
          <div>
            <div className="footer-col-title">Anuncie</div>
            <button onClick={onLeadClick} className="footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              Quero Anunciar
            </button>
            <Link href="/admin" className="footer-link">Painel Administrativo</Link>
            <a href="mailto:comercial@todomotor.com.br" className="footer-link">comercial@todomotor.com.br</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Todo Motor. Todos os direitos reservados.</span>
          <span>Blog de notícias especializadas</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [posts] = useState<Post[]>(DEMO_POSTS);
  const [categories] = useState<Category[]>(DEMO_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadSource, setLeadSource] = useState('');
  const [mounted, setMounted] = useState(false);
  const bannerInsertedAt = 3; // Insert lead banner after N posts

  useEffect(() => { setMounted(true); }, []);

  // Exit intent detection
  useEffect(() => {
    if (!mounted) return;
    let fired = false;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 5 && !fired) {
        fired = true;
        setTimeout(() => {
          setLeadSource('exit-intent');
          setLeadModalOpen(true);
        }, 300);
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [mounted]);

  function openLead(source: string) {
    setLeadSource(source);
    setLeadModalOpen(true);
  }

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const filteredPosts = posts.filter(p => {
    if (selectedCategory !== null && p.categoryId !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
    }
    return true;
  });

  const heroPost = posts[0];

  return (
    <>
      <Header onLeadClick={() => openLead('header')} />
      <Ticker posts={posts} />
      <Hero featuredPost={heroPost} onLeadClick={() => openLead('hero')} />
      <CategoryNav categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      <main id="noticias">
        <div className="main-inner">
          {/* Search bar */}
          <div className="search-bar">
            <input
              type="search"
              id="search-input"
              placeholder="🔍 Buscar notícias (ex: New Holland, Scania, ANAC...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Buscar notícias"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Limpar busca">✕</button>
            )}
          </div>

          <div className="main-grid">
            {/* Posts column */}
            <div>
              <h2 className="section-title">
                {selectedCategory
                  ? `${categoryMap.get(selectedCategory)?.icon || ''} ${categoryMap.get(selectedCategory)?.name || 'Categoria'}`
                  : '🗞️ Últimas Notícias'}
              </h2>

              {filteredPosts.length === 0 ? (
                <div className="empty-state">
                  <span style={{ fontSize: 64 }}>🔍</span>
                  <p>Nenhuma notícia encontrada para "{searchQuery || 'esta categoria'}".</p>
                </div>
              ) : (
                <div className="posts-grid">
                  {filteredPosts.map((post, idx) => (
                    <React.Fragment key={post.id}>
                      <PostCard post={post} category={categoryMap.get(post.categoryId)} />
                      {/* Insert lead banner after N posts */}
                      {idx === bannerInsertedAt - 1 && (
                        <LeadBanner onLeadClick={() => openLead('banner-posts')} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Category grid below posts */}
              {!selectedCategory && !searchQuery && (
                <CategoryGrid categories={categories} onSelect={setSelectedCategory} />
              )}

              {/* Bottom lead CTA */}
              <div className="bottom-cta" id="bottom-cta">
                <h2>Tem algo para anunciar no Todo Motor?</h2>
                <p>Veículos, máquinas agrícolas, barcos, aeronaves ou equipamentos de terraplenagem.</p>
                <button className="btn-yellow btn-large" onClick={() => openLead('bottom-cta')} id="bottom-cta-btn">
                  📢 Falar com Nossa Equipe Comercial
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <Sidebar
              categories={categories}
              recentPosts={posts}
              onLeadClick={() => openLead('sidebar')}
            />
          </div>
        </div>
      </main>

      <Footer onLeadClick={() => openLead('footer')} />

      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        source={leadSource}
      />
    </>
  );
}
