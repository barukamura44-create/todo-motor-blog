'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

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

const DEMO_CATEGORIES: Category[] = [
  { id: 1, name: 'Veículos', slug: 'veiculos', icon: '🚗', accentColor: '#F5C800' },
  { id: 2, name: 'Barcos', slug: 'barcos', icon: '⛵', accentColor: '#0066CC' },
  { id: 3, name: 'Aeronaves', slug: 'aeronaves', icon: '✈️', accentColor: '#6B48FF' },
  { id: 4, name: 'Máquinas Agrícolas', slug: 'agricola', icon: '🌾', accentColor: '#22C55E' },
  { id: 5, name: 'Terraplenagem', slug: 'terraplenagem', icon: '🏗️', accentColor: '#F97316' },
  { id: 6, name: 'Transporte Pesado', slug: 'transportes-pesados', icon: '🚛', accentColor: '#EF4444' },
  { id: 7, name: 'Lançamentos', slug: 'lancamentos', icon: '🚀', accentColor: '#EC4899' },
  { id: 8, name: 'Eventos', slug: 'eventos', icon: '📅', accentColor: '#8B5CF6' },
  { id: 9, name: 'Jet Ski', slug: 'jetski', icon: '🌊', accentColor: '#06B6D4' },
  { id: 10, name: 'Drones', slug: 'drones', icon: '🛸', accentColor: '#10B981' },
  { id: 11, name: 'Helicópteros', slug: 'helicopteros', icon: '🚁', accentColor: '#6366F1' },
];

function formatDate(date?: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function renderContent(content: string) {
  if (!content) return null;
  return content.split('\n\n').map((paragraph, index) => {
    if (paragraph.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold my-4">{paragraph.replace('## ', '')}</h2>;
    }
    return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
  });
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : '';
  const text = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="article-share-row flex gap-2 my-4">
      <a
        href={`https://wa.me/?text=${text}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ padding: '6px 12px', background: '#25D366', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '13px' }}
      >
        💬 WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ padding: '6px 12px', background: '#1DA1F2', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontSize: '13px' }}
      >
        🐦 Twitter / X
      </a>
      <button
        onClick={handleCopy}
        style={{ padding: '6px 12px', background: '#333', color: '#fff', borderRadius: '4px', border: 'none', fontSize: '13px', cursor: 'pointer' }}
      >
        🔗 Copiar Link
      </button>
    </div>
  );
}

function LeadSection({ onLeadClick }: { onLeadClick: () => void }) {
  return (
    <div className="article-lead-cta" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', marginTop: '30px', border: '1px solid #333' }}>
      <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '18px' }}>Quer anunciar seus produtos ou serviços?</h3>
      <p style={{ color: '#aaa', margin: '0 0 16px 0', fontSize: '14px' }}>
        Conecte sua marca a milhares de profissionais e compradores do mercado automotivo, pesados e agrícolas.
      </p>
      <button
        onClick={onLeadClick}
        style={{ background: '#F5C800', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
      >
        Anuncie no Todo Motor
      </button>
    </div>
  );
}

export default function PostDetailClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post>(DEMO_POST);
  const [category, setCategory] = useState<Category>(DEMO_CATEGORY);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/posts?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.post) {
          setPost(data.post);
          const cat = DEMO_CATEGORIES.find(c => c.id === data.post.categoryId) || DEMO_CATEGORY;
          setCategory(cat);
        }
      })
      .catch(() => {});
  }, [slug]);

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
