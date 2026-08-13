'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryId: number;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
  tags?: string | null;
  sourceUrl?: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  accentColor?: string | null;
}

const CATEGORY_ACCENT: Record<string, string> = {
  veiculos: '#F5C800', barcos: '#0066CC', aeronaves: '#6B48FF',
  agricola: '#22C55E', terraplenagem: '#F97316', 'transportes-pesados': '#EF4444',
  lancamentos: '#EC4899', eventos: '#8B5CF6', jetski: '#06B6D4',
  drones: '#10B981', helicopteros: '#6366F1',
};

// Demo data — replace with real fetch in production
const DEMO_POST: Post = {
  id: 1,
  title: 'New Holland lança nova colheitadeira T6 com câmbio automático revolucionário',
  slug: 'new-holland-t6-cambio',
  excerpt: 'Fabricante apresenta tecnologia exclusiva que aumenta produtividade em até 22% em condições adversas.',
  coverImage: '/category-agricola.jpg',
  content: `
A New Holland Agriculture acaba de revelar a nova colheitadeira série T6, equipada com um câmbio automático de 24 marchas desenvolvido exclusivamente para o mercado brasileiro. O lançamento aconteceu durante a Agrishow em Ribeirão Preto, SP, reunindo mais de 3.000 visitantes no estande da marca.

## Tecnologia que transforma o campo

O sistema CVT (Continuously Variable Transmission) adaptado para condições brasileiras permite que o operador mantenha a velocidade ideal de colheita independentemente das variações de inclinação do terreno. Em testes realizados no Mato Grosso, a produtividade aumentou em média **22% em terrenos irregulares**.

"O produtor brasileiro precisa de equipamentos que trabalhem na mesma intensidade que ele. A T6 foi desenvolvida ouvindo os nossos clientes do Cerrado, do Pampa e da Amazônia Legal," afirmou Paulo Herrmann, diretor comercial da New Holland para o Brasil.

## Especificações técnicas

- **Motor**: FPT N67 de 6 cilindros, 175 CV
- **Câmbio**: CVT automático de 24 marchas
- **Cabine**: Totalmente pressurizada com filtro de carvão ativado
- **Tecnologia**: Conectividade PLM (Precision Land Management)
- **Autonomia**: Tanque de 310 litros com consumo 15% menor
- **Preço sugerido**: A partir de R$ 620.000

## Disponibilidade e financiamento

A colheitadeira já está disponível para encomenda em toda a rede de concessionárias New Holland no Brasil. A CNH Financial Services oferece linhas de crédito com taxas especiais para o Plano Safra 2025/2026, com juros a partir de 8% ao ano e entrada de 20%.

## Impacto no mercado

Com a nova T6, a New Holland busca recuperar participação de mercado frente à John Deere e Claas, que juntas respondem por 58% das vendas de colheitadeiras acima de 150 CV no Brasil. A meta da empresa é vender 1.200 unidades até dezembro de 2026.

Para mais informações, acesse o site oficial da New Holland ou visite a concessionária mais próxima.
  `.trim(),
  categoryId: 4,
  publishedAt: new Date(),
  tags: 'New Holland,colheitadeira,T6,agrícola,câmbio automático',
  sourceUrl: null,
};

const DEMO_CATEGORY: Category = {
  id: 4, name: 'Máquinas Agrícolas', slug: 'agricola', icon: '🌾', accentColor: '#22C55E',
};

function formatDate(d?: Date | string | null) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function renderContent(content: string) {
  // Simple markdown-like rendering
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="article-h2">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h3 key={i} className="article-h3">{line.slice(2)}</h3>);
    } else if (line.startsWith('- ')) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        listItems.push(<li key={i}>{lines[i].slice(2)}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="article-ul">{listItems}</ul>);
      continue;
    } else if (line.trim() !== '') {
      // Handle **bold** inline
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={j}>{part.slice(2, -2)}</strong>
          : part
      );
      elements.push(<p key={i} className="article-p">{rendered}</p>);
    }
    i++;
  }
  return elements;
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== 'undefined' ? window.location.href : `https://blog.todomotor.com.br/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function copyLink() {
    navigator.clipboard.writeText(url).catch(() => {});
    alert('Link copiado!');
  }

  return (
    <div className="share-buttons">
      <span className="share-label">Compartilhar:</span>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        className="share-btn share-wa" id="share-whatsapp" aria-label="Compartilhar no WhatsApp">
        💬 WhatsApp
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        className="share-btn share-tw" id="share-twitter" aria-label="Compartilhar no Twitter">
        🐦 Twitter
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer"
        className="share-btn share-li" id="share-linkedin" aria-label="Compartilhar no LinkedIn">
        🔗 LinkedIn
      </a>
      <button className="share-btn share-copy" onClick={copyLink} id="share-copy" aria-label="Copiar link">
        📋 Copiar
      </button>
    </div>
  );
}

function LeadSection({ onLeadClick }: { onLeadClick: () => void }) {
  return (
    <div className="article-lead-cta" style={{ position: 'relative', overflow: 'hidden', padding: '24px' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src="/todo-motor-banner.jpg" alt="Todo Motor Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.85) 100%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', width: '100%', flexWrap: 'wrap' }}>
        <div className="article-lead-content">
          <img src="/todo-motor-banner.jpg" alt="Logo Banner" style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--yellow)', flexShrink: 0 }} />
          <div>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Anuncie na plataforma Todo Motor</h3>
            <p style={{ color: '#ccc', margin: '4px 0 0', fontSize: '13px' }}>Alcance compradores qualificados em todo o Brasil. Veículos, máquinas, barcos e aeronaves.</p>
          </div>
        </div>
        <div className="article-lead-actions">
          <button className="btn-yellow" onClick={onLeadClick} id="article-lead-btn">Quero Anunciar</button>
          <a href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" className="btn-whatsapp" id="article-whatsapp">
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailClient({ slug }: { slug: string }) {
  const [post] = useState<Post>(DEMO_POST);
  const [category] = useState<Category>(DEMO_CATEGORY);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const accent = category.accentColor || CATEGORY_ACCENT[category.slug] || '#F5C800';
  const tags = post.tags ? post.tags.split(',').map(t => t.trim()) : [];

  return (
    <>
      {/* Article header */}
      <div className="article-header" style={{ borderTopColor: accent }}>
        <div className="article-header-inner">
          <Link href="/" className="article-back">← Voltar para Notícias</Link>
          <span className="post-cat" style={{ background: accent, color: accent === '#F5C800' ? '#0D0D0D' : '#fff' }}>
            {category.icon} {category.name}
          </span>
          <h1 className="article-title">{post.title}</h1>
          {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
          <div className="article-meta-row">
            <span className="article-date">📅 {formatDate(post.publishedAt || post.createdAt)}</span>
            {post.sourceUrl && (
              <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="article-source">
                🔗 Fonte original
              </a>
            )}
          </div>
          <ShareButtons title={post.title} slug={post.slug} />
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div className="article-cover">
          <img src={post.coverImage} alt={post.title} />
        </div>
      )}

      {/* Article body */}
      <div className="article-body">
        <div className="article-body-inner">
          <article className="article-content">
            {renderContent(post.content)}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="article-tags">
                {tags.map(tag => (
                  <span key={tag} className="article-tag">{tag}</span>
                ))}
              </div>
            )}

            {/* Share buttons at bottom */}
            <ShareButtons title={post.title} slug={post.slug} />

            {/* Lead CTA */}
            <LeadSection onLeadClick={() => setLeadModalOpen(true)} />
          </article>

          {/* Sidebar */}
          <aside className="article-sidebar">
            <div className="sidebar-block" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '110px' }}>
                <img src="/todo-motor-banner.jpg" alt="Anuncie no Todo Motor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,13,0.9), transparent)' }} />
                <div style={{ position: 'absolute', bottom: '8px', left: '14px', right: '14px' }}>
                  <span className="sidebar-header" style={{ background: 'transparent', padding: 0, color: '#fff', fontSize: '13px' }}>📢 Anuncie Conosco</span>
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <p style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.4 }}>
                  Quer divulgar seus veículos ou máquinas para milhares de compradores?
                </p>
                <button className="btn-yellow" style={{ width: '100%' }} onClick={() => setLeadModalOpen(true)} id="article-sidebar-lead">
                  Falar com Comercial
                </button>
              </div>
            </div>
            <div className="app-cta">
              <div className="app-cta-emoji">🚗</div>
              <div className="app-cta-title">Plataforma Todo Motor</div>
              <p className="app-cta-text">Anuncie seus veículos, máquinas, barcos e aeronaves!</p>
              <button onClick={() => setLeadModalOpen(true)} className="app-cta-btn" id="article-app-btn">
                Anuncie Agora
              </button>
            </div>
          </aside>
        </div>
      </div>

      {leadModalOpen && (
        <div className="lead-modal-overlay" onClick={() => setLeadModalOpen(false)}>
          <div className="lead-modal" onClick={e => e.stopPropagation()}>
            <button className="lead-modal-close" onClick={() => setLeadModalOpen(false)}>✕</button>
            <div className="lead-modal-header" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', height: '130px' }}>
                <img src="/todo-motor-banner.jpg" alt="Todo Motor Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,13,0.95), rgba(13,13,13,0.3))' }} />
                <div style={{ position: 'absolute', bottom: '12px', left: '20px', right: '20px' }}>
                  <span className="lead-modal-badge">🚗 ANUNCIE NO TODO MOTOR</span>
                  <h2 style={{ color: '#fff', fontSize: '22px', margin: 0 }}>Quer anunciar na plataforma?</h2>
                </div>
              </div>
              <div style={{ padding: '10px 20px 14px', background: 'var(--black)' }}>
                <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>Nossa equipe comercial entrará em contato em até 24 horas.</p>
              </div>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <a href="https://wa.me/5500000000000?text=Quero+anunciar+no+Todo+Motor"
                target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-large" style={{ display: 'inline-block' }}>
                💬 Chamar no WhatsApp
              </a>
              <p style={{ marginTop: 16, color: '#888', fontSize: 13 }}>Ou envie um e-mail para comercial@todomotor.com.br</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
